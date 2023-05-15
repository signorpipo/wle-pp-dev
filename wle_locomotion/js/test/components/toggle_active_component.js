import { Component, Property } from "@wonderlandengine/api";

export class ToggleActiveComponent extends Component {
    static TypeName = "toggle-active";
    static Properties = {
        _myObject: Property.object()
    };

    start() {
        this._myCurrentActive = true;
    }

    update(dt) {
        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            this._myCurrentActive = !this._myCurrentActive;
            this._myObject.pp_setActive(this._myCurrentActive);
        }
    }
}