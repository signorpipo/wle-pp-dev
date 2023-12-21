import { initGetterExtensions } from "./getter_extensions";
import { initObjectExtension } from "./object_extension";
import { initSceneExtension } from "./scene_extension";

export function initWLExtensions(engine) {
    initObjectExtension();
    initSceneExtension();
    initGetterExtensions();
}