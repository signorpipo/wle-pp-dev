import { Quaternion } from "../../../../cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";

import "./quat_type_extension.js";
import { QuaternionExtension } from "./quat_type_extension.js";

export function initQuatExtension(): void {
    _initQuatExtensionProtoype();
}

function _initQuatExtensionProtoype(): void {

    const quatExtension: QuaternionExtension<Quaternion> = {

    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(quatExtension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}