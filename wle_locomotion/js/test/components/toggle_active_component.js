import { Component, Property } from "@wonderlandengine/api";
import { getLeftGamepad } from "../../pp/input/cauldron/input_globals";
import { GamepadButtonID } from "../../pp/input/gamepad/gamepad_buttons";

export class ToggleActiveComponent extends Component {
    static TypeName = "toggle-active";
    static Properties = {
        _myObject: Property.object()
    };

    start() {
        this._myCurrentActive = true;
    }

    update(dt) {
        if (getLeftGamepad().getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            this._myCurrentActive = !this._myCurrentActive;
            this._myObject.pp_setActive(this._myCurrentActive);
        }
    }
}