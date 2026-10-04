import { AUTOMATION_SETTING, FEATURES } from "./constants.mjs";
import { automationEnabled, featureIs, message, selectedTarget } from "./utils.mjs";
export function registerAutomationSettings(MODULE_ID) { game.settings.register(MODULE_ID, AUTOMATION_SETTING, { name: "Automatización de rasgos de dominio", hint: "Añade comprobaciones y mensajes de ayuda para los rasgos compatibles.", scope: "world", config: true, type: Boolean, default: true, requiresReload: true }); }
export function registerAutomationHooks() {
  Hooks.on("dnd5e.preUseActivity", activity => {
    if (!automationEnabled()) return;
    if (featureIs(activity, FEATURES.wrath) && !selectedTarget()) { ui.notifications.warn("Ira de la Tormenta requiere seleccionar al atacante que te impactó."); return false; }
    if (featureIs(activity, FEATURES.destructive)) ui.notifications.info("Ira Destructiva: reemplaza la tirada de daño de relámpago o trueno por su resultado máximo.");
    if (featureIs(activity, FEATURES.dampen) && !selectedTarget()) { ui.notifications.warn("Amortiguar los Elementos requiere seleccionar a la criatura que recibe el daño."); return false; }
  });
  Hooks.on("dnd5e.postUseActivity", async activity => {
    if (!automationEnabled()) return; const actor = activity?.item?.actor;
    if (featureIs(activity, FEATURES.dampen)) await message(actor, activity.item.name, "Concede resistencia al tipo de daño desencadenante solo para esta instancia.");
    if (featureIs(activity, FEATURES.thunder)) await message(actor, activity.item.name, "Tras infligir daño de relámpago a una criatura Grande o menor, muévela hasta 10 pies lejos de ti.");
    if (featureIs(activity, FEATURES.stormborn)) await message(actor, activity.item.name, "Configura vuelo igual a tu velocidad actual solo mientras no estés bajo tierra ni en un recinto cerrado.");
  });
}
