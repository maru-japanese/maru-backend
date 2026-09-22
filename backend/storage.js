import Database from "better-sqlite3";
import { mkdirSync, chmodSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSnapshot, mergeSnapshots } from "../shared/progress.js";

const defaultDirectory = fileURLToPath(new URL("../data/progress/", import.meta.url));
export function createProgressStorage(directory = process.env.MARU_DATA_DIR || defaultDirectory) {
  mkdirSync(directory, { recursive: true });
  const filename = path.join(directory, "maru.sqlite");
  const db = new Database(filename);
  chmodSync(filename, 0o600);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, google_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL, email TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS oauth_states (
      state_hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, nonce TEXT NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
      owner_id TEXT PRIMARY KEY, snapshot TEXT NOT NULL, updated_at INTEGER NOT NULL
    );
  `);
  const select = db.prepare("SELECT snapshot FROM progress WHERE owner_id = ?");
  const upsert = db.prepare("INSERT INTO progress(owner_id, snapshot, updated_at) VALUES (?, ?, ?) ON CONFLICT(owner_id) DO UPDATE SET snapshot=excluded.snapshot, updated_at=excluded.updated_at");
  const readRow = id => { const row = select.get(id); return row ? normalizeSnapshot(JSON.parse(row.snapshot)) : null; };
  const write = db.transaction((snapshot, id) => {
    const merged = mergeSnapshots(normalizeSnapshot(snapshot), readRow(id) || {});
    upsert.run(id, JSON.stringify(merged), merged.updatedAt);
    return merged;
  });
  return {
    db, filename,
    async read(userId = "default") {
      const id = String(userId);
      const saved = readRow(id);
      if (saved) return saved;
      // Import each existing anonymous JSON profile once; never delete the original.
      if (!id.startsWith("account:")) {
        const legacyId = id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "default";
        try {
          const legacy = JSON.parse(await fs.readFile(path.join(directory, legacyId + ".json"), "utf8"));
          return write(legacy, id);
        } catch (error) { if (error.code !== "ENOENT") throw error; }
      }
      return normalizeSnapshot();
    },
    async write(snapshot, userId = "default") {
      await this.read(userId);
      return write(snapshot, String(userId));
    },
    backup(destination) { return db.backup(destination); },
    close() { if (db.open) db.close(); }
  };
}
