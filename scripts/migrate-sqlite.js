import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProgressRepository } from "../supabase/functions/maru-api/progress.js";

const defaultSource = fileURLToPath(new URL("../data/progress/maru.sqlite", import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const sourceArg = args.find(arg => arg.startsWith("--source="));
if (args.some(arg => arg !== "--apply" && !arg.startsWith("--source="))) {
  throw new Error("Uso: npm run migrate:sqlite -- [--source=/caminho/maru.sqlite] [--apply]");
}

const source = path.resolve(sourceArg?.slice("--source=".length) || defaultSource);
const db = new Database(source, { readonly: true, fileMustExist: true });
let rows;
try {
  rows = db.prepare("SELECT owner_id, snapshot FROM progress ORDER BY owner_id").all();
} finally {
  db.close();
}

const transferable = rows.filter(row => /^browser-[a-f0-9-]{20,60}$/.test(row.owner_id));
console.log(`${rows.length} perfis no SQLite: ${transferable.length} perfis anônimos podem ser migrados automaticamente.`);
if (rows.length !== transferable.length) {
  console.log(`${rows.length - transferable.length} perfis legados ou de conta exigem revisão; nenhum deles será enviado automaticamente.`);
}

if (!apply) {
  console.log("Prévia concluída. Acrescente --apply para enviar os perfis anônimos ao Supabase.");
} else {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const repository = createProgressRepository({ url, serviceKey });
  for (const row of transferable) await repository.write(row.owner_id, JSON.parse(row.snapshot));
  console.log(`${transferable.length} perfis anônimos migrados. O SQLite de origem foi preservado.`);
}
