import { Component, Property } from "@wonderlandengine/api";
import { Globals } from "../../../pp/globals.js";
import { Handedness } from "../../cauldron/input_types.js";
import { GamepadAxesID, GamepadButtonID } from "../gamepad_buttons.js";
import { VirtualGamepadGamepadCore } from "../gamepad_cores/virtual_gamepad_gamepad_core.js";
import { VirtualGamepad, VirtualGamepadAxesID, VirtualGamepadButtonID } from "./virtual_gamepad.js";
import { VirtualGamepadParams } from "./virtual_gamepad_params.js";

export class VirtualGamepadComponent extends Component {
    static TypeName = "pp-virtual-gamepad";
    static Properties = {
        _myShowOnDesktop: Property.bool(false),   // You may have to enable headset too
        _myShowOnMobile: Property.bool(true),
        _myShowOnHeadset: Property.bool(false),   // Not 100% reliable, this is true if the device supports XR and it is Desktop
        _myAddToUniversalGamepad: Property.bool(true),
        _myOpacity: Property.float(0.5),
        _myIconColor: Property.string("#e0e0e0"),
        _myBackgroundColor: Property.string("#616161"),
        _myInterfaceScale: Property.float(1),
        _myMarginScale: Property.float(1),

        ADVANCED_PARAMS_BELOW: Property.string(""),

        _myLabelFontSize: Property.float(2),
        _myLabelFontFamily: Property.string("sans-serif"),
        _myLabelFontWeight: Property.string("bold"),
        _myImagePressedBrightness: Property.float(0.5),

        _myLeftFirstButtonVisible: Property.bool(true),
        _myLeftFirstButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Squeeze"),
        _myLeftFirstButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Square"),
        _myLeftFirstButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftSecondButtonVisible: Property.bool(true),
        _myLeftSecondButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Select"),
        _myLeftSecondButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Frame"),
        _myLeftSecondButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftThirdButtonVisible: Property.bool(true),
        _myLeftThirdButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Top Button"),
        _myLeftThirdButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Circle"),
        _myLeftThirdButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftFourthButtonVisible: Property.bool(true),
        _myLeftFourthButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Bottom Button"),
        _myLeftFourthButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Ring"),
        _myLeftFourthButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftDotButtonVisible: Property.bool(true),
        _myLeftDotButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Thumbstick"),
        _myLeftDotButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Dot"),
        _myLeftDotButtonIconLabelOrImageUrl: Property.string(""),

        _myRightFirstButtonVisible: Property.bool(true),
        _myRightFirstButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Squeeze"),
        _myRightFirstButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Square"),
        _myRightFirstButtonIconLabelOrImageUrl: Property.string(""),

        _myRightSecondButtonVisible: Property.bool(true),
        _myRightSecondButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Select"),
        _myRightSecondButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Frame"),
        _myRightSecondButtonIconLabelOrImageUrl: Property.string(""),

        _myRightThirdButtonVisible: Property.bool(true),
        _myRightThirdButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Top Button"),
        _myRightThirdButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Circle"),
        _myRightThirdButtonIconLabelOrImageUrl: Property.string(""),

        _myRightFourthButtonVisible: Property.bool(true),
        _myRightFourthButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Bottom Button"),
        _myRightFourthButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Ring"),
        _myRightFourthButtonIconLabelOrImageUrl: Property.string(""),

        _myRightDotButtonVisible: Property.bool(true),
        _myRightDotButtonGamepadButtonID: Property.enum(["Select", "Squeeze", "Thumbstick", "Top Button", "Bottom Button", "Left Button", "Right Button", "Menu", "Touchpad", "Thumb Rest"], "Thumbstick"),
        _myRightDotButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Dot"),
        _myRightDotButtonIconLabelOrImageUrl: Property.string("")
    };

