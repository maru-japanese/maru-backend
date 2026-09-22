import { VOCABULARY, VOCABULARY_GROUPS } from "../../../shared/vocabulary.js";
import { EXERCISE_GROUPS } from "../../../shared/exercises.js";
import { GLOSSARY } from "../../../shared/glossary.js";
import { DATA, LEVELS, LEVEL_META, CAT_LABEL, CAT_LABEL_SING, KANA, KANA_ROWS, KANA_GROUPS, BUILDER_PATTERNS } from "../../../shared/content.js";
import { MODULES, LESSONS } from "../../../shared/curriculum.js";
import { BEGINNER_KANJI, EXPRESSIONS, PARTICLES, SENTENCES, COMBINATIONS } from "../../../shared/catalog.js";
import { createSpeechService } from "../../../backend/speechService.js";
import { checkPhrase } from "../../../backend/phraseService.js";
import { publicConfig } from "../../../backend/siteConfig.js";
import { createProgressRepository } from "./progress.js";
import { createAuth } from "./auth.js";

function json(status, body, cookies = [], retryAfter = 0) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  for (const value of cookies) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify(body), { status, headers });
}

function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const value of cookies) headers.append("Set-Cookie", value);
  return new Response(null, { status: 303, headers });
}

async function readJson(request) {
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 1_000_000) {
    throw Object.assign(new Error("Conteúdo muito grande."), { status: 413 });
  }
  try {
    const value = JSON.parse(body || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw Object.assign(new Error("Envie um objeto JSON válido."), { status: 400 });
  }
}

const content = {
  vocabulary: VOCABULARY, vocabularyGroups: VOCABULARY_GROUPS, exerciseGroups: EXERCISE_GROUPS, glossary: GLOSSARY,
  data: DATA, levels: LEVELS, levelMeta: LEVEL_META, catLabel: CAT_LABEL, catLabelSingular: CAT_LABEL_SING,
  kanaRows: KANA_ROWS, kanaGroups: KANA_GROUPS, kana: KANA, builderPatterns: BUILDER_PATTERNS,
  modules: MODULES, lessons: LESSONS, beginnerKanji: BEGINNER_KANJI, expressions: EXPRESSIONS,
  particles: PARTICLES, sentences: SENTENCES, combinations: COMBINATIONS
};

export function createMaruHandler({ repository, auth, speech, config = { support: [] } }) {
  return async function handle(request) {
    const url = new URL(request.url);
    const apiPosition = url.pathname.indexOf("/api/");
    const pathname = apiPosition >= 0 ? url.pathname.slice(apiPosition) : url.pathname;
    let cookies = [];
    try {
      if (pathname === "/api/health" && request.method === "GET") return json(200, { ok: true, name: "maru", version: 2 });
      if (pathname === "/api/content" && request.method === "GET") return json(200, content);
      if (pathname === "/api/config" && request.method === "GET") return json(200, config);
      if (pathname === "/api/auth/google" && request.method === "GET") {
        try {
          const login = await auth.begin();
          return redirect(login.url, login.cookies);
        } catch {
          return redirect("/#/settings/login-unavailable");
        }
      }
      if (pathname === "/api/auth/google/callback" && request.method === "GET") {
        try {
          const login = await auth.callback(request, url.searchParams);
          return redirect("/#/settings/login-success", login.cookies);
        } catch {
          return redirect("/#/settings/login-failed", auth.failureCookies());
        }
      }

      const session = await auth.session(request);
      cookies = session.cookies;
      if (pathname === "/api/account" && request.method === "GET") {
        return json(200, { user: session.user, googleEnabled: auth.googleEnabled }, cookies);
      }
      if (pathname === "/api/auth/logout" && request.method === "POST") {
        return json(200, { ok: true }, await auth.logout(request, session.access));
      }

      const browserId = request.headers.get("x-maru-user") || "";
      if (!session.user && !/^browser-[a-f0-9-]{20,60}$/.test(browserId)) {
        return json(400, { error: "Perfil de navegador inválido." }, cookies);
      }
      const ownerId = session.user ? "account:" + session.user.id : browserId;

      if (pathname === "/api/progress") {
        const expected = request.headers.get("x-maru-account");
        if ((expected && expected !== session.user?.id) || (session.user && request.method !== "GET" && expected !== session.user.id)) {
          return json(409, { error: "Sua conta mudou. Recarregue a página para continuar." }, cookies);
        }
        if (request.method === "GET") return json(200, await repository.read(ownerId), cookies);
        if (request.method === "PUT" || request.method === "POST") {
          auth.assertSameOrigin(request);
          return json(200, await repository.write(ownerId, await readJson(request)), cookies);
        }
        return json(405, { error: "Método não permitido." }, cookies);
      }
      if (pathname === "/api/phrase/check" && request.method === "POST") {
        return json(200, checkPhrase(await readJson(request)), cookies);
      }
      if (pathname === "/api/audio" && request.method === "POST") {
        const body = await readJson(request);
        if (typeof body.text !== "string" || body.text.length > 500) {
          return json(400, { error: "Escolha um áudio do conteúdo de estudo." }, cookies);
        }
        return json(200, await speech.prepare(body.text), cookies);
      }
      return json(404, { error: "Endpoint não encontrado." }, cookies);
    } catch (error) {
      return json(error.status || 500, {
        error: error.status ? error.message : "Não foi possível concluir a solicitação.",
        ...(error.retryAfter ? { retryAfter: error.retryAfter } : {})
      }, cookies, error.retryAfter);
    }
  };
}

function environment() {
  const get = key => globalThis.Deno?.env.get(key) || globalThis.process?.env[key] || "";
  return {
    SUPABASE_URL: get("SUPABASE_URL"),
    SUPABASE_ANON_KEY: get("SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: get("SUPABASE_SERVICE_ROLE_KEY"),
    MARU_PUBLIC_ORIGIN: get("MARU_PUBLIC_ORIGIN"),
    MARU_GOOGLE_ENABLED: get("MARU_GOOGLE_ENABLED"),
    TTS_QUEST_API_KEY: get("TTS_QUEST_API_KEY"),
    MARU_SUPPORT_BR_URL: get("MARU_SUPPORT_BR_URL"),
    MARU_SUPPORT_GLOBAL_URL: get("MARU_SUPPORT_GLOBAL_URL")
  };
}

if (typeof Deno !== "undefined") {
  const env = environment();
  const handler = createMaruHandler({
    repository: createProgressRepository({ url: env.SUPABASE_URL, serviceKey: env.SUPABASE_SERVICE_ROLE_KEY }),
    auth: createAuth({
      supabaseUrl: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY,
      publicOrigin: env.MARU_PUBLIC_ORIGIN, googleEnabled: env.MARU_GOOGLE_ENABLED === "true"
    }),
    speech: createSpeechService({ key: env.TTS_QUEST_API_KEY }),
    config: publicConfig(env)
  });
  Deno.serve(handler);
}
