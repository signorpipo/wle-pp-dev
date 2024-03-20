import { WonderlandEngine } from "@wonderlandengine/api";
import { PluginUtils } from "../../utils/plugin_utils.js";
import "./number_type_extension.js";

export function initNumberExtension(engine: Readonly<WonderlandEngine>): void {
    initNumberExtensionPrototype();
}

export function initNumberExtensionPrototype(): void {

    const numberExtension: Record<string, any> = {};

    // Needed to make it easier to use plain numbers for parameters that also accept `NumberOverFactor`
    numberExtension.get = function get(this: number, factor?: number): number {
        return this.valueOf();
    };



    PluginUtils.injectProperties(numberExtension, Number.prototype, false, true, true);
}