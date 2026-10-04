import { MODULE_ID } from "../../data/index.mjs";
import { AUTOMATION_SETTING } from "./constants.mjs";
export const automationEnabled = () => game.settings.get(MODULE_ID, AUTOMATION_SETTING);
export const featureIs = (activity, identifier) => activity?.item?.system?.identifier === identifier;
export const selectedTarget = () => Array.from(game.user?.targets ?? [])[0]?.actor ?? null;
export async function message(actor, title, body) { if (globalThis.ChatMessage?.implementation) await ChatMessage.implementation.create({ speaker: ChatMessage.implementation.getSpeaker({ actor }), content: `<section class="dnd5e chat-card"><header class="card-header flexrow"><h3>${title}</h3></header><div class="card-content"><p>${body}</p></div></section>` }); }
