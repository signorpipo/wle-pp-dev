import { Component, Type } from "@wonderlandengine/api";

export class PulseOnButtonComponent extends Component {
    static TypeName = "pulse-on-button";
    static Properties = {};

    update(dt) {
        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            PP.myLeftGamepad.pulse(0.5, 0.01);
        }

        if (PP.myRightGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            PP.myRightGamepad.pulse(0.5, 0.1);
        }
    }
}