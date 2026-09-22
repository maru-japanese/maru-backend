import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outfile = path.join(root, "supabase/functions/maru-api/bundle.js");

const result = await build({
  entryPoints: [path.join(root, "supabase/functions/maru-api/index.js")],
  outfile,
  bundle: true,
  platform: "neutral",
  format: "esm",
  target: "es2022",
  minify: true,
  metafile: true
});

console.log(`Edge Function gerada em ${path.relative(root, outfile)} (${Object.values(result.metafile.outputs)[0].bytes} bytes).`);
