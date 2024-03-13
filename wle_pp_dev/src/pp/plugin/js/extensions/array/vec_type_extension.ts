import { Vector } from "../../../../index.js";

export interface VectorExtension<VectorType> {
    vec_zero(this: VectorType): this;
    vec_isZero(this: VectorType, epsilon?: number): boolean;

    vec_scale<T extends Vector>(this: VectorType, value: number, out?: T): T;

    vec_round<T extends Vector>(this: VectorType, out?: T): T;
    vec_floor<T extends Vector>(this: VectorType, out?: T): T;
    vec_ceil<T extends Vector>(this: VectorType, out?: T): T;
    vec_clamp<T extends Vector>(this: VectorType, start: number, end: number, out?: T): T;

    vec_equals(this: VectorType, vector: Vector, epsilon: number): boolean;

    vec_toString(this: VectorType, decimalPlaces?: number): string;

    vec_log(this: VectorType, decimalPlaces?: number): void;
    vec_error(this: VectorType, decimalPlaces?: number): void;
    vec_warn(this: VectorType, decimalPlaces?: number): void;
}

declare global {
    export interface Array<T> extends VectorExtension<Array<T>> {
    }
}

declare global {
    export interface Uint8ClampedArray extends VectorExtension<number> {
    }
}

declare global {
    export interface Uint8Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Uint16Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Uint32Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Int8Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Int16Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Int32Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Float32Array extends VectorExtension<number> {
    }
}

declare global {
    export interface Float64Array extends VectorExtension<number> {
    }
}
