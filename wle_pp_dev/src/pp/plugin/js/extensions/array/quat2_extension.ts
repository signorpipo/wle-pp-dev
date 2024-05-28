import { Quaternion2 } from "../../../../cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";

import "./quat2_type_extension.js";
import { Quaternion2Extension } from "./quat2_type_extension.js";

export function initQuat2Extension(): void {
    _initQuat2ExtensionProtoype();
}

function _initQuat2ExtensionProtoype(): void {

    const quat2Extension: Quaternion2Extension<Quaternion2> = {
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(quat2Extension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}