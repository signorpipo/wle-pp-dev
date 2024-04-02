import { initCauldronExtensions } from "./cauldron_extensions.js";
import { initObjectExtension } from "./object_extension.js";
import { initSceneExtension } from "./scene_extension.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the imports for the functions is not removed, 
 *  since those imports make the type extensions added by the functions available to the Typescript 
 */
export { initCauldronExtensions } from "./cauldron_extensions.js";
export { initObjectExtension } from "./object_extension.js";
export { initSceneExtension } from "./scene_extension.js";

export function initWLExtensions() {
    initObjectExtension();
    initSceneExtension();
    initCauldronExtensions();
}