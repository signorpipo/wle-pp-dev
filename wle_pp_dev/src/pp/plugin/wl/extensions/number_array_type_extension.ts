import { ArrayLike } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";

declare module "@wonderlandengine/api" {
    export interface NumberArray extends ArrayLike<number> { }
}