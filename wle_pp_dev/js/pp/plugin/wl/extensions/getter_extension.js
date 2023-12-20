import { Physics } from "@wonderlandengine/api";
import { PluginUtils } from "../../utils/plugin_utils";

export function initGetterExtension() {
    initPhysicsGetterExtensionPrototype();
}

export function initPhysicsGetterExtensionPrototype() {

    let extension = {};

    extension.pp_getEngine = function pp_getEngine() {
        return this._engine;
    };

    PluginUtils.injectProperties(extension, Physics.prototype, false, true, true);
}