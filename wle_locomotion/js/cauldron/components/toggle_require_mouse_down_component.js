import { Component } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer";

export class ToggleRequireMouseDownComponent extends Component {
    static TypeName = "toggle-require-mouse-down";
    static Properties = {};

    start() {
        this._myTimer = new Timer(3);
        this._myMouseLook = this.object.pp_getComponent("mouse-look");
    }

    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            this._myMouseLook.requireMouseDown = !this._myMouseLook.requireMouseDown;
        }
    }
}