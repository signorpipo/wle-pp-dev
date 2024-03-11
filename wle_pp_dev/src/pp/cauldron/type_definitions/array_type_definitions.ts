export type TypedArray = Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

export interface Vector {
    [n: number]: number;
    length: number;
}

export interface Vector2 {
    [n: number]: number;
    length: number;
}

export interface Vector3 {
    [n: number]: number;
    length: number;
}

export interface Vector4 {
    [n: number]: number;
    length: number;
}

export interface Quaternion {
    [n: number]: number;
    length: number;
}

export interface Quaternion2 {
    [n: number]: number;
    length: number;
}

export interface Matrix2 {
    [n: number]: number;
    length: number;
}

export interface Matrix3 {
    [n: number]: number;
    length: number;
}

export interface Matrix4 {
    [n: number]: number;
    length: number;
}