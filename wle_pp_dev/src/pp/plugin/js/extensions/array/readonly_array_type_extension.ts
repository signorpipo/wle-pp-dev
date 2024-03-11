declare global {
    export interface ReadonlyArray<T> {
        pp_first(this: ReadonlyArray<T>): T | undefined;
        pp_last(this: ReadonlyArray<T>): T | undefined;

        pp_has(this: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): boolean;
        pp_hasEqual(this: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): boolean;

        pp_find(this: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined;
        pp_findIndex(this: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): number;
        pp_findAll(this: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): T[];
        pp_findAllIndexes(this: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): number[];

        pp_findEqual(this: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T | undefined;
        pp_findAllEqual(this: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T[];
        pp_findIndexEqual(this: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number;
        pp_findAllIndexesEqual(this: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number[];

        pp_clone<U extends ReadonlyArray<T>>(this: U, cloneCallback?: (elementToClone: T) => T): U;

        pp_equals(this: ReadonlyArray<T>, array: ReadonlyArray<T>, elementsEqualCallback?: (thisElement: T, arrayElement: T) => boolean): boolean;
    }
}