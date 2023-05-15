import { Component, Property } from "@wonderlandengine/api";
import { getCanvas } from "../../pp/cauldron/wl/engine_globals";

export class TouchStartTestComponent extends Component {
    static TypeName = "touch-start-test";
    static Properties = {};

    start() {
        getCanvas().addEventListener('touchstart', function (e) {
            console.error("index:", e);
        }.bind(this));

        getCanvas().addEventListener('touchend', function (e) {
            console.error("index:", e);
        }.bind(this));

    }
}