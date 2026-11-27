import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ClassicLevel } from "classic-level";
import { CONTENT_ITEMS } from "../data/index.mjs";

test("Git archives preserve readable LevelDB storage with Windows line endings", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const archive = execFileSync("git", [
    "-c", `safe.directory=${root.replaceAll("\\", "/")}`,
    "-c", "core.autocrlf=true", "archive", "--format=tar", "--worktree-attributes",
    "HEAD", "packs/classes24"
  ], { cwd: root });
  const temporary = await mkdtemp(join(tmpdir(), "foundry-pack-archive-"));
  const pack = join(temporary, "classes24");
  let db;
  try {
    await mkdir(pack);
    for (let offset = 0; offset + 512 <= archive.length;) {
      const header = archive.subarray(offset, offset + 512);
      if (header.every(byte => byte === 0)) break;
      const name = header.toString("utf8", 0, 100).split("\0")[0];
      const size = Number.parseInt(header.toString("ascii", 124, 136).replaceAll("\0", "").trim(), 8);
      const body = archive.subarray(offset + 512, offset + 512 + size);
      offset += 512 + Math.ceil(size / 512) * 512;
      if (![0, 48].includes(header[156]) || !name.startsWith("packs/classes24/")) continue;
      const file = name.slice("packs/classes24/".length);
      assert.equal(file, basename(file), "Pack entries must be direct files");
      await writeFile(join(pack, file), body);
    }
    assert.match(await readFile(join(pack, "CURRENT"), "utf8"), /^MANIFEST-\d+\n$/);
    db = new ClassicLevel(pack, { readOnly: true, valueEncoding: "json" });
    await db.open();
    const keys = await db.keys({ gte: "!items!", lt: "!items!~" }).all();
    assert.deepEqual(keys.map(key => key.slice("!items!".length)).sort(),
      CONTENT_ITEMS.map(item => item._id).sort());
  } finally {
    await db?.close();
    assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep));
    await rm(temporary, { recursive: true, force: true });
  }
});
