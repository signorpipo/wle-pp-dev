import { ReadonlyArray } from "../../../../cauldron/js/utils/array_utils.js";

declare global {
    export interface Array<T> {
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

        pp_remove(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined;
        pp_removeIndex(this: T[], index: number): T | undefined;
        pp_removeAll(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T[];
        pp_removeAllIndexes(this: T[], indexes: number[]): T[];

        pp_removeEqual(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T | undefined;
        pp_removeAllEqual(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T[];

        pp_clear(this: T[]): T[];

        pp_pushUnique(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number;
        pp_unshiftUnique(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number;

        pp_copy<U extends T[] | ReadonlyArray<T>>(this: U, array: ReadonlyArray<T>, copyCallback?: (arrayElement: T, thisElement: T) => T): U;
        pp_clone<U extends ReadonlyArray<T>>(this: U, cloneCallback?: (elementToClone: T) => T): U;

        pp_equals(this: ReadonlyArray<T>, array: ReadonlyArray<T>, elementsEqualCallback?: (thisElement: T, arrayElement: T) => boolean): boolean;
    }
}