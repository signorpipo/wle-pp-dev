import { ArrayUtils } from "../../../../cauldron/js/utils/array_utils.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";

export function initArrayExtension(): void {
    initArrayExtensionProtoype();
}

export function initArrayExtensionProtoype(): void {

    // New Functions

    const arrayExtension: Record<string, any> = {};

    arrayExtension.pp_first = function pp_first() {
        return ArrayUtils.first(this);
    };

    arrayExtension.pp_last = function pp_last() {
        return ArrayUtils.last(this);
    };

    arrayExtension.pp_has = function pp_has(callback) {
        return ArrayUtils.has(this, callback);
    };

    arrayExtension.pp_hasEqual = function pp_hasEqual(elementToFind, elementsEqualCallback = null) {
        return ArrayUtils.hasEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_find = function pp_find(callback) {
        return ArrayUtils.find(this, callback);
    };

    arrayExtension.pp_findIndex = function pp_findIndex(callback) {
        return ArrayUtils.findIndex(this, callback);
    };

    arrayExtension.pp_findAll = function pp_findAll(callback) {
        return ArrayUtils.findAll(this, callback);
    };

    arrayExtension.pp_findAllIndexes = function pp_findAllIndexes(callback) {
        return ArrayUtils.findAllIndexes(this, callback);
    };

    arrayExtension.pp_findEqual = function pp_findEqual(elementToFind, elementsEqualCallback = null) {
        return ArrayUtils.findEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findAllEqual = function pp_findAllEqual(elementToFind, elementsEqualCallback = null) {
        return ArrayUtils.findAllEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findIndexEqual = function pp_findIndexEqual(elementToFind, elementsEqualCallback = null) {
        return ArrayUtils.findIndexEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_findAllIndexesEqual = function pp_findAllIndexesEqual(elementToFind, elementsEqualCallback = null) {
        return ArrayUtils.findAllIndexesEqual(this, elementToFind, elementsEqualCallback);
    };

    arrayExtension.pp_removeIndex = function pp_removeIndex(index) {
        return ArrayUtils.removeIndex(this, index);
    };

    arrayExtension.pp_removeAllIndexes = function pp_removeAllIndexes(indexes) {
        return ArrayUtils.removeAllIndexes(this, indexes);
    };

    arrayExtension.pp_remove = function pp_remove(callback) {
        return ArrayUtils.remove(this, callback);
    };

    arrayExtension.pp_removeAll = function pp_removeAll(callback) {
        return ArrayUtils.removeAll(this, callback);
    };

    arrayExtension.pp_removeEqual = function pp_removeEqual(elementToRemove, elementsEqualCallback = null) {
        return ArrayUtils.removeEqual(this, elementToRemove, elementsEqualCallback);
    };

    arrayExtension.pp_removeAllEqual = function pp_removeAllEqual(elementToRemove, elementsEqualCallback = null) {
        return ArrayUtils.removeAllEqual(this, elementToRemove, elementsEqualCallback);
    };

    arrayExtension.pp_pushUnique = function pp_pushUnique(element, elementsEqualCallback = null) {
        return ArrayUtils.pushUnique(this, element, elementsEqualCallback);
    };

    arrayExtension.pp_unshiftUnique = function pp_unshiftUnique(element, elementsEqualCallback = null) {
        return ArrayUtils.unshiftUnique(this, element, elementsEqualCallback);
    };

    arrayExtension.pp_copy = function pp_copy(array, copyCallback = null) {
        return ArrayUtils.copy(array, this, copyCallback);
    };

    arrayExtension.pp_clone = function pp_clone(cloneCallback = null) {
        return ArrayUtils.clone(this, cloneCallback);
    };

    arrayExtension.pp_equals = function pp_equals(array, elementsEqualCallback = null) {
        return ArrayUtils.equals(this, array, elementsEqualCallback);
    };

    arrayExtension.pp_clear = function pp_clear() {
        return ArrayUtils.clear(this);
    };



    const arrayPrototypesToExtend = [
        Array.prototype, Uint8ClampedArray.prototype, Uint8Array.prototype, Uint16Array.prototype, Uint32Array.prototype, Int8Array.prototype,
        Int16Array.prototype, Int32Array.prototype, Float32Array.prototype, Float64Array.prototype];

    for (const arrayPrototypeToExtend of arrayPrototypesToExtend) {
        PluginUtils.injectProperties(arrayExtension, arrayPrototypeToExtend, false, true, true);
    }
}