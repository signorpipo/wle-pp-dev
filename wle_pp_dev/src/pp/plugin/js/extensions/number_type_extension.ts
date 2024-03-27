/** This extension is needed to make it easier to use plain numbers for parameters that also accept `NumberOverFactor` */
export interface NumberExtension {
    get(factor?: number): number;
}

declare global {
    export interface Number extends NumberExtension { }
}