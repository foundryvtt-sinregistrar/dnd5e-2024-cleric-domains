export const MODULE_ID = "dnd5e-2024-cleric-domains";
export const CONTENT_VERSION = "1.0.0";
export const PACK_NAME = "classes24";
export const PACK_LABEL = "D&D 2024 SubClasses - Cleric Domains";
export const PACK_COLLECTION = `${MODULE_ID}.${PACK_NAME}`;

export const FOLDER_IDS = Object.freeze({ knowledge: "cl24FolderKnow01", nature: "cl24FolderNatu01", tempest: "cl24FolderTemp01" });
export const CONTENT_FOLDERS = Object.freeze([
  { _id: FOLDER_IDS.knowledge, name: "Knowledge Domain", color: "#3867a8", sort: 100000 },
  { _id: FOLDER_IDS.nature, name: "Nature Domain", color: "#4f8a4b", sort: 200000 },
  { _id: FOLDER_IDS.tempest, name: "Tempest Domain", color: "#5b65b7", sort: 300000 }
]);

const source = { custom: "PHB 2014 adaptation for 2024 Cleric rules", rules: "2024", revision: 1, license: "", book: "" };
export const applyPresentation = (items, folder, images) => Object.freeze(items.map(item => ({ ...item, img: images[item._id], folder })));
export function featureBase({ id, name, level, identifier, description, uses, activities = {}, effects = [] }) {
  return { _id: id, name, type: "feat", system: { description: { value: description, chat: "" }, source: structuredClone(source), uses: uses ?? { max: "", spent: 0, recovery: [] }, type: { value: "class", subtype: "" }, prerequisites: { level, repeatable: false }, properties: [], requirements: "", activities, enchant: {}, identifier }, effects, flags: { dnd5e: { riders: { activity: [], effect: [] } }, [MODULE_ID]: { managed: true, contentVersion: CONTENT_VERSION } }, ownership: { default: 0 } };
}
export function subclassBase({ id, name, identifier, description, advancements }) {
  return { _id: id, name, type: "subclass", system: { description: { value: description, chat: "" }, source: structuredClone(source), identifier, classIdentifier: "cleric", advancement: advancements, spellcasting: { progression: "none", ability: "", preparation: { formula: "" } } }, effects: [], flags: { [MODULE_ID]: { managed: true, contentVersion: CONTENT_VERSION } }, ownership: { default: 0 } };
}
export const itemGrant = ({ id, level, items }) => ({ _id: id, type: "ItemGrant", configuration: { items: items.map(uuid => ({ uuid, optional: false })), optional: false, spell: null }, value: {}, level, title: "Subclass Features" });
export function utilityActivity({ id, activation = "action", activationCondition = "", rangeUnits = "self", rangeSpecial = "", targetType = "self", targetSpecial = "", consumeItemUse = false, name = "" }) {
  return { type: "utility", _id: id, activation: { type: activation, value: null, condition: activationCondition, override: false }, consumption: { targets: consumeItemUse ? [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }] : [], scaling: { allowed: false, max: "" }, spellSlot: true }, description: { chatFlavor: "" }, duration: { concentration: false, value: "", units: "", special: "", override: false }, effects: [], range: { units: rangeUnits, special: rangeSpecial, override: false }, target: { template: { count: "", contiguous: false, type: "", size: "", width: "", height: "", units: "" }, affects: { count: "", type: targetType, choice: false, special: targetSpecial }, prompt: true, override: false }, roll: { formula: "", name: "", prompt: false, visible: false }, uses: { spent: 0, recovery: [] }, sort: 0, name };
}
export function saveActivity({ id, ability, activation = "action", activationCondition = "", rangeUnits = "ft", rangeSpecial = "", targetSpecial = "", consumeItemUse = false, name = "" }) {
  return { type: "save", _id: id, activation: { type: activation, value: null, condition: activationCondition, override: false }, consumption: { targets: consumeItemUse ? [{ type: "itemUses", target: "", value: "1", scaling: { mode: "", formula: "" } }] : [], scaling: { allowed: false, max: "" }, spellSlot: true }, description: { chatFlavor: "" }, duration: { units: "inst", concentration: false, override: false }, effects: [], range: { units: rangeUnits, special: rangeSpecial, override: false }, target: { prompt: true, template: { contiguous: false, units: "ft", type: "" }, affects: { choice: false, count: "1", type: "creature", special: targetSpecial }, override: false }, damage: { onSave: "none", parts: [] }, save: { ability, dc: { calculation: "spellcasting", formula: "" } }, uses: { spent: 0, recovery: [] }, sort: 0, name };
}
