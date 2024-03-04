import { Object3D, Physics, Scene, WASM, WonderlandEngine, XR } from "@wonderlandengine/api";
import { SceneUtils } from "./utils/scene_utils.js";

let _myMainEngine: WonderlandEngine | null = null;
const _myEngines: WonderlandEngine[] = [];

export function initEngine(engine: WonderlandEngine): void {
    if (engine != null) {
        addEngine(engine);
        if (getMainEngine() == null) {
            setMainEngine(engine);
        }
    }
}

export function getMainEngine(): WonderlandEngine | null {
    return _myMainEngine;
}

export function setMainEngine(engine: WonderlandEngine): void {
    if (hasEngine(engine)) {
        _myMainEngine = engine;
    }
}

export function removeMainEngine(): void {
    _myMainEngine = null;
}

export function getEngines(): WonderlandEngine[] {
    return _myEngines;
}

export function addEngine(engine: WonderlandEngine): void {
    removeEngine(engine);
    _myEngines.push(engine);
}

export function removeEngine(engine: WonderlandEngine): void {
    const index = _myEngines.indexOf(engine);

    if (index >= 0) {
        _myEngines.splice(index, 1);

        if (getMainEngine() == engine) {
            removeMainEngine();
        }
    }
}

export function hasEngine(engine: WonderlandEngine): boolean {
    return _myEngines.indexOf(engine) >= 0;
}

export function getScene(engine: WonderlandEngine): Scene;
export function getScene(engine?: WonderlandEngine | null): Scene | null;
export function getScene(engine: WonderlandEngine | null = getMainEngine()): Scene | null {
    let scene = null;

    if (engine != null) {
        scene = engine.scene;
    }

    return scene;
}

export function getRoot(engine: WonderlandEngine): Object3D;
export function getRoot(engine?: WonderlandEngine | null): Object3D | null;
export function getRoot(engine: WonderlandEngine | null = getMainEngine()): Object3D | null {
    let root = null;

    const scene = getScene(engine);
    if (scene != null) {
        root = SceneUtils.getRoot(scene);
    }

    return root;
}

export function getPhysics(engine: WonderlandEngine): Physics;
export function getPhysics(engine?: WonderlandEngine | null): Physics | null;
export function getPhysics(engine: WonderlandEngine | null = getMainEngine()): Physics | null {
    let physics = null;

    if (engine != null) {
        physics = engine.physics;
    }

    return physics;
}

export function getCanvas(engine: WonderlandEngine): HTMLCanvasElement;
export function getCanvas(engine?: WonderlandEngine | null): HTMLCanvasElement | null;
export function getCanvas(engine: WonderlandEngine | null = getMainEngine()): HTMLCanvasElement | null {
    let canvas = null;

    if (engine != null) {
        canvas = engine.canvas;
    }

    return canvas;
}

export function getWASM(engine: WonderlandEngine): WASM;
export function getWASM(engine?: WonderlandEngine | null): WASM | null;
export function getWASM(engine: WonderlandEngine | null = getMainEngine()): WASM | null {
    let wasm = null;

    if (engine != null) {
        wasm = engine.wasm;
    }

    return wasm;
}

export function getXR(engine: WonderlandEngine): XR;
export function getXR(engine?: WonderlandEngine | null): XR | null;
export function getXR(engine: WonderlandEngine | null = getMainEngine()): XR | null {
    let xr = null;

    if (engine != null) {
        xr = engine.xr;
    }

    return xr;
}