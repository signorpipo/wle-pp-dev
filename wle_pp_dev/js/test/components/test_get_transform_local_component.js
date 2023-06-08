import { Component } from "@wonderlandengine/api";

export class TestGetTransformLocalComponent extends Component {
    static TypeName = "test-get-transform-local";
    static Properties = {};

    update(dt) {
        for (let i = 0; i < 2000; i++) {
            let b = this.object.transformLocal;
        }
    }
}