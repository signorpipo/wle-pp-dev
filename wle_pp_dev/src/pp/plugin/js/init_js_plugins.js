import { initJSExtensions } from "./extensions/init_js_extentions.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the import for the function is not removed, 
 *  since that import makes the type extensions added by the function available to the Typescript 
 */
export { initJSExtensions } from "./extensions/init_js_extentions.js";

export function initJSPlugins(engine) {
    initJSExtensions(engine);
}