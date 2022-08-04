PP.MouseButtonType = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
};

PP.Mouse = class Mouse {
    constructor() {
        // #TODO refactor Mouse/Keyboard/Gamepad and create an parent sort of ButtonHandler that have the base ButtonInfo and all of them inherit
        // ButtonType could also become GamepadButtonID or directly GamepadButton like in Unity

        this._myButtonInfos = new Map();
        for (let typeKey in PP.MouseButtonType) {
            this._myButtonInfos.set(PP.MouseButtonType[typeKey],
                { myIsPressed: false, myIsPressStart: false, myIsPressStartToProcess: false, myIsPressEnd: false, myIsPressEndToProcess: false, });
        }

        this._myOnMouseMoveCallback = this._onMouseMove.bind(this);
        WL.canvas.addEventListener("mousemove", this._myOnMouseMoveCallback);
        this._myOnMouseDownCallback = this._onMouseDown.bind(this);
        WL.canvas.addEventListener("mousedown", this._myOnMouseDownCallback);
        this._myOnMouseUpCallback = this._onMouseUp.bind(this);
        WL.canvas.addEventListener("mouseup", this._myOnMouseUpCallback);
        this._myOnMouseLeaveCallback = this._onMouseLeave.bind(this);
        WL.canvas.addEventListener("mouseleave", this._myOnMouseLeaveCallback);

        this._myPreventContextMenuCallback = this._preventContextMenu.bind(this);

        this._myInternalMousePosition = PP.vec2_create();
        this._myScreenSize = PP.vec2_create();

        this._myIsMovingToProcess = false;
        this._myIsMoving = false;

        this._myContextMenuActive = false;

        // Support Variables
        this._myProjectionMatrixInverse = PP.mat4_create();
        this._myRotationQuat = PP.quat_create();
        this._myOriginWorld = PP.vec3_create();
        this._myDirectionWorld = PP.vec3_create();
    }

    update(dt) {
        this._myIsMoving = this._myIsMovingToProcess;
        this._myIsMovingToProcess = false;

        for (let typeKey in PP.MouseButtonType) {
            let mouseButton = this._myButtonInfos.get(PP.MouseButtonType[typeKey]);
            mouseButton.myIsPressStart = mouseButton.myIsPressStartToProcess;
            mouseButton.myIsPressEnd = mouseButton.myIsPressEndToProcess;
            mouseButton.myIsPressStartToProcess = false;
            mouseButton.myIsPressEndToProcess = false;
        }
    }

    destroy() {
        WL.canvas.removeEventListener("mousemove", this._myOnMouseMoveCallback);
        WL.canvas.removeEventListener("mousedown", this._myOnMouseDownCallback);
        WL.canvas.removeEventListener("mouseup", this._myOnMouseUpCallback);
        WL.canvas.removeEventListener("mouseleave", this._myOnMouseLeaveCallback);
        WL.canvas.removeEventListener("contextmenu", this._myPreventContextMenuCallback);
    }

    isButtonPressed(mouseButtonType = null) {
        if (mouseButtonType != null) {
            return this._myButtonInfos.get(mouseButtonType).myIsPressed;
        }

        let isAnyPressed = false;
        for (let buttonInfo of this._myButtonInfos.values()) {
            if (buttonInfo.myIsPressed) {
                isAnyPressed = true;
                break;
            }
        }

        return isAnyPressed;
    }

    isButtonPressStart(mouseButtonType = null) {
        if (mouseButtonType != null) {
            return this._myButtonInfos.get(mouseButtonType).myIsPressStart;
        }

        let isAnyPressStart = false;
        for (let buttonInfo of this._myButtonInfos.values()) {
            if (buttonInfo.myIsPressStart) {
                isAnyPressStart = true;
                break;
            }
        }

        return isAnyPressStart;
    }

    isButtonPressEnd(mouseButtonType = null) {
        if (mouseButtonType != null) {
            return this._myButtonInfos.get(mouseButtonType).myIsPressEnd;
        }

        let isAnyPressEnd = false;
        for (let buttonInfo of this._myButtonInfos.values()) {
            if (buttonInfo.myIsPressEnd) {
                isAnyPressEnd = true;
                break;
            }
        }

        return isAnyPressEnd;
    }

    isMoving() {
        return this._myIsMoving;
    }

    setContextMenuActive(active) {
        if (this._myContextMenuActive != active) {
            if (active) {
                WL.canvas.removeEventListener("contextmenu", this._myPreventContextMenuCallback);
            } else {
                WL.canvas.addEventListener("contextmenu", this._myPreventContextMenuCallback, false);
            }
            this._myContextMenuActive = active;
        }
    }

    getPositionScreen(out = PP.vec2_create()) {
        let mousePosition = out;
        mousePosition[0] = this._myInternalMousePosition[0];
        mousePosition[1] = this._myScreenSize[1] - 1 - this._myInternalMousePosition[1];
        return mousePosition;
    }

    getScreenSize() {
        return this._myScreenSize;
    }

    getPositionWorld(distanceFromCamera, out = PP.vec3_create()) {
        let originWorld = this.getOriginWorld(this._myOriginWorld);
        let directionWorld = this.getDirectionWorld(this._myDirectionWorld);

        out = originWorld.vec3_add(directionWorld.vec3_scale(distanceFromCamera, out), out);
        return out;
    }

    getOriginWorld(out = PP.vec3_create()) {
        if (PP.XRUtils.isXRSessionActive()) {
            PP.myPlayerObjects.myEyeLeft.pp_getPosition(out);
        } else {
            PP.myPlayerObjects.myNonVRCamera.pp_getPosition(out);
        }

        return out;
    }

    getDirectionWorld(out = PP.vec3_create()) {
        let right = this._myInternalMousePosition[0] / this._myScreenSize[0];
        let up = this._myInternalMousePosition[1] / this._myScreenSize[1];

        let directionLocal = out;
        directionLocal.vec3_set(right * 2 - 1, -up * 2 + 1, -1.0);

        let projectionMatrixInvert = this._myProjectionMatrixInverse;
        if (PP.XRUtils.isXRSessionActive()) {
            projectionMatrixInvert = PP.myPlayerObjects.myEyeLeft.pp_getComponentHierarchy("view").projectionMatrix.mat4_invert(projectionMatrixInvert);
        } else {
            projectionMatrixInvert = PP.myPlayerObjects.myNonVRCamera.pp_getComponentHierarchy("view").projectionMatrix.mat4_invert(projectionMatrixInvert);
        }

        directionLocal.vec3_transformMat4(projectionMatrixInvert, directionLocal);
        directionLocal.vec3_normalize(directionLocal);

        let directionWorld = directionLocal;
        if (PP.XRUtils.isXRSessionActive()) {
            directionWorld = directionLocal.vec3_transformQuat(PP.myPlayerObjects.myEyeLeft.pp_getRotationQuat(this._myRotationQuat), directionLocal);
        } else {
            directionWorld = directionLocal.vec3_transformQuat(PP.myPlayerObjects.myNonVRCamera.pp_getRotationQuat(this._myRotationQuat), directionLocal);
        }

        directionWorld.vec3_normalize(directionWorld);

        return out;
    }

    // the origin and direction are set by the mouse
    raycastWorld(raycastSetup, raycastResult = new PP.RaycastResult()) {
        this.getOriginWorld(raycastSetup.myOrigin);
        this.getDirectionWorld(raycastSetup.myDirection);
        raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);
        return raycastResult;
    }

    _updatePositionAndView(event) {
        let bounds = event.target.getBoundingClientRect();
        this._myScreenSize[0] = bounds.width;
        this._myScreenSize[1] = bounds.height;
        this._myInternalMousePosition[0] = event.clientX;
        this._myInternalMousePosition[1] = event.clientY;
    }

    _onMouseMove(event) {
        this._myIsMovingToProcess = true;

        this._updatePositionAndView(event);
    }

    _onMouseDown(event) {
        let mouseButton = this._myButtonInfos.get(event.button);
        if (!mouseButton.myIsPressed) {
            mouseButton.myIsPressed = true;
            mouseButton.myIsPressStartToProcess = true;
        }

        this._updatePositionAndView(event);
    }

    _onMouseUp(event) {
        let mouseButton = this._myButtonInfos.get(event.button);
        if (mouseButton.myIsPressed) {
            mouseButton.myIsPressed = false;
            mouseButton.myIsPressEndToProcess = true;
        }

        this._updatePositionAndView(event);
    }

    _onMouseLeave(event) {
        for (let typeKey in PP.MouseButtonType) {
            let mouseButton = this._myButtonInfos.get(PP.MouseButtonType[typeKey]);
            if (mouseButton.myIsPressed) {
                mouseButton.myIsPressed = false;
                mouseButton.myIsPressEndToProcess = true;
            }
        }
    }

    _preventContextMenu(event) {
        event.preventDefault();
    }
};