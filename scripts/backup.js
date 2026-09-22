import Database from "better-sqlite3";
import { mkdir, chmod, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = process.env.MARU_DATA_DIR || fileURLToPath(new URL("../data/progress/", import.meta.url));
const source = path.join(directory, "maru.sqlite");
const destination = path.resolve(process.argv[2] || "backups/maru-" + new Date().toISOString().replace(/[:.]/g, "-") + ".sqlite");
let exists = false;
try { await access(destination); exists = true; } catch {}
if (exists) throw new Error("O destino já existe. Escolha outro nome para preservar a cópia.");
await mkdir(path.dirname(destination), { recursive: true });
const db = new Database(source, { readonly: true, fileMustExist: true });
try {
  // SQLite's online backup API includes committed WAL data consistently.
  await db.backup(destination);
  await chmod(destination, 0o600);
  console.log("Backup concluído: " + destination);
} finally { db.close(); }
