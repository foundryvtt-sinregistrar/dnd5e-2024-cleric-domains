import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ClassicLevel } from "classic-level";
import { CONTENT_FOLDERS, CONTENT_ITEMS } from "../../data/index.mjs";

const packPath = fileURLToPath(new URL("../../packs/classes24", import.meta.url));
await rm(packPath, { recursive: true, force: true });
const db = new ClassicLevel(packPath, { valueEncoding: "json" });
const stats = { compendiumSource: null, duplicateSource: null, coreVersion: "14.368", systemId: "dnd5e", systemVersion: "6.0.3", createdTime: Date.UTC(2026, 9, 3), modifiedTime: Date.UTC(2026, 9, 3), lastModifiedBy: null, exportSource: null };
const operations = [];
for (const source of CONTENT_FOLDERS) operations.push({ type: "put", key: `!folders!${source._id}`, value: { ...structuredClone(source), type: "Item", folder: null, description: "", sorting: "m", flags: {}, _stats: structuredClone(stats) } });
for (const source of CONTENT_ITEMS) {
  const item = structuredClone(source); const effects = item.effects ?? [];
  item.effects = effects.map(effect => effect._id); item.folder ??= null; item.sort ??= 0; item._stats = structuredClone(stats);
  operations.push({ type: "put", key: `!items!${item._id}`, value: item });
  for (const effect of effects) operations.push({ type: "put", key: `!items.effects!${item._id}.${effect._id}`, value: { ...structuredClone(effect), folder: null, _stats: structuredClone(stats) } });
}
await db.batch(operations); await db.close();
console.log(`Pack generated: ${CONTENT_ITEMS.length} Items in ${CONTENT_FOLDERS.length} folders.`);
