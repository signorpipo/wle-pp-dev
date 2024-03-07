import { initArrayExtensionJS } from "./array/array_extension_js.js";
import { initMathExtension } from "./math_extension.js";
import { initNumberExtension } from "./number_extension.js";

export function initJSExtensions() {
    initMathExtension();
    initArrayExtensionJS();
    initNumberExtension();
}