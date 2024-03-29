import { Emitter } from "@wonderlandengine/api";
import { CursorTarget } from "@wonderlandengine/components";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import "./cursor_target_component_type_extension.js";

export function initCursorTargetComponentMod(): void {
    initCursorTargetComponentModPrototype();
}

export function initCursorTargetComponentModPrototype(): void {

    const cursorTargetComponentMod: Record<string, any> = {};

    // New Functions 

    cursorTargetComponentMod.init = function init(this: CursorTarget): void {
        this.onSingleClick = new Emitter();
        this.onDoubleClick = new Emitter();
        this.onTripleClick = new Emitter();

        this.onDownOnHover = new Emitter();

        this.onUpWithDown = new Emitter();
        this.onUpWithNoDown = new Emitter();

        // Just a way to specify if this target is just used as a surface between buttons 
        this.isSurface = false;
    };

    cursorTargetComponentMod.start = function start(): void { };
    cursorTargetComponentMod.update = function update(dt: number): void { };
    cursorTargetComponentMod.onActivate = function onActivate(): void { };
    cursorTargetComponentMod.onDeactivate = function onDeactivate(): void { };
    cursorTargetComponentMod.onDestroy = function onDestroy(): void { };



    PluginUtils.injectProperties(cursorTargetComponentMod, CursorTarget.prototype, false, true, true);
}