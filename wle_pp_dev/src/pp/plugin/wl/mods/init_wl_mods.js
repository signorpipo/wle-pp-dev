import { initComponentMods } from "./components/init_component_mods.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the import for the function is not removed, 
 *  since that import makes the type extensions added by the function available to the Typescript 
 */
export { initComponentMods } from "./components/init_component_mods.js";

export function initWLMods() {
    initComponentMods();
}