import { Component, Property } from "@wonderlandengine/api";
import { GamepadButtonID } from "../../pp/input/gamepad/gamepad_buttons.js";
import { Globals } from "../../pp/pp/globals.js";

export class ToggleActiveComponent extends Component {
    static TypeName = "toggle-active";
    static Properties = {
        _myObject: Property.object()
    };

    start() {
        this._myCurrentActive = true;
    }

    update(dt) {
        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            this._myCurrentActive = !this._myCurrentActive;
            this._myObject.pp_setActive(this._myCurrentActive);
        }
    }
}