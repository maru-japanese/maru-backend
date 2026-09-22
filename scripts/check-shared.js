import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendShared = path.join(root, "shared");
const frontendShared = path.resolve(root, "../maru-frontend/shared");

if (!existsSync(frontendShared)) {
  console.log("Repositório frontend ausente; comparação de shared/ ignorada.");
} else {
  const files = directory => readdirSync(directory, { recursive: true })
    .filter(name => statSync(path.join(directory, name)).isFile()).sort();
  const own = files(backendShared);
  const peer = files(frontendShared);
  const names = new Set([...own, ...peer]);
  const changed = [...names].filter(name => {
    if (!own.includes(name) || !peer.includes(name)) return true;
    return !readFileSync(path.join(backendShared, name)).equals(readFileSync(path.join(frontendShared, name)));
  });
  if (changed.length) {
    console.error(`shared/ divergiu entre frontend e backend: ${changed.slice(0, 10).join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log(`${own.length} arquivos shared/ iguais nos dois repositórios.`);
  }
}
