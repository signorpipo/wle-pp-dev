export interface ReadonlyArray<T> {
    [n: number]: T;
    length: number;

    indexOf(searchElement: T, fromIndex?: number): number;
    findIndex(predicate: (value: T, index: number, obj: ReadonlyArray<T>) => boolean, thisArg?: any): number;

    slice(start?: number, end?: number): ReadonlyArray<T>;
}

export type TypedArray = Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;