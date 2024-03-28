import { VecUtils, Vector } from "../../../../index.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import "./array_type_extension.js";

export function initVecExtension(): void {
    initVecExtensionProtoype();
}

export function initVecExtensionProtoype(): void {

    const vecExtension: Record<string, any> = {};

    vecExtension.vec_clone = function vec_clone<T extends Vector>(this: Readonly<T>): T {
        return VecUtils.clone<T>(this);
    };

    vecExtension.vec_zero = function vec_zero<T extends Vector>(this: T): T {
        return VecUtils.zero(this);
    };

    vecExtension.vec_isZero = function vec_isZero(this: Readonly<Vector>, epsilon: number = 0): boolean {
        return VecUtils.isZero(this, epsilon);
    };

    vecExtension.vec_scale = function vec_scale<T extends Vector, S extends Vector>(this: Readonly<T>, value: number, out?: S): S {
        return VecUtils.scale(this, value, out!);
    };

    vecExtension.vec_round = function vec_round<T extends Vector, S extends Vector>(this: Readonly<T>, out?: S): S {
        return VecUtils.round(this, out!);
    };

    vecExtension.vec_floor = function vec_floor<T extends Vector, S extends Vector>(this: Readonly<T>, out?: S): S {
        return VecUtils.floor(this, out!);
    };

    vecExtension.vec_ceil = function vec_ceil<T extends Vector, S extends Vector>(this: Readonly<T>, out?: S): S {
        return VecUtils.ceil(this, out!);
    };

    vecExtension.vec_clamp = function vec_clamp<T extends Vector, S extends Vector>(this: Readonly<T>, start: number, end: number, out?: S): S {
        return VecUtils.clamp(this, start, end, out!);
    };

    vecExtension.vec_equals = function vec_equals(this: Readonly<Vector>, vector: Readonly<Vector>, epsilon: number = 0): boolean {
        return VecUtils.equals(this, vector, epsilon);
    };

    vecExtension.vec_toString = function vec_toString(this: Readonly<Vector>, decimalPlaces: number = 4): string {
        return VecUtils.toString(this, decimalPlaces);
    };

    vecExtension.vec_log = function vec_log(this: Readonly<Vector>, decimalPlaces: number = 4): Vector {
        return VecUtils.log(this, decimalPlaces);
    };

    vecExtension.vec_error = function vec_error(this: Readonly<Vector>, decimalPlaces: number = 4): Vector {
        return VecUtils.error(this, decimalPlaces);
    };

    vecExtension.vec_warn = function vec_warn(this: Readonly<Vector>, decimalPlaces: number = 4): Vector {
        return VecUtils.warn(this, decimalPlaces);
    };

    const arrayLikePrototypesToExtend = [
        Array.prototype, Uint8ClampedArray.prototype, Uint8Array.prototype, Uint16Array.prototype, Uint32Array.prototype, Int8Array.prototype,
        Int16Array.prototype, Int32Array.prototype, Float32Array.prototype, Float64Array.prototype];

    for (const arrayLikePrototypeToExtend of arrayLikePrototypesToExtend) {
        PluginUtils.injectProperties(vecExtension, arrayLikePrototypeToExtend, false, true, true);
    }
}