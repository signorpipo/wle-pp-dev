import { Component, Type } from "@wonderlandengine/api";

export class TouchStartTestComponent extends Component {
    static TypeName = "touch-start-test";
    static Properties = {};

    start() {
        WL.canvas.addEventListener('touchstart', function (e) {
            console.error("index:", e);
        }.bind(this));
        WL.canvas.addEventListener('touchend', function (e) {
            console.error("index:", e);
        }.bind(this));

    }
}