import { Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";

import "./vec3_type_extension.js";

export function initVec3Extension(): void {
    _initVec3ExtensionProtoype();
}

function _initVec3ExtensionProtoype(): void {

    const vec3Extension: Vector3Extension<Vector3> = {
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(vec3Extension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}