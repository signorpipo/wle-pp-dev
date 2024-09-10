import { Component } from "@wonderlandengine/api";
import { GamepadButtonID } from "../../pp/input/gamepad/gamepad_buttons.js";
import { Globals } from "../../pp/pp/globals.js";

export class PulseOnButtonComponent extends Component {
    static TypeName = "pulse-on-button";

    update(dt) {
        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            Globals.getLeftGamepad(this.engine).pulse(0.5, 0.01);
        }

        if (Globals.getRightGamepad(this.engine).getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            Globals.getRightGamepad(this.engine).pulse(0.5, 0.1);
        }
    }
}