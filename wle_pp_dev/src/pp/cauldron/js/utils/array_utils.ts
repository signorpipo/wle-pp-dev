import { TypedArray } from "../array_type_definitions.js";

export function first<T>(array: T[]): T | undefined;
export function first<T extends TypedArray>(array: T): number | undefined;
export function first<T>(array: T[] | TypedArray): T | number | undefined {
    return array.length > 0 ? array[0] : undefined;
}

export function last<T>(array: T[]): T | undefined;
export function last<T extends TypedArray>(array: T): number | undefined;
export function last<T>(array: T[] | TypedArray): T | number | undefined {
    return array.length > 0 ? array[array.length - 1] : undefined;
}

export function has<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): boolean {
    return ArrayUtils.find(array, callback) != undefined;
}

export function hasEqual<T>(array: T[], elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): boolean {
    return ArrayUtils.findEqual(array, elementToFind, elementsEqualCallback) != undefined;
}

export function find<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): T | undefined {
    let elementFound = undefined;

    const index = array.findIndex(callback);
    if (index >= 0) {
        elementFound = array[index];
    }

    return elementFound;
}

export function findIndex<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): number {
    return array.findIndex(callback);
}

export function findAll<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): T[] {
    const elementsFound = array.filter(callback);

    return elementsFound;
}

export function findAllIndexes<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): number[] {
    const indexes = [];

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (callback(element, i, array)) {
            indexes.push(i);
        }
    }

    return indexes;
}

