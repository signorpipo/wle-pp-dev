import { initJSExtensions } from "./extensions/init_js_extentions.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the import is not removed, since it makes the type extensions available to the Typescript 
 */
export { initJSExtensions } from "./extensions/init_js_extentions.js";

export function initJSPlugins(engine) {
    initJSExtensions(engine);
}