WL.registerComponent('locomotion-draft', {
    _myPlayerObject: { type: WL.Type.Object },
    _myHeadObject: { type: WL.Type.Object },
    _myMaxSpeed: { type: WL.Type.Float, default: 2 },
    _myMaxRotationSpeed: { type: WL.Type.Float, default: 100 },
}, {
    init: function () {
    },
    start() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));

        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;
    },
    update(dt) {
        let positionChanged = false;
        let rotationChanged = false;

        let headMovement = [0, 0, 0];

        {
            let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
            let minIntensityThreshold = 0.1;
            if (axes.vec2_length() > minIntensityThreshold) {
                let direction = this._convertStickToWorldDirection(axes, this._myHeadObject, true);
                if (direction.vec3_length() > 0.001) {
                    direction.vec3_normalize(direction);

                    let movementIntensity = axes.vec2_length();
                    let speed = Math.pp_lerp(0, this._myMaxSpeed, movementIntensity);

                    direction.vec3_scale(speed * dt, headMovement);

                    positionChanged = true;
                }
            }
        }

        if (positionChanged) {
            this._moveHead(headMovement);
        }

        let headRotation = PP.quat_create();
        {
            let axes = PP.myRightGamepad.getAxesInfo().getAxes();
            let minIntensityThreshold = 0.1;
            if (Math.abs(axes[0]) > minIntensityThreshold) {
                let axis = this._myHeadObject.pp_getUp();
                axis = [0, 1, 0];

                let rotationIntensity = -axes[0];
                let speed = Math.pp_lerp(0, this._myMaxRotationSpeed, rotationIntensity);

                headRotation.quat_fromAxis(speed * dt, axis);

                rotationChanged = true;
            }
        }

        if (rotationChanged) {
            this._rotateHead(headRotation);
        }
    },
    _moveHead(movement) {
        this._myPlayerObject.pp_translate(movement);
    },
    _rotateHead(rotation) {
        let currentHeadPosition = this._myHeadObject.pp_getPosition();

        this._myPlayerObject.pp_rotateAroundQuat(rotation, this._myHeadObject.pp_getPosition());

        let newHeadPosition = this._myHeadObject.pp_getPosition();
        let adjustmentMovement = currentHeadPosition.vec3_sub(newHeadPosition);

        this._moveHead(adjustmentMovement);
    },
    _teleportHead(teleportPosition, teleportRotation) {
        this._teleportHeadPosition(teleportPosition);

        let currentHeadRotation = this._myHeadObject.pp_getRotationQuat();
        let teleportRotationToPerform = currentHeadRotation.quat_rotationToQuat(teleportRotation);
        this._rotateHead(teleportRotationToPerform);
    },
    _teleportHeadPosition(teleportPosition) {
        let currentHeadPosition = this._myHeadObject.pp_getPosition();
        let teleportMovementToPerform = teleportPosition.vec3_sub(currentHeadPosition);
        this._moveHead(teleportMovementToPerform);
    },
    _convertStickToWorldDirection(stickAxes, conversionObject, removeY) {
        let direction = conversionObject.pp_getRight().vec3_scale(stickAxes[0]).vec3_add(conversionObject.pp_getForward().vec3_scale(stickAxes[1]));

        if (removeY) {
            direction[1] = 0;
        }

        return direction;
    },
    _onXRSessionStart(session) {
        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;

        session.requestReferenceSpace(WebXR.refSpace).then(function (referenceSpace) {
            if (referenceSpace.addEventListener != null) {
                referenceSpace.addEventListener("reset", this._onViewReset.bind(this));
            }
        }.bind(this));

        session.addEventListener('visibilitychange', function (event) {
            if (event.session.visibilityState != "visible") {
                this._onXRSessionBlurStart(event.session);
            } else {
                this._onXRSessionBlurEnd(event.session);
            }
        }.bind(this));
    },
    _onXRSessionEnd(session) {
        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;
    },
    _onXRSessionBlurStart(session) {
        if (this._myBlurRecoverHeadTransform == null) {
            this._myBlurRecoverHeadTransform = this._myHeadObject.pp_getTransformQuat();
            this._myBlurRecoverPlayerUp = this._myPlayerObject.pp_getUp();
        }
    },
    _onXRSessionBlurEnd(session) {
        if (this._myBlurRecoverHeadTransform != null) {
            let playerUp = this._myPlayerObject.pp_getUp();
            if (playerUp.vec3_angle(this._myBlurRecoverPlayerUp) == 0) {
                let headHeight = this._getHeadHeight(this._myHeadObject.pp_getPosition());
                let recoverHeadHeight = this._getHeadHeight(this._myBlurRecoverHeadTransform.quat2_getPosition());

                let recoverHeadPosition = this._myBlurRecoverHeadTransform.quat2_getPosition();
                let newHeadPosition = recoverHeadPosition.vec3_add(playerUp.vec3_scale(headHeight - recoverHeadHeight));

                this._teleportHeadPosition(newHeadPosition);
            }

            this._myBlurRecoverHeadTransform = null;
            this._myBlurRecoverPlayerUp = null;
        }
    },
    _onViewReset() {
        let headHeight = this._getHeadHeight(this._myHeadObject.pp_getPosition());

        let headPosition = this._myHeadObject.pp_getPosition();
        let playerUp = this._myPlayerObject.pp_getUp();

        let newPlayerPosition = headPosition.vec3_sub(playerUp.vec3_scale(headHeight));
        this._myPlayerObject.pp_setPosition(newPlayerPosition);
    },
    _getHeadHeight(headPosition) {
        let playerPosition = this._myPlayerObject.pp_getPosition();
        let playerUp = this._myPlayerObject.pp_getUp();

        let headDisplacement = headPosition.vec3_sub(playerPosition);
        let height = headDisplacement.vec3_componentAlongAxis(playerUp).vec3_length();

        return height;
    }
});