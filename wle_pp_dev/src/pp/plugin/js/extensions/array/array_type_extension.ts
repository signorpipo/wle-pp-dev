declare global {
    export interface Array<T> {
        pp_first(this: Readonly<T[]>): T | undefined;
        pp_last(this: Readonly<T[]>): T | undefined;

        pp_has(this: Readonly<T[]>, callback: (elementToCheck: T, elementIndex: number) => boolean): boolean;
        pp_hasEqual(this: Readonly<T[]>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): boolean;

        pp_find(this: Readonly<T[]>, callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined;
        pp_findIndex(this: Readonly<T[]>, callback: (elementToCheck: T, elementIndex: number) => boolean): number;
        pp_findAll(this: Readonly<T[]>, callback: (elementToCheck: T, elementIndex: number) => boolean): T[];
        pp_findAllIndexes(this: Readonly<T[]>, callback: (elementToCheck: T, elementIndex: number) => boolean): number[];

        pp_findEqual(this: Readonly<T[]>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T | undefined;
        pp_findAllEqual(this: Readonly<T[]>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T[];
        pp_findIndexEqual(this: Readonly<T[]>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number;
        pp_findAllIndexesEqual(this: Readonly<T[]>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number[];

        pp_remove(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined;
        pp_removeIndex(this: T[], index: number): T | undefined;
        pp_removeAll(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T[];
        pp_removeAllIndexes(this: T[], indexes: number[]): T[];

        pp_removeEqual(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T | undefined;
        pp_removeAllEqual(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T[];

        pp_clear(this: T[]): T[];

        pp_pushUnique(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number;
        pp_unshiftUnique(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number;

        pp_copy<T, U extends T[]>(this: U, array: Readonly<U>, copyCallback?: (arrayElement: T, thisElement: T) => T): U;
        pp_clone<U extends T[]>(this: Readonly<U>, cloneCallback?: (elementToClone: T) => T): U;

        pp_equals(this: Readonly<T[]>, array: Readonly<T[]>, elementsEqualCallback?: (thisElement: T, arrayElement: T) => boolean): boolean;
    }
}