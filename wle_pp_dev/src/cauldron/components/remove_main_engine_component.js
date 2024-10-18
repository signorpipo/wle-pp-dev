import { Component } from "@wonderlandengine/api";
import { Globals } from "../../pp/pp/globals.js";

export class RemoveMainEngineComponent extends Component {
    static TypeName = "remove-main-engine";

    start() {
        Globals.removeMainEngine();
    }
}