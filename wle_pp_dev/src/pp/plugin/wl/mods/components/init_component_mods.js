import { initCauldronMods } from "./cauldron_mods.js";
import { initCursorComponentMod } from "./cursor_component_mod.js";
import { initCursorTargetComponentMod } from "./cursor_target_component_mod.js";
import { initMouseLookComponentMod } from "./mouse_look_component_mod.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the imports for the functions is not removed, 
 *  since those imports make the type extensions added by the functions available to the Typescript 
 */
export { initCauldronMods } from "./cauldron_mods.js";
export { initCursorComponentMod } from "./cursor_component_mod.js";
export { initCursorTargetComponentMod } from "./cursor_target_component_mod.js";
export { initMouseLookComponentMod } from "./mouse_look_component_mod.js";

export function initComponentMods() {
    initCursorComponentMod();
    initCursorTargetComponentMod();
    initMouseLookComponentMod();

    initCauldronMods();
}