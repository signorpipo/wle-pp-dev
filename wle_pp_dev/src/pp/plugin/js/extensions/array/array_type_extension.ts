export interface ArrayLikeExtension<ArrayType, ArrayElementType> {
    pp_first(this: Readonly<ArrayType>): ArrayElementType | undefined;
    pp_last(this: Readonly<ArrayType>): ArrayElementType | undefined;

    pp_has(this: Readonly<ArrayType>, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): boolean;
    pp_hasEqual(this: Readonly<ArrayType>, elementToFind: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToFind: ArrayElementType) => boolean): boolean;

    pp_find(this: Readonly<ArrayType>, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): ArrayElementType | undefined;
    pp_findIndex(this: Readonly<ArrayType>, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): number;
    pp_findAll(this: Readonly<ArrayType>, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): ArrayElementType[];
    pp_findAllIndexes(this: Readonly<ArrayType>, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): number[];

    pp_findEqual(this: Readonly<ArrayType>, elementToFind: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToFind: ArrayElementType) => boolean): ArrayElementType | undefined;
    pp_findAllEqual(this: Readonly<ArrayType>, elementToFind: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToFind: ArrayElementType) => boolean): ArrayElementType[];
    pp_findIndexEqual(this: Readonly<ArrayType>, elementToFind: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToFind: ArrayElementType) => boolean): number;
    pp_findAllIndexesEqual(this: Readonly<ArrayType>, elementToFind: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToFind: ArrayElementType) => boolean): number[];

    pp_copy<U extends ArrayType>(this: U, array: Readonly<ArrayType>, copyCallback?: (arrayElement: ArrayElementType, thisElement: ArrayElementType) => ArrayElementType): U;
    pp_clone<U extends ArrayType>(this: Readonly<U>, cloneCallback?: (elementToClone: ArrayElementType) => ArrayElementType): U;

    pp_equals(this: Readonly<ArrayType>, array: Readonly<ArrayType>, elementsEqualCallback?: (thisElement: ArrayElementType, arrayElement: ArrayElementType) => boolean): boolean;
}

export interface ArrayExtension<ArrayType, ArrayElementType> extends ArrayLikeExtension<ArrayType, ArrayElementType> {
    pp_remove(this: ArrayType, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): ArrayElementType | undefined;
    pp_removeIndex(this: ArrayType, index: number): ArrayElementType | undefined;
    pp_removeAll(this: ArrayType, callback: (elementToCheck: ArrayElementType, elementIndex: number) => boolean): ArrayElementType[];
    pp_removeAllIndexes(this: ArrayType, indexes: number[]): ArrayElementType[];

    pp_removeEqual(this: ArrayType, elementToRemove: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToRemove: ArrayElementType) => boolean): ArrayElementType | undefined;
    pp_removeAllEqual(this: ArrayType, elementToRemove: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToRemove: ArrayElementType) => boolean): ArrayElementType[];

    pp_clear(this: ArrayType): this;

    pp_pushUnique(this: ArrayType, elementToAdd: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToAdd: ArrayElementType) => boolean): number;
    pp_unshiftUnique(this: ArrayType, elementToAdd: ArrayElementType, elementsEqualCallback?: (elementToCheck: ArrayElementType, elementToAdd: ArrayElementType) => boolean): number;

}

declare global {
    export interface Array<T> extends ArrayExtension<Array<T>, T> {
    }
}

declare global {
    export interface Uint8ClampedArray extends ArrayLikeExtension<Uint8ClampedArray, number> {
    }
}

declare global {
    export interface Uint8Array extends ArrayLikeExtension<Uint8Array, number> {
    }
}

declare global {
    export interface Uint16Array extends ArrayLikeExtension<Uint16Array, number> {
    }
}

declare global {
    export interface Uint32Array extends ArrayLikeExtension<Uint32Array, number> {
    }
}

declare global {
    export interface Int8Array extends ArrayLikeExtension<Int8Array, number> {
    }
}

declare global {
    export interface Int16Array extends ArrayLikeExtension<Int16Array, number> {
    }
}

declare global {
    export interface Int32Array extends ArrayLikeExtension<Int32Array, number> {
    }
}

declare global {
    export interface Float32Array extends ArrayLikeExtension<Float32Array, number> {
    }
}

declare global {
    export interface Float64Array extends ArrayLikeExtension<Float64Array, number> {
    }
}
