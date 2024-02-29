import { Emitter } from "@wonderlandengine/api";
import { CursorTarget } from "@wonderlandengine/components";
import { PluginUtils } from "../../../utils/plugin_utils.js";

export function initCursorTargetComponentMod(): void {
    initCursorTargetComponentModPrototype();
}

export function initCursorTargetComponentModPrototype(): void {
    const cursorTargetComponentMod: Record<string, any> = {};

    // New Functions 

    cursorTargetComponentMod.init = function init(this: CursorTarget): void {
        const _this = (this as any);

        _this.onSingleClick = new Emitter();
        _this.onDoubleClick = new Emitter();
        _this.onTripleClick = new Emitter();

        _this.onDownOnHover = new Emitter();

        _this.onUpWithDown = new Emitter();
        _this.onUpWithNoDown = new Emitter();

        _this.isSurface = false; // Just a way to specify if this target is just used as a surface between buttons 
    };

    cursorTargetComponentMod.start = function start(): void { };
    cursorTargetComponentMod.update = function update(dt: number): void { };
    cursorTargetComponentMod.onActivate = function onActivate(): void { };
    cursorTargetComponentMod.onDeactivate = function onDeactivate(): void { };
    cursorTargetComponentMod.onDestroy = function onDestroy(): void { };



    PluginUtils.injectProperties(cursorTargetComponentMod, CursorTarget.prototype, false, true, true);
}