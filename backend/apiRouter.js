import { VOCABULARY, VOCABULARY_GROUPS } from "../shared/vocabulary.js";
import { EXERCISE_GROUPS } from "../shared/exercises.js";
import { GLOSSARY } from "../shared/glossary.js";
import { DATA, LEVELS, LEVEL_META, CAT_LABEL, CAT_LABEL_SING, KANA, KANA_ROWS, KANA_GROUPS, BUILDER_PATTERNS } from "../shared/content.js";
import { MODULES, LESSONS } from "../shared/curriculum.js";
import { BEGINNER_KANJI, EXPRESSIONS, PARTICLES, SENTENCES, COMBINATIONS } from "../shared/catalog.js";
import { checkPhrase } from "./phraseService.js";
import { readJson, sendJson } from "./http.js";

export async function handleApi(req, res, url, storage, speech, auth, config) {
  const pathname = url.pathname;
  const redirect = (location, cookie) => { res.writeHead(303, { Location: location, "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) }); res.end(); };
  if (pathname === "/api/config" && req.method === "GET") return sendJson(res, 200, config);
  if (pathname === "/api/account" && req.method === "GET") return sendJson(res, 200, auth.status(req));
  if (pathname === "/api/auth/google" && req.method === "GET") {
    try { const login = await auth.begin(); return redirect(login.url, login.cookie); }
    catch { return redirect("/#/settings/login-unavailable"); }
  }
  if (pathname === "/api/auth/google/callback" && req.method === "GET") {
    try { const login = await auth.callback(req, url.searchParams); return redirect("/#/settings/login-success", login.cookies); }
    catch { return redirect("/#/settings/login-failed", auth.failureCookie()); }
  }
  if (pathname === "/api/auth/logout" && req.method === "POST") {
    res.setHeader("Set-Cookie", auth.logout(req));
    return sendJson(res, 200, { ok: true });
  }
  const account = auth.account(req);
  const browserId = req.headers["x-maru-user"] || "default";
  if (typeof browserId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(browserId)) return sendJson(res, 400, { error: "Perfil de navegador inválido." });
  const userId = account ? "account:" + account.id : browserId;
  if (pathname === "/api/audio" && req.method === "POST") {
    const body = await readJson(req);
    if (typeof body.text !== "string" || body.text.length > 500) return sendJson(res, 400, { error: "Escolha um áudio do conteúdo de estudo." });
    return sendJson(res, 200, await speech.prepare(body.text));
  }
  if (pathname === "/api/health" && req.method === "GET") return sendJson(res, 200, { ok: true, name: "maru", version: 2 });
  if (pathname === "/api/content" && req.method === "GET") return sendJson(res, 200, {
    vocabulary: VOCABULARY, vocabularyGroups: VOCABULARY_GROUPS, exerciseGroups: EXERCISE_GROUPS, glossary: GLOSSARY,
    data: DATA, levels: LEVELS, levelMeta: LEVEL_META, catLabel: CAT_LABEL, catLabelSingular: CAT_LABEL_SING,
    kanaRows: KANA_ROWS, kanaGroups: KANA_GROUPS, kana: KANA, builderPatterns: BUILDER_PATTERNS,
    modules: MODULES, lessons: LESSONS, beginnerKanji: BEGINNER_KANJI, expressions: EXPRESSIONS, particles: PARTICLES, sentences: SENTENCES, combinations: COMBINATIONS
  });
  if (pathname === "/api/progress") {
    const expected = req.headers["x-maru-account"];
    if ((expected && expected !== account?.id) || (account && req.method !== "GET" && expected !== account.id)) return sendJson(res, 409, { error: "Sua conta mudou. Recarregue a página para continuar." });
    if (req.method === "GET") return sendJson(res, 200, await storage.read(userId));
    if (["PUT", "POST"].includes(req.method)) {
      auth.assertSameOrigin(req);
      return sendJson(res, 200, await storage.write(await readJson(req), userId));
    }
    return sendJson(res, 405, { error: "Método não permitido." });
  }
  if (pathname === "/api/phrase/check" && req.method === "POST") return sendJson(res, 200, checkPhrase(await readJson(req)));
  return sendJson(res, 404, { error: "Endpoint não encontrado." });
}
