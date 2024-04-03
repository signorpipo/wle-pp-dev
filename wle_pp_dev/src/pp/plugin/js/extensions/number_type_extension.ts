/**
 * Warning: this type extension is actually added at runtime only if you call `initNumberExtension` in some way (`initPP` does it for you)
 */

/** This extension is needed to make it easier to use plain numbers for parameters that also accept `NumberOverFactor` */
export interface NumberExtension {
    get(factor?: number): number;
}

declare global {
    export interface Number extends NumberExtension { }
}