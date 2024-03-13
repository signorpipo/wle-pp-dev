export interface NumberExtension {
    get(): number;
}

declare global {
    export interface Number extends NumberExtension {
        get(): number;
    }
}