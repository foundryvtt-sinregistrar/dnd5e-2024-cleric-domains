import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ClassicLevel } from "classic-level";
import { CONTENT_FOLDERS, CONTENT_ITEMS, MODULE_ID, PACK_COLLECTION } from "../../data/index.mjs";

const errors = []; const ids = new Set(CONTENT_ITEMS.map(item => item._id)); const folderIds = new Set(CONTENT_FOLDERS.map(folder => folder._id)); const prefix = `Compendium.${PACK_COLLECTION}.Item.`;
if (CONTENT_ITEMS.length !== 19) errors.push(`Expected 19 Items; found ${CONTENT_ITEMS.length}.`);
if (ids.size !== CONTENT_ITEMS.length) errors.push("Duplicate Item IDs.");
if (CONTENT_FOLDERS.length !== 3 || folderIds.size !== 3) errors.push("Expected three unique folders.");
for (const folder of CONTENT_FOLDERS) if (!/^[A-Za-z0-9]{16}$/.test(folder._id)) errors.push(`${folder.name}: invalid Folder ID.`);
for (const item of CONTENT_ITEMS) {
  if (!/^[A-Za-z0-9]{16}$/.test(item._id)) errors.push(`${item.name}: invalid Item ID.`);
  if (!['feat', 'subclass'].includes(item.type) || !item.img || !folderIds.has(item.folder)) errors.push(`${item.name}: invalid type, image, or folder.`);
  if (item.system?.source?.rules !== '2024') errors.push(`${item.name}: missing 2024 source.`);
  if (item.img.startsWith(`modules/${MODULE_ID}/`)) await access(fileURLToPath(new URL(`../../${item.img.slice(`modules/${MODULE_ID}/`.length)}`, import.meta.url))).catch(() => errors.push(`${item.name}: missing local image.`));
  for (const activity of Object.values(item.system?.activities ?? {})) if (!/^[A-Za-z0-9]{16}$/.test(activity._id)) errors.push(`${item.name}: invalid activity ID.`);
  for (const advancement of item.system?.advancement ?? []) for (const granted of advancement.configuration?.items ?? []) { if (!granted.uuid.startsWith(prefix) || !ids.has(granted.uuid.slice(prefix.length))) errors.push(`${item.name}: invalid ItemGrant target.`); }
}
const packPath = fileURLToPath(new URL("../../packs/classes24", import.meta.url));
const db = new ClassicLevel(packPath, { valueEncoding: "json", readOnly: true }); const packed = new Set(); const folders = new Set();
for await (const [key] of db.iterator({ gte: "!items!", lt: "!items!~" })) packed.add(String(key).slice(7));
for await (const [key] of db.iterator({ gte: "!folders!", lt: "!folders!~" })) folders.add(String(key).slice(9)); await db.close();
if (packed.size !== CONTENT_ITEMS.length || [...ids].some(id => !packed.has(id))) errors.push("Pack Items are not synchronized with data.");
if (folders.size !== CONTENT_FOLDERS.length || [...folderIds].some(id => !folders.has(id))) errors.push("Pack folders are not synchronized with data.");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; } else console.log("Validation passed: 19 Items, folders, activities, and ItemGrant links are valid.");
