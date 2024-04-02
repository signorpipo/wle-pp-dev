import { initWLExtensions } from "./extensions/init_wl_extentions.js";
import { initWLMods } from "./mods/init_wl_mods.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the imports for the functions is not removed, 
 *  since those imports make the type extensions added by the functions available to the Typescript 
 */
export { initWLExtensions } from "./extensions/init_wl_extentions.js";
export { initWLMods } from "./mods/init_wl_mods.js";

export function initWLPlugins() {
    initWLExtensions();
    initWLMods();
}