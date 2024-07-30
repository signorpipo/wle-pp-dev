import { Globals } from "../../../pp/globals.js";
import { Handedness } from "../../cauldron/input_types.js";
import { VirtualGamepadAxesID, VirtualGamepadButtonID } from "./virtual_gamepad.js";
import { VirtualGamepadIconParams, VirtualGamepadIconType } from "./virtual_gamepad_icon.js";

export class VirtualGamepadButtonParams {

    constructor() {
        this.myIconParams = new VirtualGamepadIconParams();
    }
}

export class VirtualGamepadThumbstickParams {

    constructor() {
        this.myBackgroundColor = "";

        this.myMaxDistanceFromCenterMultiplier = 1;

        this.myReleaseTransitionSeconds = 0.2;
        this.myMoveTransitionSeconds = 0;

        this.myIncludeBackgroundToDetection = false; // You can press the background of the icon to move the thumbstick, makes it harder to miss it

        this.myIconParams = new VirtualGamepadIconParams();
    }
}

export class VirtualGamepadParams {

    constructor(engine = Globals.getMainEngine()) {
        this.myShowOnDesktop = false;
        this.myShowOnMobile = false;
        this.myShowOnHeadset = false;   // Not 100% reliable, this is true if the device supports XR and it is Desktop

        this.myAutoUpdateVisibility = false;

        this.myOpacity = 1;

        this.myInterfaceScale = 1;
        this.myMarginScale = 1;

        this.myReleaseOnPointerLeave = true;            // If mouse leaves the canvas it will be like it was released
        this.myStopPropagatingMouseDownEvents = true;   // This can be used to make it so the rest of the game will ignore clicks on the virtual gamepad

        // Advanced Params

        this.myButtonParams = [];
        this.myButtonParams[Handedness.LEFT] = [];
        this.myButtonParams[Handedness.RIGHT] = [];

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FRAME] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.SQUARE] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.DOT] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.CIRCLE] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.RING] = new VirtualGamepadButtonParams();

        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FRAME] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.SQUARE] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.DOT] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.CIRCLE] = new VirtualGamepadButtonParams();
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.RING] = new VirtualGamepadButtonParams();

        this.myThumbstickParams = [];
        this.myThumbstickParams[Handedness.LEFT] = [];
        this.myThumbstickParams[Handedness.RIGHT] = [];
        this.myThumbstickParams[Handedness.LEFT][VirtualGamepadAxesID.THUMBSTICK] = new VirtualGamepadThumbstickParams();
        this.myThumbstickParams[Handedness.RIGHT][VirtualGamepadAxesID.THUMBSTICK] = new VirtualGamepadThumbstickParams();

        this.myButtonsOrder = [];
        this.myButtonsOrder[Handedness.LEFT] = [null, null, null, null, null];
        this.myButtonsOrder[Handedness.RIGHT] = [null, null, null, null, null];

        this.myThumbsticksOrder = [];
        this.myThumbsticksOrder[Handedness.LEFT] = [null];
        this.myThumbsticksOrder[Handedness.RIGHT] = [null];

        // Even More Advanced Params

        this.myValidPointerButtons = [];

        this.myMarginLeft = 0;
        this.myMarginRight = 0;
        this.myMarginBottom = 0;

        this.myThumbstickSize = 0;

        this.myButtonSize = 0;
        this.myButtonsRingRadius = 0;
        this.myButtonsRingStartAngle = 0;
        this.myButtonsRingEndAngle = 0;

        this.myFontSize = 0;

        this.myMinSizeMultiplier = 0;  // Can be used to specify a min size based on the view width for when the view is in portrait mode

        this.myDisableMouseHoverWhenPressed = false;

        this.myEngine = engine;
    }

    defaultConfig() {
        this.myShowOnMobile = true;
        this.myAutoUpdateVisibility = true;

        this.myOpacity = 0.5;

        // Params

        let backgroundColor = "#616161";
        let iconColor = "#e0e0e0";

        let buttonHoveredBrightness = 0.75;
        let thumbstickHoveredBrightness = 0.75;

        let thumbstickIncludeBackgroundToDetection = true;

        for (let handedness in this.myButtonParams) {
            for (let gamepadButtonID in this.myButtonParams[handedness]) {
                let buttonParams = this.myButtonParams[handedness][gamepadButtonID];
                buttonParams.myIconParams.myBackgroundColor = backgroundColor;
                buttonParams.myIconParams.myBackgroundPressedColor = iconColor;
                buttonParams.myIconParams.myIconColor = iconColor;
                buttonParams.myIconParams.myIconPressedColor = backgroundColor;
                buttonParams.myIconParams.myOverallHoveredBrightness = buttonHoveredBrightness;
            }
        }

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.SQUARE].myIconParams.myIconType = VirtualGamepadIconType.SQUARE;
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.SQUARE].myIconParams.myIconType = VirtualGamepadIconType.SQUARE;

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.FRAME].myIconParams.myIconType = VirtualGamepadIconType.FRAME;
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.FRAME].myIconParams.myIconType = VirtualGamepadIconType.FRAME;

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.CIRCLE].myIconParams.myIconType = VirtualGamepadIconType.CIRCLE;
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.CIRCLE].myIconParams.myIconType = VirtualGamepadIconType.CIRCLE;

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.RING].myIconParams.myIconType = VirtualGamepadIconType.RING;
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.RING].myIconParams.myIconType = VirtualGamepadIconType.RING;

        this.myButtonParams[Handedness.LEFT][VirtualGamepadButtonID.DOT].myIconParams.myIconType = VirtualGamepadIconType.DOT;
        this.myButtonParams[Handedness.RIGHT][VirtualGamepadButtonID.DOT].myIconParams.myIconType = VirtualGamepadIconType.DOT;

        for (let handedness in this.myThumbstickParams) {
            for (let gamepadAxesID in this.myThumbstickParams[handedness]) {
                let thumbstickParams = this.myThumbstickParams[handedness][gamepadAxesID];
                thumbstickParams.myBackgroundColor = backgroundColor;
                thumbstickParams.myIconParams.myBackgroundColor = iconColor;
                thumbstickParams.myIconParams.myBackgroundPressedColor = iconColor;
                thumbstickParams.myIconParams.myIconColor = backgroundColor;
                thumbstickParams.myIconParams.myIconPressedColor = backgroundColor;
                thumbstickParams.myIconParams.myOverallHoveredBrightness = thumbstickHoveredBrightness;

                thumbstickParams.myIncludeBackgroundToDetection = thumbstickIncludeBackgroundToDetection;
            }
        }

        // Orders

        this.myButtonsOrder[Handedness.LEFT][0] = [Handedness.LEFT, VirtualGamepadButtonID.SQUARE];
        this.myButtonsOrder[Handedness.LEFT][1] = [Handedness.LEFT, VirtualGamepadButtonID.FRAME];
        this.myButtonsOrder[Handedness.LEFT][2] = [Handedness.LEFT, VirtualGamepadButtonID.CIRCLE];
        this.myButtonsOrder[Handedness.LEFT][3] = [Handedness.LEFT, VirtualGamepadButtonID.RING];
        this.myButtonsOrder[Handedness.LEFT][4] = [Handedness.LEFT, VirtualGamepadButtonID.DOT];

        this.myButtonsOrder[Handedness.RIGHT][0] = [Handedness.RIGHT, VirtualGamepadButtonID.SQUARE];
        this.myButtonsOrder[Handedness.RIGHT][1] = [Handedness.RIGHT, VirtualGamepadButtonID.FRAME];
        this.myButtonsOrder[Handedness.RIGHT][2] = [Handedness.RIGHT, VirtualGamepadButtonID.CIRCLE];
        this.myButtonsOrder[Handedness.RIGHT][3] = [Handedness.RIGHT, VirtualGamepadButtonID.RING];
        this.myButtonsOrder[Handedness.RIGHT][4] = [Handedness.RIGHT, VirtualGamepadButtonID.DOT];

        this.myThumbsticksOrder[Handedness.LEFT][0] = [Handedness.LEFT, VirtualGamepadAxesID.THUMBSTICK];
        this.myThumbsticksOrder[Handedness.RIGHT][0] = [Handedness.RIGHT, VirtualGamepadAxesID.THUMBSTICK];

        // Sizes

        this.myMarginLeft = 3;
        this.myMarginRight = 3;
        this.myMarginBottom = 3;

        this.myThumbstickSize = 15;

        this.myButtonSize = 5;
        this.myButtonsRingRadius = 12;
        this.myButtonsRingStartAngle = 385;
        this.myButtonsRingEndAngle = 245;

        this.myMinSizeMultiplier = 5 / 3;

        // Cauldron

        this.myDisableMouseHoverWhenPressed = true;
        this.myValidPointerButtons = [0];
    }
}