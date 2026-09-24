import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createProgressStorage } from "../backend/storage.js";

test("SQLite imports legacy JSON once, merges history and creates a restorable backup", async t => {
  const directory = await mkdtemp(path.join(tmpdir(), "maru-sqlite-"));
  const storage = createProgressStorage(directory);
  t.after(async () => { storage.close(); await rm(directory, { recursive: true, force: true }); });

  const legacy = { xp: { total: 70 }, lessons: { welcome: { completedAt: 10 } }, preferences: { theme: "arcade" }, updatedAt: 10 };
  await writeFile(path.join(directory, "browser-old.json"), JSON.stringify(legacy));
  assert.equal((await storage.read("browser-old")).xp.total, 70);
  await storage.write({ xp: { total: 90 }, lessons: { sounds: { completedAt: 20 } }, updatedAt: 20 }, "browser-old");
  assert.equal((await storage.read("browser-old")).xp.total, 90);
  assert.equal(Object.keys((await storage.read("browser-old")).lessons).length, 2);
  assert.deepEqual(JSON.parse(await readFile(path.join(directory, "browser-old.json"), "utf8")), legacy);
  assert.equal((await storage.read("someone-else")).xp.total, 0);

  const backup = path.join(directory, "backup.sqlite");
  await storage.backup(backup);
  const Database = (await import("better-sqlite3")).default;
  const copy = new Database(backup, { readonly: true });
  assert.equal(copy.pragma("integrity_check", { simple: true }), "ok");
  assert.equal(JSON.parse(copy.prepare("SELECT snapshot FROM progress WHERE owner_id=?").get("browser-old").snapshot).xp.total, 90);
  copy.close();
});
