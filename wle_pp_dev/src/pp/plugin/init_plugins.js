import { initJSPlugins } from "./js/init_js_plugins.js";
import { initWLPlugins } from "./wl/init_wl_plugins.js";

/**
 *  TS import preserver
 * 
 *  This is only needed to make it so the imports for the functions is not removed, 
 *  since those imports make the type extensions added by the functions available to the Typescript 
 */
export { initJSPlugins } from "./js/init_js_plugins.js";
export { initWLPlugins } from "./wl/init_wl_plugins.js";

export function initPlugins() {
    initJSPlugins();
    initWLPlugins();
}