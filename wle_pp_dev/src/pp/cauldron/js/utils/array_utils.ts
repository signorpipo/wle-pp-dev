import { ReadonlyArray } from "../array_type_definitions.js";

export function first<T>(array: ReadonlyArray<T>): T | undefined {
    return array.length > 0 ? array[0] : undefined;
}

export function last<T>(array: ReadonlyArray<T>): T | undefined {
    return array.length > 0 ? array[array.length - 1] : undefined;
}

export function has<T>(array: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): boolean {
    return ArrayUtils.find(array, callback) != undefined;
}

export function hasEqual<T>(array: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): boolean {
    return ArrayUtils.findEqual(array, elementToFind, elementsEqualCallback) != undefined;
}

export function find<T>(array: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined {
    let elementFound = undefined;

    const index = ArrayUtils.findIndex(array, callback);
    if (index >= 0) {
        elementFound = array[index];
    }

    return elementFound;
}

export function findIndex<T>(array: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): number {
    return array.findIndex(callback);
}

export function findAll<T>(array: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): T[] {
    const elementsFound = [];

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (callback(element, i)) {
            elementsFound.push(element);
        }
    }

    return elementsFound;
}

export function findAllIndexes<T>(array: ReadonlyArray<T>, callback: (elementToCheck: T, elementIndex: number) => boolean): number[] {
    const indexes = [];

    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (callback(element, i)) {
            indexes.push(i);
        }
    }

    return indexes;
}

export function findEqual<T>(array: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T | undefined {
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

export function findAllEqual<T>(array: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T[] {
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

export function findIndexEqual<T>(array: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number {
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

export function findAllIndexesEqual<T>(array: ReadonlyArray<T>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number[] {
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

export function remove<T>(array: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined {
    let elementRemoved = undefined;

    const index = array.findIndex(callback);
    if (index >= 0) {
        elementRemoved = ArrayUtils.removeIndex(array, index);
    }

    return elementRemoved;
}

export function removeAll<T>(array: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T[] {
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

export function copy<T, U extends T[] | ReadonlyArray<T>>(from: ReadonlyArray<T>, to: U, copyCallback?: (fromElement: T, toElement: T) => T): U {
    const _to = to as any;
    if (_to.pop != null) {
        while (to.length > from.length) {
            _to.pop();
        }
    }

    for (let i = 0; i < from.length; i++) {
        if (copyCallback == null) {
            to[i] = from[i];
        } else {
            to[i] = copyCallback(from[i], to[i]);
        }
    }

    return to;
}

export function clone<T, U extends ReadonlyArray<T>>(array: U, cloneCallback?: (elementToClone: T) => T): U {
    if (cloneCallback == null) {
        return array.slice(0) as U;
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
            throw new Error("Array type not supported: " + array.constructor.name);
    }

    for (let i = 0; i < array.length; i++) {
        clone[i] = cloneCallback(array[i]);
    }

    return clone as unknown as U;
}

export function equals<T>(array: ReadonlyArray<T>, other: ReadonlyArray<T>, elementsEqualCallback?: (arrayElement: T, otherElement: T) => boolean): boolean {
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



function _findAllEqualOptimized<T>(array: ReadonlyArray<T>, elementToFind: T): T[] {
    // Adapted from: https:// stackoverflow.com/a/20798567

    const elementsFound = [];

    let index = -1;
    while ((index = array.indexOf(elementToFind, index + 1)) >= 0) {
        elementsFound.push(array[index]);
    }

    return elementsFound;
}

function _findAllIndexesEqualOptimized<T>(array: ReadonlyArray<T>, elementToFind: T): number[] {
    // Adapted from: https:// stackoverflow.com/a/20798567

    const elementsFound = [];

    let index = -1;
    while ((index = array.indexOf(elementToFind, index + 1)) >= 0) {
        elementsFound.push(index);
    }

    return elementsFound;
}