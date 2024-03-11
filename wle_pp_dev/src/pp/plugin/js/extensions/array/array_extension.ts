import { ArrayUtils, ArrayLike } from "../../../../cauldron/utils/array/array_utils.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import "./array_type_extension.js";

export function initArrayExtension(): void {
    initArrayExtensionProtoype();
}

export function initArrayExtensionProtoype(): void {

    // New Functions

    const arrayExtension: Record<string, any> = {};

    arrayExtension.pp_first = function pp_first<T>(this: Readonly<ArrayLike<T>>): T | undefined {
        return ArrayUtils.first(this);
    };

    arrayExtension.pp_last = function pp_last<T>(this: Readonly<ArrayLike<T>>): T | undefined {
        return ArrayUtils.last(this);
    };

    arrayExtension.pp_has = function pp_has<T>(this: Readonly<ArrayLike<T>>, callback: (elementToCheck: T, elementIndex: number) => boolean): boolean {
        return ArrayUtils.has(this, callback);
    };

    arrayExtension.pp_hasEqual = function pp_hasEqual<T>(this: Readonly<ArrayLike<T>>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): boolean {
        return ArrayUtils.hasEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_find = function pp_find<T>(this: Readonly<ArrayLike<T>>, callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined {
        return ArrayUtils.find(this, callback);
    };

    arrayExtension.pp_findIndex = function pp_findIndex<T>(this: Readonly<ArrayLike<T>>, callback: (elementToCheck: T, elementIndex: number) => boolean): number {
        return ArrayUtils.findIndex(this, callback);
    };

    arrayExtension.pp_findAll = function pp_findAll<T>(this: Readonly<ArrayLike<T>>, callback: (elementToCheck: T, elementIndex: number) => boolean): T[] {
        return ArrayUtils.findAll(this, callback);
    };

    arrayExtension.pp_findAllIndexes = function pp_findAllIndexes<T>(this: Readonly<ArrayLike<T>>, callback: (elementToCheck: T, elementIndex: number) => boolean): number[] {
        return ArrayUtils.findAllIndexes(this, callback);
    };

    arrayExtension.pp_findEqual = function pp_findEqual<T>(this: Readonly<ArrayLike<T>>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T | undefined {
        return ArrayUtils.findEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findAllEqual = function pp_findAllEqual<T>(this: Readonly<ArrayLike<T>>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): T[] {
        return ArrayUtils.findAllEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findIndexEqual = function pp_findIndexEqual<T>(this: Readonly<ArrayLike<T>>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number {
        return ArrayUtils.findIndexEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findAllIndexesEqual = function pp_findAllIndexesEqual<T>(this: Readonly<ArrayLike<T>>, elementToFind: T, elementsEqualCallback?: (elementToCheck: T, elementToFind: T) => boolean): number[] {
        return ArrayUtils.findAllIndexesEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_remove = function pp_remove<T>(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T | undefined {
        return ArrayUtils.remove(this, callback);
    };

    arrayExtension.pp_removeIndex = function pp_removeIndex<T>(this: T[], index: number): T | undefined {
        return ArrayUtils.removeIndex(this, index);
    };

    arrayExtension.pp_removeAll = function pp_removeAll<T>(this: T[], callback: (elementToCheck: T, elementIndex: number) => boolean): T[] {
        return ArrayUtils.removeAll(this, callback);
    };

    arrayExtension.pp_removeAllIndexes = function pp_removeAllIndexes<T>(this: T[], indexes: number[]): T[] {
        return ArrayUtils.removeAllIndexes(this, indexes);
    };

    arrayExtension.pp_removeEqual = function pp_removeEqual<T>(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T | undefined {
        return ArrayUtils.removeEqual(this, elementToRemove, elementsEqualCallback);
    };

    arrayExtension.pp_removeAllEqual = function pp_removeAllEqual<T>(this: T[], elementToRemove: T, elementsEqualCallback?: (elementToCheck: T, elementToRemove: T) => boolean): T[] {
        return ArrayUtils.removeAllEqual(this, elementToRemove, elementsEqualCallback);
    };

    arrayExtension.pp_clear = function pp_clear<T>(this: T[]): T[] {
        return ArrayUtils.clear(this);
    };

    arrayExtension.pp_pushUnique = function pp_pushUnique<T>(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number {
        return ArrayUtils.pushUnique(this, elementToAdd, elementsEqualCallback);
    };

    arrayExtension.pp_unshiftUnique = function pp_unshiftUnique<T>(this: T[], elementToAdd: T, elementsEqualCallback?: (elementToCheck: T, elementToAdd: T) => boolean): number {
        return ArrayUtils.unshiftUnique(this, elementToAdd, elementsEqualCallback);
    };

    arrayExtension.pp_copy = function pp_copy<T, U extends ArrayLike<T>>(this: U, array: Readonly<U>, copyCallback?: (arrayElement: T, thisElement: T) => T): U {
        return ArrayUtils.copy(array, this, copyCallback);
    };

    arrayExtension.pp_clone = function pp_clone<T, U extends ArrayLike<T>>(this: Readonly<U>, cloneCallback?: (elementToClone: T) => T): U {
        return ArrayUtils.clone(this, cloneCallback);
    };

    arrayExtension.pp_equals = function pp_equals<T>(this: Readonly<ArrayLike<T>>, array: Readonly<ArrayLike<T>>, elementsEqualCallback?: (thisElement: T, arrayElement: T) => boolean): boolean {
        return ArrayUtils.equals(this, array, elementsEqualCallback);
    };



    // #TODO do not add some properties to the typed arrays since they are not valid on them

    const arrayPrototypesToExtend = [
        Array.prototype, Uint8ClampedArray.prototype, Uint8Array.prototype, Uint16Array.prototype, Uint32Array.prototype, Int8Array.prototype,
        Int16Array.prototype, Int32Array.prototype, Float32Array.prototype, Float64Array.prototype];

    for (const arrayPrototypeToExtend of arrayPrototypesToExtend) {
        PluginUtils.injectProperties(arrayExtension, arrayPrototypeToExtend, false, true, true);
    }
}