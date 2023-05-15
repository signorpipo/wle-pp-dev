import { Component, Property } from "@wonderlandengine/api";

export class GamepadButtonDisplayComponent extends Component {
    static TypeName = "gamepad-button-display";
    static Properties = {
        _myButtonIndex: Property.int(0)
    };

    start() {
        this._myHandPose = new PP.HandPose(PP.Handedness.LEFT);
        this._myHandPose.start();
    }

    update(dt) {
        this._myHandPose.update(dt);

        this._myInputSource = this._myHandPose.getInputSource();
        if (this._myInputSource != null) {
            this._myGamepad = this._myInputSource.gamepad;
        }

        if (this._myGamepad != null) {
            let button = this._myGamepad.buttons[this._myButtonIndex];
            console.error(button.pressed, button.touched, button.value);

            //console.error(PP.myGamepads[PP.Handedness.LEFT].getButtonInfo(this._myButtonIndex).isTouched());
        }
    }
}