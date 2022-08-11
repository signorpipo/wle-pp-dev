PlayerLocomotionRotateParams = class PlayerLocomotionRotateParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myMaxRotationSpeed = 0;
        this.myIsSnapTurn = false;
        this.mySnapTurnAngle = 0;

        this.myRotationMinStickIntensityThreshold = 0;
        this.mySnapTurnActivateThreshold = 0;
        this.mySnapTurnResetThreshold = 0;

        this.myClampVerticalAngle = false;
        this.myMaxVerticalAngle = 0;
    }
};

PlayerLocomotionRotate = class PlayerLocomotionRotate {
    constructor(params) {
        this._myParams = params;

        this._mySnapDone = false;
        this._mySnapVerticalDone = false;
    }

    start() {
    }

    update(dt) {
        this._rotateHeadHorizontally(dt);

        if (this._myParams.myPlayerHeadManager.canRotateVertically()) {
            this._rotateHeadVertically(dt);
        }
    }
};

PlayerLocomotionRotate.prototype._rotateHeadHorizontally = function () {
    let playerUp = PP.vec3_create();
    let headRotation = PP.quat_create();
    return function _rotateHeadHorizontally(dt) {
        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        headRotation.quat_identity();
        {
            let axes = PP.myRightGamepad.getAxesInfo().getAxes();

            if (!this._myParams.myIsSnapTurn) {
                if (Math.abs(axes[0]) > this._myParams.myRotationMinStickIntensityThreshold) {
                    let rotationIntensity = -axes[0];
                    let speed = Math.pp_lerp(0, this._myParams.myMaxRotationSpeed, Math.abs(rotationIntensity)) * Math.pp_sign(rotationIntensity);

                    headRotation.quat_fromAxis(speed * dt, playerUp);
                }
            } else {
                if (this._mySnapDone) {
                    if (Math.abs(axes[0]) < this._myParams.mySnapTurnResetThreshold) {
                        this._mySnapDone = false;
                    }
                } else {
                    if (Math.abs(axes[0]) > this._myParams.mySnapTurnActivateThreshold) {
                        let rotation = -Math.pp_sign(axes[0]) * this._myParams.mySnapTurnAngle;
                        headRotation.quat_fromAxis(rotation, playerUp);

                        this._mySnapDone = true;
                    }
                }
            }
        }

        if (headRotation.quat_getAngle() > 0.00001) {
            this._myParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(headRotation);
        }
    };
}();

PlayerLocomotionRotate.prototype._rotateHeadVertically = function () {
    let headForward = PP.vec3_create();
    let headUp = PP.vec3_create();
    let referenceUp = PP.vec3_create();
    let referenceUpNegate = PP.vec3_create();
    let referenceRight = PP.vec3_create();
    let newUp = PP.vec3_create();
    let headRotation = PP.quat_create();
    return function _rotateHeadVertically(dt) {
        let head = this._myParams.myPlayerHeadManager.getCurrentHead();

        headForward = head.pp_getForward(headForward);
        headUp = head.pp_getUp(headUp);

        referenceUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(referenceUp);
        referenceUpNegate = referenceUp.vec3_negate(referenceUpNegate);
        referenceRight = headForward.vec3_cross(referenceUp, referenceRight);

        let minAngle = 1;
        if (headForward.vec3_angle(referenceUp) < minAngle) {
            referenceRight = headUp.vec3_negate(referenceRight).vec3_cross(referenceUp, referenceRight);
        } else if (headForward.vec3_angle(referenceUpNegate) < minAngle) {
            referenceRight = headUp.vec3_cross(referenceUp, referenceRight);
        } else if (!headUp.vec3_isConcordant(referenceUp)) {
            referenceRight.vec3_negate(referenceRight);
        }

        referenceRight.vec3_normalize(referenceRight);

        let axes = PP.myRightGamepad.getAxesInfo().getAxes();
        let angleToRotate = 0;

        if (!this._myParams.myIsSnapTurn) {
            if (Math.abs(axes[1]) > this._myParams.myRotationMinStickIntensityThreshold) {
                let rotationIntensity = axes[1];
                angleToRotate = Math.pp_lerp(0, this._myParams.myMaxRotationSpeed, Math.abs(rotationIntensity)) * Math.pp_sign(rotationIntensity) * dt;
            }
        } else {
            if (this._mySnapVerticalDone) {
                if (Math.abs(axes[1]) < this._myParams.mySnapTurnResetThreshold) {
                    this._mySnapVerticalDone = false;
                }
            } else {
                if (Math.abs(axes[1]) > this._myParams.mySnapTurnActivateThreshold) {
                    angleToRotate = Math.pp_sign(axes[1]) * this._myParams.mySnapTurnAngle;
                    this._mySnapVerticalDone = true;
                }
            }
        }

        if (angleToRotate != 0) {
            headRotation.quat_fromAxis(angleToRotate, referenceRight);
            this._myParams.myPlayerHeadManager.rotateHeadVerticallyQuat(headRotation);

            if (this._myParams.myClampVerticalAngle) {
                let maxVerticalAngle = this._myParams.myMaxVerticalAngle - 0.0001;
                newUp = head.pp_getUp(newUp);
                let angleWithUp = Math.pp_angleClamp(newUp.vec3_angleSigned(referenceUp, referenceRight));
                if (Math.abs(angleWithUp) > maxVerticalAngle) {
                    let fixAngle = (Math.abs(angleWithUp) - maxVerticalAngle) * Math.pp_sign(angleWithUp);
                    headRotation.quat_fromAxis(fixAngle, referenceRight);
                    this._myParams.myPlayerHeadManager.rotateHeadVerticallyQuat(headRotation);
                } else if (this._myIsSnapTurn) {
                    // adjust snap to closes snap step
                    let snapStep = Math.round(angleWithUp / this._mySnapTurnAngle);

                    let previousAngleWithUp = Math.pp_angleClamp(headUp.vec3_angleSigned(referenceUp, referenceRight));
                    if (Math.abs(Math.abs(previousAngleWithUp) - maxVerticalAngle) < 0.00001) {
                        // if it was maxed go to the snap step right before the snap
                        snapStep = Math.floor(Math.abs(previousAngleWithUp / this._mySnapTurnAngle)) * Math.pp_sign(previousAngleWithUp);
                    }

                    let snapAngle = snapStep * this._mySnapTurnAngle;
                    let fixAngle = angleWithUp - snapAngle;
                    if (Math.abs(fixAngle) > 0.00001) {
                        headRotation.quat_fromAxis(fixAngle, referenceRight);
                        this._myParams.myPlayerHeadManager.rotateHeadVerticallyQuat(headRotation);
                    }
                }
            }
        }
    };
}();



Object.defineProperty(PlayerLocomotionRotate.prototype, "_rotateHeadHorizontally", { enumerable: false });
Object.defineProperty(PlayerLocomotionRotate.prototype, "_rotateHeadVertically", { enumerable: false });