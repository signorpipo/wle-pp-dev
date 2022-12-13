VirtualGamepadVirtualThumbstick = class VirtualGamepadVirtualThumbstick {
    constructor(thumbstickElementParent, virtualGamepadParams, virtualThumbstickHandedness, gamepadThumbstickHandedness) {
        this._myThumbstickElement = null;
        this._myThumbstickIcon = null;
        this._myThumbstickContainer = null;

        this._myIsActive = true;

        this._myPointerID = null;
        this._myThumbstickDragStartPosition = PP.vec2_create();

        this._myAxes = PP.vec2_create();
        this._myIsPressed = false;

        this._myParams = virtualGamepadParams.myThumbstickParams[gamepadThumbstickHandedness];

        this._build(thumbstickElementParent, virtualGamepadParams, virtualThumbstickHandedness);

        this._myThumbstickElement.addEventListener("pointerdown", this._onPointerDown.bind(this, virtualGamepadParams.myStopPropagatingPointerDownEvents));
        document.body.addEventListener("pointerup", this._onPointerUp.bind(this));
        document.body.addEventListener("pointermove", this._onPointerMove.bind(this));

        if (virtualGamepadParams.myReleaseOnPointerLeave) {
            document.body.addEventListener("pointerleave", this._onPointerUp.bind(this));
        }
    }

    isPressed() {
        return this._myIsActive && this._myIsPressed;
    }

    getAxes() {
        return this._myAxes;
    }

    setActive(active) {
        this._myIsActive = active;
    }

    reset() {
        if (this._myIsPressed) {
            this._myThumbstickIcon.setPressed(false);

            this._myAxes[0] = 0;
            this._myAxes[1] = 0;
            this._myIsPressed = false;
            this._myPointerID = null;

            this._myThumbstickElement.style.transition = "all " + this._myParams.myReleaseTransitionSeconds + "s ease 0s";
            this._myThumbstickElement.style.transform = "translate(0px, 0px)";
        }
    }

    _onPointerDown(stopPropagatingPointerDownEvents, event) {
        if (!this._myIsActive) return;
        if (this._myIsPressed) return;

        if (stopPropagatingPointerDownEvents) {
            event.stopPropagation();
        }
        event.preventDefault();

        this._myThumbstickIcon.setPressed(true);

        this._myPointerID = event.pointerId;

        this._myThumbstickDragStartPosition[0] = event.clientX;
        this._myThumbstickDragStartPosition[1] = event.clientY;

        this._myIsPressed = true;
    }

    _onPointerUp(event) {
        if (!this._myIsActive) return;
        if (!this._myIsPressed) return;

        if (event.pointerId != this._myPointerID) return;

        this.reset();
    }

    _onPointerMove(event) {
        if (!this._myIsActive) return;
        if (!this._myIsPressed) return;

        if (event.pointerId != this._myPointerID) return;

        let mouseX = event.clientX;
        let mouseY = event.clientY;

        let containerRect = this._myThumbstickContainer.getBoundingClientRect();
        let maxDistanceFromCenter = (containerRect.width / 2) * this._myParams.myMaxDistanceFromCenterMultiplier;

        let xDiff = mouseX - this._myThumbstickDragStartPosition[0];
        let yDiff = mouseY - this._myThumbstickDragStartPosition[1];

        let angle = Math.atan2(yDiff, xDiff);
        let distanceFromDragStart = Math.min(maxDistanceFromCenter, Math.hypot(xDiff, yDiff));

        let translateThumbstickX = distanceFromDragStart * Math.cos(angle);
        let translateThumbstickY = distanceFromDragStart * Math.sin(angle);

        this._myThumbstickElement.style.transition = "all " + this._myParams.myMoveTransitionSeconds + "s ease-out 0s";
        this._myThumbstickElement.style.transform = "translate(" + translateThumbstickX + "px, " + translateThumbstickY + "px)";

        this._myAxes[0] = translateThumbstickX / maxDistanceFromCenter;
        this._myAxes[1] = -(translateThumbstickY / maxDistanceFromCenter);
    }

    _build(thumbstickElementParent, virtualGamepadParams, virtualThumbstickHandedness) {
        // setup variables used for the sizes and the like

        let thumbstickSize = virtualGamepadParams.myThumbstickSize * virtualGamepadParams.myInterfaceScale;

        let marginBottom = virtualGamepadParams.myMarginBottom * virtualGamepadParams.myInterfaceScale * virtualGamepadParams.myMarginScale;
        let marginLeft = virtualGamepadParams.myMarginLeft * virtualGamepadParams.myInterfaceScale * virtualGamepadParams.myMarginScale;
        let marginRight = virtualGamepadParams.myMarginRight * virtualGamepadParams.myInterfaceScale * virtualGamepadParams.myMarginScale;

        let minSizeMultiplier = Math.max(1, virtualGamepadParams.myMinSizeMultiplier / virtualGamepadParams.myInterfaceScale);

        // actual thumbstick creation

        this._myThumbstickContainer = document.createElement("div");
        this._myThumbstickContainer.style.position = "absolute";
        this._myThumbstickContainer.style.width = this._createSizeValue(thumbstickSize, minSizeMultiplier);
        this._myThumbstickContainer.style.height = this._createSizeValue(thumbstickSize, minSizeMultiplier);
        this._myThumbstickContainer.style.bottom = this._createSizeValue(marginBottom, minSizeMultiplier);

        if (virtualThumbstickHandedness == PP.Handedness.LEFT) {
            this._myThumbstickContainer.style.left = this._createSizeValue(marginLeft, minSizeMultiplier);
        } else {
            this._myThumbstickContainer.style.right = this._createSizeValue(marginRight, minSizeMultiplier);
        }

        thumbstickElementParent.appendChild(this._myThumbstickContainer);

        let thumbstickContainerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        thumbstickContainerSVG.style.position = "absolute";
        thumbstickContainerSVG.style.width = "100%";
        thumbstickContainerSVG.style.height = "100%";
        this._myThumbstickContainer.appendChild(thumbstickContainerSVG);

        let thumbstickBackground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        thumbstickBackground.setAttributeNS(null, 'cx', "50%");
        thumbstickBackground.setAttributeNS(null, 'cy', "50%");
        thumbstickBackground.setAttributeNS(null, 'r', "48%");
        thumbstickBackground.style.fill = this._myParams.myBackgroundColor;
        thumbstickContainerSVG.appendChild(thumbstickBackground);

        this._myThumbstickElement = document.createElement("div");
        this._myThumbstickElement.style.position = "absolute";
        this._myThumbstickElement.style.width = "34%";
        this._myThumbstickElement.style.height = "34%";
        this._myThumbstickElement.style.top = "33%";
        this._myThumbstickElement.style.left = "33%";
        this._myThumbstickContainer.appendChild(this._myThumbstickElement);

        this._myThumbstickIcon = new VirtualGamepadIcon(this._myThumbstickElement, this._myParams.myIconParams, minSizeMultiplier, virtualGamepadParams.myScale);
    }

    _createSizeValue(value, minSizeMultiplier) {
        return "min(" + value.toFixed(3) + "vmax," + (value * minSizeMultiplier).toFixed(3) + "vw)";
    }
};