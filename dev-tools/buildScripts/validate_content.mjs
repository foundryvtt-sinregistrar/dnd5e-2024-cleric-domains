import { access, cp, mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ClassicLevel } from "classic-level";
import { CONTENT_FOLDERS, CONTENT_ITEMS, MODULE_ID, PACK_COLLECTION } from "../../data/index.mjs";

const errors = [];
const ids = new Set(CONTENT_ITEMS.map(item => item._id));
const folderIds = new Set(CONTENT_FOLDERS.map(folder => folder._id));
const expectedPrefix = `Compendium.${PACK_COLLECTION}.Item.`;

if (CONTENT_ITEMS.length !== 19) errors.push(`Expected 19 Items; found ${CONTENT_ITEMS.length}.`);
if (ids.size !== CONTENT_ITEMS.length) errors.push("Duplicate Item IDs.");
if (CONTENT_FOLDERS.length !== 3 || folderIds.size !== 3) errors.push("Expected three unique folders.");

for (const folder of CONTENT_FOLDERS) {
  if (!/^[A-Za-z0-9]{16}$/.test(folder._id)) errors.push(`${folder.name}: invalid Folder ID.`);
}

for (const item of CONTENT_ITEMS) {
  if (!/^[A-Za-z0-9]{16}$/.test(item._id)) errors.push(`${item.name}: invalid Item ID.`);
  if (!["feat", "subclass"].includes(item.type)) errors.push(`${item.name}: invalid Item type.`);
  if (!item.img) errors.push(`${item.name}: missing image.`);
  if (!folderIds.has(item.folder)) errors.push(`${item.name}: invalid folder.`);
  if (item.system?.source?.rules !== "2024") errors.push(`${item.name}: missing 2024 source.`);

  const effectIds = new Set((item.effects ?? []).map(effect => effect._id));
  for (const effect of item.effects ?? []) {
    if (!/^[A-Za-z0-9]{16}$/.test(effect._id)) errors.push(`${item.name}: invalid effect ID.`);
  }
  for (const activity of Object.values(item.system?.activities ?? {})) {
    if (!/^[A-Za-z0-9]{16}$/.test(activity._id)) errors.push(`${item.name}: invalid activity ID.`);
    for (const applied of activity.effects ?? []) {
      if (!effectIds.has(applied._id)) errors.push(`${item.name}: activity ${activity._id} references missing effect ${applied._id}.`);
    }
  }

  if (item.img.startsWith(`modules/${MODULE_ID}/`)) {
    const relativePath = item.img.slice(`modules/${MODULE_ID}/`.length);
    await access(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)))
      .catch(() => errors.push(`${item.name}: missing local image ${item.img}.`));
  }

  for (const advancement of item.system?.advancement ?? []) {
    if (advancement.type !== "ItemGrant") continue;
    for (const granted of advancement.configuration?.items ?? []) {
      if (!granted.uuid.startsWith(expectedPrefix)) errors.push(`${item.name}: external or legacy ItemGrant UUID ${granted.uuid}.`);
      const targetId = granted.uuid.slice(expectedPrefix.length);
      if (!ids.has(targetId)) errors.push(`${item.name}: ItemGrant references missing Item ${targetId}.`);
    }
  }
}

const packPath = fileURLToPath(new URL("../../packs/classes24", import.meta.url));
const temporaryRoot = await mkdtemp(join(tmpdir(), "cleric-domains-pack-"));
const temporaryPack = join(temporaryRoot, "classes24");
await cp(packPath, temporaryPack, { recursive: true });
const db = new ClassicLevel(temporaryPack, { valueEncoding: "json", readOnly: true });
const packedItems = new Map();
const packedFolders = new Set();
const packedEffects = new Map();

for await (const [key, value] of db.iterator({ gte: "!items!", lt: "!items!~" })) {
  packedItems.set(String(key).slice("!items!".length), value);
}
for await (const [key] of db.iterator({ gte: "!folders!", lt: "!folders!~" })) {
  packedFolders.add(String(key).slice("!folders!".length));
}
for await (const [key, value] of db.iterator({ gte: "!items.effects!", lt: "!items.effects!~" })) {
  packedEffects.set(String(key).slice("!items.effects!".length), value);
}
await db.close();
await rm(temporaryRoot, { recursive: true, force: true });

if (packedItems.size !== CONTENT_ITEMS.length) errors.push(`Pack contains ${packedItems.size} Items; expected ${CONTENT_ITEMS.length}.`);
for (const id of ids) if (!packedItems.has(id)) errors.push(`Pack is missing Item ${id}.`);
for (const id of packedItems.keys()) if (!ids.has(id)) errors.push(`Pack contains unexpected Item ${id}.`);
if (packedFolders.size !== CONTENT_FOLDERS.length) errors.push(`Pack contains ${packedFolders.size} folders; expected ${CONTENT_FOLDERS.length}.`);
for (const id of folderIds) if (!packedFolders.has(id)) errors.push(`Pack is missing folder ${id}.`);
for (const id of packedFolders) if (!folderIds.has(id)) errors.push(`Pack contains unexpected folder ${id}.`);

for (const source of CONTENT_ITEMS) {
  const expected = structuredClone(source);
  const effects = expected.effects ?? [];
  expected.effects = effects.map(effect => effect._id);
  expected.folder ??= null;
  expected.sort ??= 0;

  const actual = structuredClone(packedItems.get(source._id));
  delete actual?._stats;
  if (!isDeepStrictEqual(actual, expected)) errors.push(`${source.name}: packed Item differs from data source.`);

  for (const effect of effects) {
    const packedEffect = structuredClone(packedEffects.get(`${source._id}.${effect._id}`));
    if (!packedEffect) {
      errors.push(`${source.name}: pack is missing Active Effect ${effect._id}.`);
      continue;
    }
    delete packedEffect._stats;
    const expectedEffect = structuredClone(effect);
    expectedEffect.folder ??= null;
    if (!isDeepStrictEqual(packedEffect, expectedEffect)) {
      errors.push(`${source.name}: packed Active Effect ${effect._id} differs from data source.`);
    }
  }
}

const expectedEffectCount = CONTENT_ITEMS.reduce((total, item) => total + (item.effects?.length ?? 0), 0);
if (packedEffects.size !== expectedEffectCount) {
  errors.push(`Pack contains ${packedEffects.size} Active Effects; expected ${expectedEffectCount}.`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Validation passed: 19 Items, folders, activities, Active Effects, sources, and ItemGrant links are synchronized.");
}
