export interface NumberExtension {
    get(): number;
}

declare global {
    export interface Number extends NumberExtension {
        /** Needed to make it easier to use plain numbers for parameters that also accept `NumberOverFactor` */
        get(factor?: number): number;
    }
}