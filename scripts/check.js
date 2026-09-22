import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

let count = 0;
for (const root of ["backend", "shared", "scripts", "supabase/functions/maru-api"]) {
  for (const file of readdirSync(root, { recursive: true }).filter(file => file.endsWith(".js"))) {
    execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "pipe" });
    count++;
  }
}
console.log(count + " módulos JavaScript válidos.");