    start() {
        let params = new VirtualGamepadParams(this.engine);
        params.defaultConfig();

        for (let handedness in params.myButtonParams) {
            for (let gamepadButtonID in params.myButtonParams[handedness]) {
                let buttonParams = params.myButtonParams[handedness][gamepadButtonID];
                buttonParams.myIconParams.myBackgroundColor = this._myBackgroundColor;
                buttonParams.myIconParams.myBackgroundPressedColor = this._myIconColor;
                buttonParams.myIconParams.myIconColor = this._myIconColor;
                buttonParams.myIconParams.myIconPressedColor = this._myBackgroundColor;
            }
        }

        for (let handedness in params.myThumbstickParams) {
            for (let gamepadAxesID in params.myThumbstickParams[handedness]) {
                let thumbstickParams = params.myThumbstickParams[handedness][gamepadAxesID];
                thumbstickParams.myBackgroundColor = this._myBackgroundColor;
                thumbstickParams.myIconParams.myBackgroundColor = this._myIconColor;
                thumbstickParams.myIconParams.myBackgroundPressedColor = this._myIconColor;
                thumbstickParams.myIconParams.myIconColor = this._myBackgroundColor;
                thumbstickParams.myIconParams.myIconPressedColor = this._myBackgroundColor;
            }
        }

        params.myOpacity = this._myOpacity;

        params.myInterfaceScale = this._myInterfaceScale;
        params.myMarginScale = this._myMarginScale;

        params.myShowOnDesktop = this._myShowOnDesktop;
        params.myShowOnMobile = this._myShowOnMobile;
        params.myShowOnHeadset = this._myShowOnHeadset;

        if (params.myShowOnDesktop || params.myShowOnMobile || params.myShowOnHeadset) {
            params.myAutoUpdateVisibility = true;
        } else {
            params.myAutoUpdateVisibility = false;
        }

        this._advancedConfig(params);

        this._myVirtualGamepad = new VirtualGamepad(params);
        this._myVirtualGamepad.setVisible(false);

        this._myVirtualGamepad.start();

        this._myFirstUpdate = true;

        this._myLeftVirtualGamepadGamepadCore = null;
        this._myRightVirtualGamepadGamepadCore = null;
    }

