import { Component } from "@wonderlandengine/api";

export class ResetTransformComponent extends Component {
    static TypeName = "reset-transform";

    start() {
        this.object.pp_resetTransform();
    }
}