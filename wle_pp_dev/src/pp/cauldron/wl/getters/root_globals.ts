
import { Object3D, WonderlandEngine } from "@wonderlandengine/api";
import { Globals } from "../../../pp/globals.js";

const _myRoots: WeakMap<Readonly<WonderlandEngine>, Object3D> = new WeakMap();

export function getRoot(engine: Readonly<WonderlandEngine> | null = Globals.getMainEngine()): Object3D | null {
    if (engine == null) return null;

    const root = _myRoots.get(engine);
    return root != null ? root : null;
}

export function setRoot(root: Object3D, engine: Readonly<WonderlandEngine> | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myRoots.set(engine, root);
    }
}

export function removeRoot(engine: Readonly<WonderlandEngine> | null = Globals.getMainEngine()): void {
    if (engine != null) {
        _myRoots.delete(engine);
    }
}

export function hasRoot(engine: Readonly<WonderlandEngine> | null = Globals.getMainEngine()): boolean {
    return engine != null ? _myRoots.has(engine) : false;
}