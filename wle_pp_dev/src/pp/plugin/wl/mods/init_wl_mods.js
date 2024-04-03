import { initComponentMods } from "./components/init_component_mods.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the import is not removed, since it makes the type extensions available to the Typescript 
 */
export { initComponentMods } from "./components/init_component_mods.js";

export function initWLMods() {
    initComponentMods();
}