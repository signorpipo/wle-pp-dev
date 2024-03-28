import { initArrayExtension } from "./array/array_extension.js";
import { initArrayExtensionLegacy } from "./array/array_extension_legacy.js";
import { initVec2Extension } from "./array/vec2_extension.js";
import { initVecExtension } from "./array/vec_extension.js";
import { initMathExtension } from "./math_extension.js";
import { initNumberExtension } from "./number_extension.js";

export function initJSExtensions() {
    initMathExtension();

    initArrayExtension();
    initVecExtension();
    initVec2Extension();
    initArrayExtensionLegacy();

    initNumberExtension();
}