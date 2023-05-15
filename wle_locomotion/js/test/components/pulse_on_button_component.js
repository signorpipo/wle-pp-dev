import { Component, Property } from "@wonderlandengine/api";
import { GamepadButtonID } from "../../pp/input/gamepad/gamepad_buttons";
import { getLeftGamepad, getRightGamepad } from "../../pp/input/cauldron/input_globals";

export class PulseOnButtonComponent extends Component {
    static TypeName = "pulse-on-button";
    static Properties = {};

    update(dt) {
        if (getLeftGamepad().getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            getLeftGamepad().pulse(0.5, 0.01);
        }

        if (getRightGamepad().getButtonInfo(GamepadButtonID.SQUEEZE).isPressEnd()) {
            getRightGamepad().pulse(0.5, 0.1);
        }
    }
}