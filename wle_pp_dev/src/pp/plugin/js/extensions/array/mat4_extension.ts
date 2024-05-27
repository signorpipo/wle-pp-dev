import { Matrix4 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";
import { Matrix4Extension } from "./mat4_type_extension.js";

import "./mat4_type_extension.js";

export function initMat4Extension(): void {
    _initMat4ExtensionProtoype();
}

function _initMat4ExtensionProtoype(): void {

    const matrix4Extension: Matrix4Extension<Matrix4> = {
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(matrix4Extension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}