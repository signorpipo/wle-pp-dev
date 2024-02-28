import { type NumberArray } from "@wonderlandengine/api";

declare module "@wonderlandengine/api" {
    export interface Object3D {
        pp_getPosition(position: NumberArray): NumberArray;
    }
}