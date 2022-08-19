PlayerLocomotionDirectionReferenceType = {
    HEAD: 0,
    HAND_LEFT: 1,
    HAND_RIGHT: 2,
};

PlayerLocomotionSmoothParams = class PlayerLocomotionSmoothParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myMaxSpeed = 0;

        this.myMovementMinStickIntensityThreshold = 0;

        this.myFlyEnabled = false;
        this.myMinAngleToFlyUpHead = 0;
        this.myMinAngleToFlyDownHead = 0;
        this.myMinAngleToFlyUpHand = 0;
        this.myMinAngleToFlyDownHand = 0;
        this.myMinAngleToFlyRight = 0;

        this.myDirectionReferenceType = PlayerLocomotionDirectionReferenceType.HEAD;
    }
};

PlayerLocomotionSmooth = class PlayerLocomotionSmooth {
    constructor(params) {
        this._myParams = params;

        this._myDirectionReference = PP.myPlayerObjects.myHead;

        this._myStickIdleTimer = new PP.Timer(0.25, false);

        let directionConverterHeadParams = new PP.Direction2DTo3DConverterParams();
        directionConverterHeadParams.myAutoUpdateFlyForward = this._myParams.myFlyEnabled;
        directionConverterHeadParams.myAutoUpdateFlyRight = this._myParams.myFlyEnabled;
        directionConverterHeadParams.myMinAngleToFlyForwardUp = this._myParams.myMinAngleToFlyUpHead;
        directionConverterHeadParams.myMinAngleToFlyForwardDown = this._myParams.myMinAngleToFlyDownHead;
        directionConverterHeadParams.myMinAngleToFlyRightUp = this._myParams.myMinAngleToFlyRight;
        directionConverterHeadParams.myMinAngleToFlyRightDown = this._myParams.myMinAngleToFlyRight;

        let directionConverterHandParams = new PP.Direction2DTo3DConverterParams();
        directionConverterHandParams.myAutoUpdateFlyForward = this._myParams.myFlyEnabled;
        directionConverterHandParams.myAutoUpdateFlyRight = this._myParams.myFlyEnabled;
        directionConverterHandParams.myMinAngleToFlyForwardUp = this._myParams.myMinAngleToFlyUpHand;
        directionConverterHandParams.myMinAngleToFlyForwardDown = this._myParams.myMinAngleToFlyDownHand;
        directionConverterHandParams.myMinAngleToFlyRightUp = this._myParams.myMinAngleToFlyRight;
        directionConverterHandParams.myMinAngleToFlyRightDown = this._myParams.myMinAngleToFlyRight;

        this._myDirectionConverterHead = new PP.Direction2DTo3DConverter(directionConverterHeadParams);
        this._myDirectionConverterHand = new PP.Direction2DTo3DConverter(directionConverterHandParams);
        this._myCurrentDirectionConverter = this._myDirectionConverterHead;

        this._myIsFlying = false;
    }

    init() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    start() {

    }

    stop() {

    }

    canStop() {
        return true;
    }

    update(dt) {
        // implemented outside class definition
    }
};

