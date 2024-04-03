/**
 * Warning: this type extension is actually added at runtime only if you call `initCursorTargetComponentMod` in some way (`initPP` does it for you)
 */

import { Emitter, Object3D } from "@wonderlandengine/api";
import { Cursor, type EventTypes } from "@wonderlandengine/components";

export interface CursorTargetExtension {
    onSingleClick: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;
    onDoubleClick: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;
    onTripleClick: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;

    onDownOnHover: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;

    onUpWithDown: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;
    onUpWithNoDown: Emitter<[Object3D, Cursor, (EventTypes | undefined)?]>;

    /** Just a way to specify if this target is just used as a surface between buttons */
    isSurface: boolean;
}

declare module "@wonderlandengine/components" {
    export interface CursorTarget extends CursorTargetExtension { }
}