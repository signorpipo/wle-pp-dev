export interface ArrayLike<T> {
    [n: number]: T;
    length: number;

    indexOf(searchElement: T, fromIndex?: number): number;
    findIndex(predicate: (value: T, index: number, obj: ArrayLike<T>) => boolean, thisArg?: any): number;

    slice(start?: number, end?: number): ArrayLike<T>;
}

export type TypedArray = Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

export interface Vector extends ArrayLike<number> {
}

export interface Vector2 extends Vector {
}

export interface Vector3 extends Vector {
}

export interface Vector4 extends Vector {
}

export interface Quaternion extends Vector {
}

export interface Quaternion2 extends Vector {
}

export interface Matrix2 extends Vector {
}

export interface Matrix3 extends Vector {
}

export interface Matrix4 extends Vector {
}