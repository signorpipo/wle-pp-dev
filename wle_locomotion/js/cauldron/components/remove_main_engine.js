import { Component } from "@wonderlandengine/api";
import { Globals } from "../../pp/pp/globals";

export class RemoveMainEngineComponent extends Component {
    static TypeName = "remove-main-engine";
    static Properties = {};

    start() {
        Globals.removeMainEngine();
    }
}