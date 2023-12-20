import { initGetterExtension } from "./getter_extension";
import { initObjectExtension } from "./object_extension";
import { initSceneExtension } from "./scene_extension";

export function initWLExtensions(engine) {
    initObjectExtension();
    initSceneExtension();
    initGetterExtension();
}