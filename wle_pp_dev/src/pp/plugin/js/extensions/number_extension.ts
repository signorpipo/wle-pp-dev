import { WonderlandEngine } from "@wonderlandengine/api";
import { PluginUtils } from "../../utils/plugin_utils.js";

export function initNumberExtension(engine: Readonly<WonderlandEngine>): void {
    initNumberExtensionPrototype();
}

export function initNumberExtensionPrototype(): void {

    const numberExtension: Record<string, any> = {};

    // Mostly added to make it easier to use plain numbers in combo with NumberOverFactor
    numberExtension.get = function get(this: number): number {
        return this.valueOf();
    };



    PluginUtils.injectProperties(numberExtension, Number.prototype, false, true, true);
}