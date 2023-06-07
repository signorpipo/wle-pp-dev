import { Globals } from "../../pp/globals";

let _myObjectPoolsManagers = new WeakMap();

export function getObjectPoolsManager(engine = Globals.getMainEngine()) {
    return _myObjectPoolsManagers.get(engine);
}

export function setObjectPoolsManager(audioManager, engine = Globals.getMainEngine()) {
    _myObjectPoolsManagers.set(engine, audioManager);
}

export function removeObjectPoolsManager(engine = Globals.getMainEngine()) {
    _myObjectPoolsManagers.delete(engine);
}

export function hasObjectPoolsManager(engine = Globals.getMainEngine()) {
    return _myObjectPoolsManagers.has(engine);
}