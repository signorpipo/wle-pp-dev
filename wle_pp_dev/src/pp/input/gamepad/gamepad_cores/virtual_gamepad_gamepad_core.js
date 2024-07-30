import { GamepadRawAxesData, GamepadRawButtonData } from "../gamepad.js";
import { GamepadAxesID, GamepadButtonID } from "../gamepad_buttons.js";
import { VirtualGamepadAxesID, VirtualGamepadButtonID } from "../virtual_gamepad/virtual_gamepad.js";
import { GamepadCore } from "./gamepad_core.js";

export class VirtualGamepadGamepadCore extends GamepadCore {

    constructor(virtualGamepad, handPose, gamepadToVirtualGamepadButtonIDMap = null, gamepadToVirtualGamepadAxesIDMap = null) {
        super(handPose);

        this.myGamepadToVirtualGamepadButtonIDMap = new Map();
        if (gamepadToVirtualGamepadButtonIDMap == null) {
            this.myGamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.SELECT, VirtualGamepadButtonID.SECOND_BUTTON);
            this.myGamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.SQUEEZE, VirtualGamepadButtonID.FIRST_BUTTON);
            this.myGamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.TOP_BUTTON, VirtualGamepadButtonID.THIRD_BUTTON);
            this.myGamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.BOTTOM_BUTTON, VirtualGamepadButtonID.FOURTH_BUTTON);
            this.myGamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.THUMBSTICK, VirtualGamepadButtonID.FIFTH_BUTTON);
        } else {
            this.myGamepadToVirtualGamepadButtonIDMap = gamepadToVirtualGamepadButtonIDMap;
        }

        this.myGamepadToVirtualGamepadAxesIDMap = new Map();
        if (gamepadToVirtualGamepadAxesIDMap == null) {
            this.myGamepadToVirtualGamepadAxesIDMap.set(GamepadAxesID.THUMBSTICK, VirtualGamepadAxesID.THUMBSTICK);
        } else {
            this.myGamepadToVirtualGamepadAxesIDMap = gamepadToVirtualGamepadAxesIDMap;
        }

        this._myVirtualGamepad = virtualGamepad;

        // Support Variables
        this._myButtonData = new GamepadRawButtonData();
        this._myAxesData = new GamepadRawAxesData();
        this._myHapticActuators = [];
    }

    isGamepadCoreActive() {
        return this._myVirtualGamepad.isVisible();
    }

    getButtonData(buttonID) {
        this._myButtonData.reset();

        if (this.isGamepadCoreActive()) {
            const virtualGamepadButtonID = this.myGamepadToVirtualGamepadButtonIDMap.get(buttonID);
            if (virtualGamepadButtonID != null && this._myVirtualGamepad.isButtonPressed(this.getHandedness(), virtualGamepadButtonID)) {
                this._myButtonData.myPressed = true;
                this._myButtonData.myTouched = true;
                this._myButtonData.myValue = 1;
            }
        }

        return this._myButtonData;
    }

    getAxesData(axesID) {
        this._myAxesData.reset();

        if (this.isGamepadCoreActive()) {
            const virtualGamepadAxesID = this.myGamepadToVirtualGamepadAxesIDMap.get(axesID);
            if (virtualGamepadAxesID != null) {
                this._myVirtualGamepad.getAxes(this.getHandedness(), virtualGamepadAxesID, this._myAxesData.myAxes);
            }
        }

        return this._myAxesData;
    }

    getHapticActuators() {
        return this._myHapticActuators;
    }
}