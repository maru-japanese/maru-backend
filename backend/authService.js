import { randomBytes, randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

const hash = token => createHash("sha256").update(token).digest("hex");
const random = () => randomBytes(32).toString("base64url");
const SESSION_AGE = 30 * 86400;
const same = (a, b) => typeof a === "string" && typeof b === "string" && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map(part => { const i = part.indexOf("="); return i > 0 ? [part.slice(0, i).trim(), part.slice(i + 1)] : ["", ""]; }));
}
export function createAuthService(storage, { origin = process.env.MARU_PUBLIC_ORIGIN || "http://127.0.0.1:" + (process.env.PORT || "5173"), clientId = process.env.GOOGLE_CLIENT_ID || "", clientSecret = process.env.GOOGLE_CLIENT_SECRET || "", client, now = Date.now } = {}) {
  const site = new URL(origin);
  if (site.pathname !== "/" || site.search || site.hash || site.username || site.password || !["http:", "https:"].includes(site.protocol)) throw new Error("MARU_PUBLIC_ORIGIN deve conter somente a origem do site.");
  if (site.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(site.hostname)) throw new Error("O login requer HTTPS fora do ambiente local.");
  const enabled = Boolean(clientId && clientSecret && storage.db);
  const oauth = client || new OAuth2Client({
    clientId, clientSecret, redirectUri: site.origin + "/api/auth/google/callback",
    transporterOptions: { timeout: 15000, retry: false }
  });
  const db = storage.db;
  const cookie = (name, value, age) => name + "=" + value + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + age + (site.protocol === "https:" ? "; Secure" : "");
  const clear = () => cookie("maru_session", "", 0);
  const account = req => {
    const token = cookies(req).maru_session;
    if (!db || !/^[\w-]{43}$/.test(token || "")) return null;
    return db.prepare("SELECT users.id, users.name, users.email FROM sessions JOIN users ON sessions.user_id=users.id WHERE sessions.token_hash=? AND sessions.expires_at>?").get(hash(token), now()) || null;
  };
  return {
    enabled, origin: site.origin, account,
    status(req) { return { user: account(req), googleEnabled: enabled }; },
    assertSameOrigin(req) {
      const originHeader = req.headers.origin;
      if (req.headers["sec-fetch-site"] === "cross-site" || (originHeader && originHeader !== site.origin)) throw Object.assign(new Error("Recarregue o Maru antes de continuar."), { status: 403 });
    },
    async begin() {
      if (!enabled) throw Object.assign(new Error("O login ainda não foi ativado neste Maru."), { status: 503 });
      db.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").run(now());
      db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now());
      if (db.prepare("SELECT count(*) AS count FROM oauth_states").get().count >= 1000) throw Object.assign(new Error("Muitas tentativas de login. Tente novamente em alguns minutos."), { status: 429 });
      const state = random(), nonce = random();
      const { codeVerifier, codeChallenge } = await oauth.generateCodeVerifierAsync();
      db.prepare("INSERT INTO oauth_states VALUES (?, ?, ?, ?)").run(hash(state), codeVerifier, nonce, now() + 600000);
      return {
        url: oauth.generateAuthUrl({ scope: ["openid", "email", "profile"], state, nonce, code_challenge: codeChallenge, code_challenge_method: "S256", prompt: "select_account" }),
        cookie: cookie("maru_oauth", state, 600)
      };
    },
    async callback(req, params) {
      if (!enabled) throw new Error("Login indisponível.");
      const state = params.get("state");
      if (!/^[\w-]{43}$/.test(state || "") || !same(state, cookies(req).maru_oauth)) throw new Error("Sessão de login inválida.");
      const pending = db.transaction(() => {
        const row = db.prepare("SELECT * FROM oauth_states WHERE state_hash=?").get(hash(state));
        db.prepare("DELETE FROM oauth_states WHERE state_hash=?").run(hash(state));
        return row;
      })();
      const code = params.get("code");
      if (!pending || pending.expires_at <= now() || !code || code.length > 4096 || params.has("error")) throw new Error("Login cancelado ou expirado.");
      const { tokens } = await oauth.getToken({ code, codeVerifier: pending.verifier });
      if (!tokens.id_token) throw new Error("Identidade não recebida.");
      const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email_verified || !payload.email || !same(payload.nonce, pending.nonce)) throw new Error("Identidade não confirmada.");
      const user = db.transaction(() => {
        const id = db.prepare("SELECT id FROM users WHERE google_id=?").get(payload.sub)?.id || randomUUID();
        db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?) ON CONFLICT(google_id) DO UPDATE SET name=excluded.name,email=excluded.email")
          .run(id, payload.sub, String(payload.name || "Estudante").slice(0, 100), String(payload.email).slice(0, 254), now());
        return db.prepare("SELECT id, name, email FROM users WHERE id=?").get(id);
      })();
      const token = random();
      db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(hash(token), user.id, now() + SESSION_AGE * 1000);
      // Discard Google's access and ID tokens after identity verification.
      return { user, cookies: [cookie("maru_session", token, SESSION_AGE), cookie("maru_oauth", "", 0)] };
    },
    failureCookie() { return cookie("maru_oauth", "", 0); },
    logout(req) {
      this.assertSameOrigin(req);
      const token = cookies(req).maru_session;
      if (token && db) db.prepare("DELETE FROM sessions WHERE token_hash=?").run(hash(token));
      return clear();
    }
  };
}
