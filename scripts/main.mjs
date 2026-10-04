import { MODULE_ID } from "../data/index.mjs";
import { registerAutomationHooks, registerAutomationSettings } from "./automation/index.mjs";
Hooks.once("init", () => registerAutomationSettings(MODULE_ID));
Hooks.once("setup", () => { if (game.system?.id === "dnd5e") registerAutomationHooks(); });
