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

        _myLeftFrameButtonVisible: Property.bool(true),
        _myLeftFrameButtonOrderIndex: Property.int(1),
        _myLeftFrameButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Frame"),
        _myLeftFrameButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftSquareButtonVisible: Property.bool(true),
        _myLeftSquareButtonOrderIndex: Property.int(0),
        _myLeftSquareButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Square"),
        _myLeftSquareButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftCircleButtonVisible: Property.bool(true),
        _myLeftCircleButtonOrderIndex: Property.int(2),
        _myLeftCircleButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Circle"),
        _myLeftCircleButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftRingButtonVisible: Property.bool(true),
        _myLeftRingButtonOrderIndex: Property.int(3),
        _myLeftRingButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Ring"),
        _myLeftRingButtonIconLabelOrImageUrl: Property.string(""),

        _myLeftDotButtonVisible: Property.bool(true),
        _myLeftDotButtonOrderIndex: Property.int(4),
        _myLeftDotButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Dot"),
        _myLeftDotButtonIconLabelOrImageUrl: Property.string(""),

        _myRightFrameButtonVisible: Property.bool(true),
        _myRightFrameButtonOrderIndex: Property.int(1),
        _myRightFrameButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Frame"),
        _myRightFrameButtonIconLabelOrImageUrl: Property.string(""),

        _myRightSquareButtonVisible: Property.bool(true),
        _myRightSquareButtonOrderIndex: Property.int(0),
        _myRightSquareButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Square"),
        _myRightSquareButtonIconLabelOrImageUrl: Property.string(""),

        _myRightCircleButtonVisible: Property.bool(true),
        _myRightCircleButtonOrderIndex: Property.int(2),
        _myRightCircleButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Circle"),
        _myRightCircleButtonIconLabelOrImageUrl: Property.string(""),

        _myRightRingButtonVisible: Property.bool(true),
        _myRightRingButtonOrderIndex: Property.int(3),
        _myRightRingButtonIconType: Property.enum(["None", "Label", "Image", "Dot", "Circle", "Square", "Ring", "Frame"], "Ring"),
        _myRightRingButtonIconLabelOrImageUrl: Property.string(""),

        _myRightDotButtonVisible: Property.bool(true),
        _myRightDotButtonOrderIndex: Property.int(4),
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
                const gamepadToVirtualGamepadButtonIDMap = new Map();
                gamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.SELECT, VirtualGamepadButtonID.FRAME);
                gamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.SQUEEZE, VirtualGamepadButtonID.SQUARE);
                gamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.TOP_BUTTON, VirtualGamepadButtonID.CIRCLE);
                gamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.BOTTOM_BUTTON, VirtualGamepadButtonID.RING);
                gamepadToVirtualGamepadButtonIDMap.set(GamepadButtonID.THUMBSTICK, VirtualGamepadButtonID.DOT);

                const gamepadToVirtualGamepadAxesIDMap = new Map();
                gamepadToVirtualGamepadAxesIDMap.set(GamepadAxesID.THUMBSTICK, VirtualGamepadAxesID.THUMBSTICK);

                const leftHandPose = Globals.getLeftGamepad(this.engine).getGamepadCore("pp_left_xr_gamepad").getHandPose();
                const rightHandPose = Globals.getRightGamepad(this.engine).getGamepadCore("pp_right_xr_gamepad").getHandPose();
                this._myLeftVirtualGamepadGamepadCore = new VirtualGamepadGamepadCore(this._myVirtualGamepad, leftHandPose, gamepadToVirtualGamepadButtonIDMap, gamepadToVirtualGamepadAxesIDMap);
                this._myRightVirtualGamepadGamepadCore = new VirtualGamepadGamepadCore(this._myVirtualGamepad, rightHandPose, gamepadToVirtualGamepadButtonIDMap, gamepadToVirtualGamepadAxesIDMap);

                Globals.getLeftGamepad(this.engine).addGamepadCore("pp_left_virtual_gamepad", this._myLeftVirtualGamepadGamepadCore);
                Globals.getRightGamepad(this.engine).addGamepadCore("pp_right_virtual_gamepad", this._myRightVirtualGamepadGamepadCore);
            }
        }

        this._myVirtualGamepad.update(dt);
    }

    _advancedConfig(params) {
        params.myButtonsOrder[Handedness.LEFT] = [null, null, null, null, null];
        params.myButtonsOrder[Handedness.RIGHT] = [null, null, null, null, null];

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FRAME];
            buttonParams.myIconParams.myIconType = this._myLeftFrameButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftFrameButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftFrameButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myLeftFrameButtonVisible) {
                params.myButtonsOrder[Handedness.LEFT][this._myLeftFrameButtonOrderIndex] = [Handedness.LEFT, VirtualGamepadButtonID.FRAME];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.SQUARE];
            buttonParams.myIconParams.myIconType = this._myLeftSquareButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftSquareButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftSquareButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myLeftSquareButtonVisible) {
                params.myButtonsOrder[Handedness.LEFT][this._myLeftSquareButtonOrderIndex] = [Handedness.LEFT, VirtualGamepadButtonID.SQUARE];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.DOT];
            buttonParams.myIconParams.myIconType = this._myLeftDotButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myLeftDotButtonVisible) {
                params.myButtonsOrder[Handedness.LEFT][this._myLeftDotButtonOrderIndex] = [Handedness.LEFT, VirtualGamepadButtonID.DOT];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.CIRCLE];
            buttonParams.myIconParams.myIconType = this._myLeftCircleButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftCircleButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftCircleButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myLeftCircleButtonVisible) {
                params.myButtonsOrder[Handedness.LEFT][this._myLeftCircleButtonOrderIndex] = [Handedness.LEFT, VirtualGamepadButtonID.CIRCLE];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.RING];
            buttonParams.myIconParams.myIconType = this._myLeftRingButtonIconType;
            buttonParams.myIconParams.myLabel = this._myLeftRingButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myLeftRingButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myLeftRingButtonVisible) {
                params.myButtonsOrder[Handedness.LEFT][this._myLeftRingButtonOrderIndex] = [Handedness.LEFT, VirtualGamepadButtonID.RING];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FRAME];
            buttonParams.myIconParams.myIconType = this._myRightFrameButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightFrameButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightFrameButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myRightFrameButtonVisible) {
                params.myButtonsOrder[Handedness.RIGHT][this._myRightFrameButtonOrderIndex] = [Handedness.RIGHT, VirtualGamepadButtonID.FRAME];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.SQUARE];
            buttonParams.myIconParams.myIconType = this._myRightSquareButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightSquareButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightSquareButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myRightSquareButtonVisible) {
                params.myButtonsOrder[Handedness.RIGHT][this._myRightSquareButtonOrderIndex] = [Handedness.RIGHT, VirtualGamepadButtonID.SQUARE];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.DOT];
            buttonParams.myIconParams.myIconType = this._myRightDotButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightDotButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myRightDotButtonVisible) {
                params.myButtonsOrder[Handedness.RIGHT][this._myRightDotButtonOrderIndex] = [Handedness.RIGHT, VirtualGamepadButtonID.DOT];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.CIRCLE];
            buttonParams.myIconParams.myIconType = this._myRightCircleButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightCircleButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightCircleButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myRightCircleButtonVisible) {
                params.myButtonsOrder[Handedness.RIGHT][this._myRightCircleButtonOrderIndex] = [Handedness.RIGHT, VirtualGamepadButtonID.CIRCLE];
            }
        }

        {
            let buttonParams = params.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.RING];
            buttonParams.myIconParams.myIconType = this._myRightRingButtonIconType;
            buttonParams.myIconParams.myLabel = this._myRightRingButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myImageURL = this._myRightRingButtonIconLabelOrImageUrl;
            buttonParams.myIconParams.myLabelFontSize = this._myLabelFontSize;
            buttonParams.myIconParams.myLabelFontFamily = this._myLabelFontFamily;
            buttonParams.myIconParams.myLabelFontWeight = this._myLabelFontWeight;
            buttonParams.myIconParams.myImagePressedBrightness = this._myImagePressedBrightness;

            if (this._myRightRingButtonVisible) {
                params.myButtonsOrder[Handedness.RIGHT][this._myRightRingButtonOrderIndex] = [Handedness.RIGHT, VirtualGamepadButtonID.RING];
            }
        }
    }

    onDestroy() {
        Globals.getLeftGamepad(this.engine)?.removeGamepadCore("pp_left_virtual_gamepad");
        Globals.getRightGamepad(this.engine)?.removeGamepadCore("pp_right_virtual_gamepad");

        this._myLeftVirtualGamepadGamepadCore.destroy();
        this._myRightVirtualGamepadGamepadCore.destroy();

        this._myVirtualGamepad.destroy();
    }
}