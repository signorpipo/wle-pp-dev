import { Component, Property } from "@wonderlandengine/api";

export class ResetTransformComponent extends Component {
    static TypeName = "reset-transform";
    static Properties = {};

    start() {
        this.object.pp_resetTransform();
    }
}