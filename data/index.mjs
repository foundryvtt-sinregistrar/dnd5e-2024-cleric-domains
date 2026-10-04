export { MODULE_ID, CONTENT_VERSION, PACK_NAME, PACK_LABEL, PACK_COLLECTION, CONTENT_FOLDERS, FOLDER_IDS } from "./common.mjs";
import { KNOWLEDGE_ITEMS } from "./knowledge.mjs";
import { NATURE_ITEMS } from "./nature.mjs";
import { TEMPEST_ITEMS } from "./tempest.mjs";
import { applyEnglishPresentation } from "./english.mjs";
export const CONTENT_ITEMS = applyEnglishPresentation([...KNOWLEDGE_ITEMS, ...NATURE_ITEMS, ...TEMPEST_ITEMS]);