    update(dt) {
        if (this._myFirstUpdate) {
            this._myFirstUpdate = false;

            if (this._myAddToUniversalGamepad) {
                const leftGamepadToVirtualGamepadButtonIDMap = new Map();
                leftGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myLeftFirstButtonGamepadButtonID), VirtualGamepadButtonID.FIRST_BUTTON);
                leftGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myLeftSecondButtonGamepadButtonID), VirtualGamepadButtonID.SECOND_BUTTON);
                leftGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myLeftThirdButtonGamepadButtonID), VirtualGamepadButtonID.THIRD_BUTTON);
                leftGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myLeftFourthButtonGamepadButtonID), VirtualGamepadButtonID.FOURTH_BUTTON);
                leftGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myLeftDotButtonGamepadButtonID), VirtualGamepadButtonID.FIFTH_BUTTON);

                const rightGamepadToVirtualGamepadButtonIDMap = new Map();
                rightGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myRightFirstButtonGamepadButtonID), VirtualGamepadButtonID.FIRST_BUTTON);
                rightGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myRightSecondButtonGamepadButtonID), VirtualGamepadButtonID.SECOND_BUTTON);
                rightGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myRightThirdButtonGamepadButtonID), VirtualGamepadButtonID.THIRD_BUTTON);
                rightGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myRightFourthButtonGamepadButtonID), VirtualGamepadButtonID.FOURTH_BUTTON);
                rightGamepadToVirtualGamepadButtonIDMap.set(this._gamepadPropertyButtonIDToEnum(this._myRightDotButtonGamepadButtonID), VirtualGamepadButtonID.FIFTH_BUTTON);

                const gamepadToVirtualGamepadAxesIDMap = new Map();
                gamepadToVirtualGamepadAxesIDMap.set(GamepadAxesID.THUMBSTICK, VirtualGamepadAxesID.FIRST_AXES);

                const leftHandPose = Globals.getLeftGamepad(this.engine).getGamepadCore("pp_left_xr_gamepad").getHandPose();
                const rightHandPose = Globals.getRightGamepad(this.engine).getGamepadCore("pp_right_xr_gamepad").getHandPose();
                this._myLeftVirtualGamepadGamepadCore = new VirtualGamepadGamepadCore(this._myVirtualGamepad, leftHandPose, leftGamepadToVirtualGamepadButtonIDMap, gamepadToVirtualGamepadAxesIDMap);
                this._myRightVirtualGamepadGamepadCore = new VirtualGamepadGamepadCore(this._myVirtualGamepad, rightHandPose, rightGamepadToVirtualGamepadButtonIDMap, gamepadToVirtualGamepadAxesIDMap);

                Globals.getLeftGamepad(this.engine).addGamepadCore("pp_left_virtual_gamepad", this._myLeftVirtualGamepadGamepadCore);
                Globals.getRightGamepad(this.engine).addGamepadCore("pp_right_virtual_gamepad", this._myRightVirtualGamepadGamepadCore);
            }
        }

        this._myVirtualGamepad.update(dt);
    }

    _advancedConfig(params) {
        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.SECOND_BUTTON];
            buttonParams.myIconParams.myIconType = this._myLeftSecondButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftSecondButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftSecondButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.LEFT][VirtualGamepadButtonID.SECOND_BUTTON] = this._myLeftSecondButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FIRST_BUTTON];
            buttonParams.myIconParams.myIconType = this._myLeftFirstButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftFirstButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftFirstButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.LEFT][VirtualGamepadButtonID.FIRST_BUTTON] = this._myLeftFirstButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FIFTH_BUTTON];
            buttonParams.myIconParams.myIconType = this._myLeftDotButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.LEFT][VirtualGamepadButtonID.FIFTH_BUTTON] = this._myLeftDotButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.THIRD_BUTTON];
            buttonParams.myIconParams.myIconType = this._myLeftThirdButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftThirdButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftThirdButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.LEFT][VirtualGamepadButtonID.THIRD_BUTTON] = this._myLeftThirdButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FOURTH_BUTTON];
            buttonParams.myIconParams.myIconType = this._myLeftFourthButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftFourthButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftFourthButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.LEFT][VirtualGamepadButtonID.FOURTH_BUTTON] = this._myLeftFourthButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.SECOND_BUTTON];
            buttonParams.myIconParams.myIconType = this._myRightSecondButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightSecondButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightSecondButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.RIGHT][VirtualGamepadButtonID.SECOND_BUTTON] = this._myRightSecondButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FIRST_BUTTON];
            buttonParams.myIconParams.myIconType = this._myRightFirstButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightFirstButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightFirstButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.RIGHT][VirtualGamepadButtonID.FIRST_BUTTON] = this._myRightFirstButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FIFTH_BUTTON];
            buttonParams.myIconParams.myIconType = this._myRightDotButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.RIGHT][VirtualGamepadButtonID.FIFTH_BUTTON] = this._myRightDotButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.THIRD_BUTTON];
            buttonParams.myIconParams.myIconType = this._myRightThirdButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightThirdButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightThirdButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.RIGHT][VirtualGamepadButtonID.THIRD_BUTTON] = this._myRightThirdButtonVisible;
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FOURTH_BUTTON];
            buttonParams.myIconParams.myIconType = this._myRightFourthButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightFourthButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightFourthButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            params.myButtonsEnabled[Handedness.RIGHT][VirtualGamepadButtonID.FOURTH_BUTTON] = this._myRightFourthButtonVisible;
        }
    }

    _gamepadPropertyButtonIDToEnum(propertyButtonID) {
        let buttonID = null;

        switch (propertyButtonID) {
            case 0:
                buttonID = GamepadButtonID.SELECT;
                break;
            case 1:
                buttonID = GamepadButtonID.SQUEEZE;
                break;
            case 2:
                buttonID = GamepadButtonID.THUMBSTICK;
                break;
            case 3:
                buttonID = GamepadButtonID.TOP_BUTTON;
                break;
            case 4:
                buttonID = GamepadButtonID.BOTTOM_BUTTON;
                break;
            case 5:
                buttonID = GamepadButtonID.LEFT_BUTTON;
                break;
            case 6:
                buttonID = GamepadButtonID.RIGHT_BUTTON;
                break;
            case 7:
                buttonID = GamepadButtonID.MENU;
                break;
            case 8:
                buttonID = GamepadButtonID.TOUCHPAD;
                break;
            case 9:
                buttonID = GamepadButtonID.THUMB_REST;
                break;
        }

        return buttonID;
    }

    onDestroy() {
        Globals.getLeftGamepad(this.engine)?.removeGamepadCore("pp_left_virtual_gamepad");
        Globals.getRightGamepad(this.engine)?.removeGamepadCore("pp_right_virtual_gamepad");

        this._myLeftVirtualGamepadGamepadCore.destroy();
        this._myRightVirtualGamepadGamepadCore.destroy();

        this._myVirtualGamepad.destroy();
    }
}