PlayerLocomotionSmooth.prototype.update = function () {
    let playerUp = PP.vec3_create();
    let headMovement = PP.vec3_create();
    let direction = PP.vec3_create();
    let directionOnUp = PP.vec3_create();
    let verticalMovement = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    return function update(dt) {
        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        headMovement.vec3_zero();

        let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
        axes[0] = Math.abs(axes[0]) > this._myParams.myMovementMinStickIntensityThreshold ? axes[0] : 0;
        axes[1] = Math.abs(axes[1]) > this._myParams.myMovementMinStickIntensityThreshold ? axes[1] : 0;

        if (!axes.vec2_isZero()) {
            this._myStickIdleTimer.start();

            direction = this._myCurrentDirectionConverter.convert(axes, this._myDirectionReference.pp_getTransformQuat(), playerUp, direction);

            if (!direction.vec3_isZero()) {
                this._myIsFlying = this._myIsFlying || direction.vec3_componentAlongAxis(playerUp, directionOnUp).vec3_length() > 0.000001;
                if (!this._myIsFlying) {
                    direction = direction.vec3_removeComponentAlongAxis(playerUp, direction);
                }

                let movementIntensity = axes.vec2_length();
                if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SELECT).isPressed()) {
                    movementIntensity = 0.1;
                }
                let speed = Math.pp_lerp(0, this._myParams.myMaxSpeed, movementIntensity);

                if (this._myParams.myCollisionRuntimeParams.myIsSliding) {

                    //speed = Math.pp_lerp(speed * 0.05, speed, 1 - Math.abs(this._myParams.myCollisionRuntimeParams.mySlidingMovementAngle) / 90);
                    //speed = speed * 0.1;
                    speed = speed / 2;
                }

                headMovement = direction.vec3_scale(speed * dt, headMovement);
            }
        } else {
            if (this._myStickIdleTimer.isRunning()) {
                this._myStickIdleTimer.update(dt);
                if (this._myStickIdleTimer.isDone()) {
                    this._myCurrentDirectionConverter.resetFly();
                }
            }
        }

        if (!PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SQUEEZE).isPressed()) {
            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.TOP_BUTTON).isPressed()) {
                verticalMovement = playerUp.vec3_scale(this._myParams.myMaxSpeed * dt, verticalMovement);
                headMovement = headMovement.vec3_add(verticalMovement, headMovement);
                this._myIsFlying = true;
            } else if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressed()) {
                verticalMovement = playerUp.vec3_scale(-this._myParams.myMaxSpeed * dt, verticalMovement);
                headMovement = headMovement.vec3_add(verticalMovement, headMovement);
                this._myIsFlying = true;
            }
        }

        if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(2)) {
            this._myIsFlying = false;
        }

        if (!PP.myLeftGamepad.getButtonInfo(PP.ButtonType.THUMBSTICK).isPressed()) {
            if (!this._myIsFlying) {
                let gravity = -2;
                verticalMovement = playerUp.vec3_scale(gravity * dt, verticalMovement);
                headMovement = headMovement.vec3_add(verticalMovement, headMovement);
            }

            feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);

            CollisionCheckGlobal.move(headMovement, feetTransformQuat, this._myParams.myCollisionCheckParams, this._myParams.myCollisionRuntimeParams);
            headMovement.vec3_copy(this._myParams.myCollisionRuntimeParams.myFixedMovement);

            if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SQUEEZE).isPressed()) {
                headMovement.vec3_zero();
            }
        }

        if (!headMovement.vec3_isZero(0.000001)) {
            this._myParams.myPlayerHeadManager.moveHead(headMovement);
        }

        if (this._myParams.myCollisionRuntimeParams.myIsOnGround) {
            this._myIsFlying = false;
            this._myCurrentDirectionConverter.resetFly();
        }
    };
}();

PlayerLocomotionSmooth.prototype._onXRSessionStart = function () {
    return function _onXRSessionStart(session) {
        if (this._myParams.myDirectionReferenceType == 0) {
            this._myDirectionReference = PP.myPlayerHeadManager.myHead;
            this._myCurrentDirectionConverter = this._myDirectionConverterHead;
        } else if (this._myParams.myDirectionReferenceType == 1) {
            this._myDirectionReference = PP.myPlayerObjects.myHandLeft;
            this._myCurrentDirectionConverter = this._myDirectionConverterHand;
        } else {
            this._myDirectionReference = PP.myPlayerObjects.myHandRight;
            this._myCurrentDirectionConverter = this._myDirectionConverterHand;
        }

        this._myCurrentDirectionConverter.resetFly();
    };
}();

PlayerLocomotionSmooth.prototype._onXRSessionEnd = function () {
    let playerUp = PP.vec3_create();
    return function _onXRSessionEnd(session) {
        this._myDirectionReference = PP.myPlayerObjects.myHead;
        this._myCurrentDirectionConverter = this._myDirectionConverterHead;

        this._myCurrentDirectionConverter.resetFly();
    };
}();



Object.defineProperty(PlayerLocomotionSmooth.prototype, "update", { enumerable: false });
Object.defineProperty(PlayerLocomotionSmooth.prototype, "_onXRSessionStart", { enumerable: false });
Object.defineProperty(PlayerLocomotionSmooth.prototype, "_onXRSessionEnd", { enumerable: false });