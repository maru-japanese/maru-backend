import { mergeSnapshots, normalizeSnapshot } from "../../../shared/progress.js";

function restHeaders(key, method) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    ...(method !== "GET" ? {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    } : {})
  };
}

export function createProgressRepository({ url, serviceKey, fetchImpl = fetch }) {
  if (!url || !serviceKey) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  const base = new URL("/rest/v1/maru_progress", url);

  async function request(method, query, body, prefer) {
    const response = await fetchImpl(base + query, {
      method,
      headers: { ...restHeaders(serviceKey, method), ...(prefer ? { Prefer: prefer } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw Object.assign(new Error("Não foi possível acessar o progresso no Supabase."), { status: 503 });
    return response.json();
  }

  async function row(ownerId) {
    const query = `?owner_id=eq.${encodeURIComponent(ownerId)}&select=snapshot,version&limit=1`;
    return (await request("GET", query))[0] || null;
  }

  return {
    async read(ownerId) {
      const saved = await row(ownerId);
      return saved ? normalizeSnapshot(saved.snapshot) : normalizeSnapshot();
    },
    async write(ownerId, submitted) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const current = await row(ownerId);
        const merged = mergeSnapshots(normalizeSnapshot(submitted), current?.snapshot || {});
        if (!current) {
          const inserted = await request("POST", "", {
            owner_id: ownerId, snapshot: merged, version: 1
          }, "resolution=ignore-duplicates,return=representation");
          if (inserted.length) return merged;
          continue;
        }
        const query = `?owner_id=eq.${encodeURIComponent(ownerId)}&version=eq.${current.version}`;
        const updated = await request("PATCH", query, {
          snapshot: merged, version: current.version + 1, updated_at: new Date().toISOString()
        });
        if (updated.length) return merged;
      }
      throw Object.assign(new Error("O progresso mudou enquanto era salvo. Tente novamente."), { status: 409 });
    }
  };
}
