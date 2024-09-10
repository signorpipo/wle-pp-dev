import { Component } from "@wonderlandengine/api";

export class ScaleToZeroComponent extends Component {
    static TypeName = "scale-to-zero";

    start() {
    }

    update(dt) {
        this.object.setScalingLocal([1, 0, 1]);
    }
}