export function findEqual<T>(array: T[], elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T | undefined {
    if (elementsEqualCallback == null) {
        const index = ArrayUtils.findIndexEqual(array, elementToFind);
        return index < 0 ? undefined : array[index];
    }

    let elementFound = undefined;
    for (let i = 0; i < array.length; i++) {
        const currentElement = array[i];
        if (elementsEqualCallback(currentElement, elementToFind)) {
            elementFound = currentElement;
            break;
        }
    }

    return elementFound;
}

export function findAllEqual<T>(array: T[], elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T[] {
    if (elementsEqualCallback == null) {
        return _findAllEqualOptimized(array, elementToFind);
    }

    const elementsFound = [];
    for (let i = 0; i < array.length; i++) {
        const currentElement = array[i];
        if (elementsEqualCallback(currentElement, elementToFind)) {
            elementsFound.push(currentElement);
        }
    }

    return elementsFound;
}

export function findIndexEqual<T>(array: T[], elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number {
    if (elementsEqualCallback == null) {
        return array.indexOf(elementToFind);
    }

    let indexFound = -1;
    for (let i = 0; i < array.length; i++) {
        const currentElement = array[i];
        if (elementsEqualCallback(currentElement, elementToFind)) {
            indexFound = i;
            break;
        }
    }

    return indexFound;
}

export function findAllIndexesEqual<T>(array: T[], elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number[] {
    if (elementsEqualCallback == null) {
        return _findAllIndexesEqualOptimized(array, elementToFind);
    }

    const indexesFound = [];
    for (let i = 0; i < array.length; i++) {
        const currentElement = array[i];
        if (elementsEqualCallback(currentElement, elementToFind)) {
            indexesFound.push(i);
        }
    }
    return indexesFound;
}

export function removeIndex<T>(array: T[], index: number): T | undefined {
    let elementRemoved = undefined;

    if (index >= 0 && index < array.length) {
        const arrayRemoved = array.splice(index, 1);
        if (arrayRemoved.length == 1) {
            elementRemoved = arrayRemoved[0];
        }
    }

    return elementRemoved;
}

export function removeAllIndexes<T>(array: T[], indexes: number[]): T[] {
    const elementsRemoved = [];

    for (const index of indexes) {
        const elementRemoved = ArrayUtils.removeIndex(array, index);
        if (elementRemoved !== undefined) {
            elementsRemoved.push(elementRemoved);
        }
    }

    return elementsRemoved;
}

export function remove<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): T | undefined {
    let elementRemoved = undefined;

    const index = array.findIndex(callback);
    if (index >= 0) {
        elementRemoved = ArrayUtils.removeIndex(array, index);
    }

    return elementRemoved;
}

export function removeAll<T>(array: T[], callback: (elementToCheck: T, elementIndex: number, array: T[]) => boolean): T[] {
    const elementsRemoved = [];

    let currentElement = undefined;
    do {
        currentElement = ArrayUtils.remove(array, callback);
        if (currentElement !== undefined) {
            elementsRemoved.push(currentElement);
        }
    } while (currentElement !== undefined);

    return elementsRemoved;
}

export function removeEqual<T>(array: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T | undefined {
    return ArrayUtils.removeIndex(array, ArrayUtils.findIndexEqual(array, elementToRemove, elementsEqualCallback));
}

export function removeAllEqual<T>(array: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T[] {
    return ArrayUtils.removeAllIndexes(array, ArrayUtils.findAllIndexesEqual(array, elementToRemove, elementsEqualCallback));
}

export function pushUnique<T>(array: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number {
    let length = array.length;

    const hasElement = ArrayUtils.hasEqual(array, elementToAdd, elementsEqualCallback);

    if (!hasElement) {
        length = array.push(elementToAdd);
    }

    return length;
}

export function unshiftUnique<T>(array: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number {
    let length = array.length;

    const hasElement = ArrayUtils.hasEqual(array, elementToAdd, elementsEqualCallback);

    if (!hasElement) {
        length = array.unshift(elementToAdd);
    }

    return length;
}

export function copy<T>(from: T[], to: T[], copyCallback?: (fromElement: T, toElement: T) => T): T[] {
    while (to.length > from.length) {
        to.pop();
    }

    for (let i = 0; i < from.length; i++) {
        if (copyCallback == null) {
            to[i] = from[i];
        } else {
            console.error("HEEEY");
            to[i] = copyCallback(from[i], to[i]);
        }
    }

    return to;
}

export function clone<T>(array: T[], cloneCallback?: (elementToClone: T) => T): T[];
export function clone<T extends TypedArray>(array: T, cloneCallback?: (elementToClone: number) => number): T;
export function clone<T>(array: T[] | TypedArray, cloneCallback?: (elementToClone: T | number) => T | number): T[] | TypedArray {
    if (cloneCallback == null) {
        return array.slice(0);
    }

    let clone = null;
    switch (array.constructor.name) {
        case "Array":
            clone = new Array(array.length);
            break;
        case "Uint8ClampedArray":
            clone = new Uint8ClampedArray(array.length);
            break;
        case "Uint8Array":
            clone = new Uint8Array(array.length);
            break;
        case "Uint16Array":
            clone = new Uint16Array(array.length);
            break;
        case "Uint32Array":
            clone = new Uint32Array(array.length);
            break;
        case "Int8Array":
            clone = new Int8Array(array.length);
            break;
        case "Int16Array":
            clone = new Int16Array(array.length);
            break;
        case "Int32Array":
            clone = new Int32Array(array.length);
            break;
        case "Float32Array":
            clone = new Float32Array(array.length);
            break;
        case "Float64Array":
            clone = new Float64Array(array.length);
            break;
        default:
            clone = new Array(array.length);
            console.error("Cloned array type not supported!");
            break;
    }

    for (let i = 0; i < array.length; i++) {
        clone[i] = cloneCallback(array[i]);
    }

    return clone;
}
export function equals<T>(array: T[], other: T[], elementsEqualCallback?: (arrayElement: T, otherElement: T) => boolean): boolean;
export function equals<T extends TypedArray>(array: T, other: T, elementsEqualCallback?: (arrayElement: number, otherElement: number) => boolean): boolean;
export function equals<T>(array: T[] | TypedArray, other: T[] | TypedArray, elementsEqualCallback?: (arrayElement: T | number, otherElement: T | number) => boolean): boolean {
    let equals = true;

    if (other != null && array.length == other.length) {
        for (let i = 0; i < array.length; i++) {
            if ((elementsEqualCallback != null && !elementsEqualCallback(array[i], other[i])) ||
                (elementsEqualCallback == null && array[i] != other[i])) {
                equals = false;
                break;
            }
        }
    } else {
        equals = false;
    }

    return equals;
}

export function clear<T>(array: T[]): T[] {
    array.length = 0;

    return array;
}

export const ArrayUtils = {
    first,
    last,
    has,
    hasEqual,
    find,
    findIndex,
    findAll,
    findAllIndexes,
    findEqual,
    findAllEqual,
    findIndexEqual,
    findAllIndexesEqual,
    removeIndex,
    removeAllIndexes,
    remove,
    removeAll,
    removeEqual,
    removeAllEqual,
    pushUnique,
    unshiftUnique,
    copy,
    clone,
    equals,
    clear
} as const;



function _findAllEqualOptimized<T>(array: T[], elementToFind: T): T[] {
    // Adapted from: https:// stackoverflow.com/a/20798567

    const elementsFound = [];
    let index = -1;
    while ((index = array.indexOf(elementToFind, index + 1)) >= 0) {
        elementsFound.push(array[index]);
    }

    return elementsFound;
}

function _findAllIndexesEqualOptimized<T>(array: T[], elementToFind: T): number[] {
    // Adapted from: https:// stackoverflow.com/a/20798567

    const elementsFound = [];
    let index = -1;
    while ((index = array.indexOf(elementToFind, index + 1)) >= 0) {
        elementsFound.push(index);
    }

    return elementsFound;
}