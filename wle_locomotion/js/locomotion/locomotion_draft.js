WL.registerComponent('locomotion-draft', {
    _myPlayerObject: { type: WL.Type.Object },
    _myHeadObject: { type: WL.Type.Object },
    _myRightHandObject: { type: WL.Type.Object },
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

        this._myDelaySessionStartResyncCounter = 0;
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer = new PP.Timer(5, false);
        this._myVisibilityWentHidden = false;
        this._mySessionActive = false;

        this._myStartForward = null;
        this._myStartUp = null;
        this._myStartRight = null;
        this._myStickIdleCount = 0;

        this._myLastForward = null;
        this._myLastRight = null;
    },
    update(dt) {
        if (this._myDelaySessionStartResyncCounter > 0) {
            this._myDelaySessionStartResyncCounter--;
            if (this._myDelaySessionStartResyncCounter == 0) {
                this._sessionStartResync();
            }
        }

        if (this._myDelayBlurEndResyncCounter > 0 && !this._myDelayBlurEndResyncTimer.isRunning()) {
            this._myDelayBlurEndResyncCounter--;
            if (this._myDelayBlurEndResyncCounter == 0) {
                this._blurEndResync();
            }
        }

        if (this._myDelayBlurEndResyncTimer.isRunning()) {
            if (this._myDelayBlurEndResyncCounter > 0) {
                this._myDelayBlurEndResyncCounter--;
            } else {
                this._myDelayBlurEndResyncTimer.update(dt);
                if (this._myDelayBlurEndResyncTimer.isDone()) {
                    this._blurEndResync();
                }
            }
        }

        let skipLocomotion = this._myDelaySessionStartResyncCounter > 0 || this._myDelayBlurEndResyncCounter > 0 || this._myDelayBlurEndResyncTimer.isRunning();
        if (!skipLocomotion) {
            let positionChanged = false;
            let rotationChanged = false;

            let headMovement = [0, 0, 0];

            {
                let axes = PP.myRightGamepad.getAxesInfo().getAxes();
                let minIntensityThreshold = 0.1;
                if (axes.vec2_length() > minIntensityThreshold) {
                    this._myStickIdleCount = 2;
                    let direction = this._convertStickToWorldDirection(axes, this._myRightHandObject, true);
                    if (direction.vec3_length() > 0.001) {
                        direction.vec3_normalize(direction);

                        let movementIntensity = axes.vec2_length();
                        let speed = Math.pp_lerp(0, this._myMaxSpeed, movementIntensity);

                        direction.vec3_scale(speed * dt, headMovement);

                        positionChanged = true;
                    }
                } else {
                    if (this._myStickIdleCount > 0) {
                        this._myStickIdleCount--;
                        if (this._myStickIdleCount == 0) {
                            this._myStartForward = null;
                            this._myStartUp = null;
                            this._myStartRight = null;

                            this._myLastForward = null;
                            this._myLastRight = null;
                        }
                    }
                }
            }

            if (positionChanged) {
                this._moveHead(headMovement);
            }

            let headRotation = PP.quat_create();
            {
                let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
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
    _convertStickToWorldDirection(stickAxes, conversionObject, removeUp) {
        let playerUp = this._myPlayerObject.pp_getUp();

        let up = conversionObject.pp_getUp();
        let forward = conversionObject.pp_getForward();
        let right = conversionObject.pp_getRight();

        if (removeUp) {
            /* if (forward.vec3_angle(playerUp) < 30) {
                let fixedForward = up.vec3_negate();
                if (!fixedForward.vec3_removeComponentAlongAxis(playerUp).vec3_isConcordant(forward)) {
                    fixedForward.vec3_negate(forward);
                } else {
                    forward.pp_copy(fixedForward);
                }
            } else if (forward.vec3_angle(playerUp.vec3_negate()) < 30) {
                
                let fixedForward = up.pp_clone();
                if (!fixedForward.vec3_removeComponentAlongAxis(playerUp).vec3_isConcordant(forward)) {
                    fixedForward.vec3_negate(forward);
                } else {
                    forward.pp_copy(fixedForward);
                }
            } */

            /* 
            if (right.vec3_angle(playerUp) < 30) {
                let fixedRight = up.vec3_negate();
                if (!fixedRight.vec3_removeComponentAlongAxis(playerUp).vec3_isConcordant(right)) {
                    fixedRight.vec3_negate(right);
                } else {
                    right.pp_copy(fixedRight);
                }
            } else if (right.vec3_angle(playerUp.vec3_negate()) < 30) {
                let fixedRight = up.pp_clone();
                if (!fixedRight.vec3_removeComponentAlongAxis(playerUp).vec3_isConcordant(right)) {
                    fixedRight.vec3_negate(right);
                } else {
                    right.pp_copy(fixedRight);
                }
            } */

            let minAngle = 10;
            if (this._myLastForward && (forward.vec3_angle(playerUp) < minAngle || forward.vec3_angle(playerUp.vec3_negate()) < minAngle)) {
                if (forward.vec3_isConcordant(this._myLastForward)) {
                    forward.pp_copy(this._myLastForward);
                } else {
                    this._myLastForward.vec3_negate(forward);
                }
            }

            if (this._myLastRight && (right.vec3_angle(playerUp) < minAngle || right.vec3_angle(playerUp.vec3_negate()) < minAngle)) {
                if (right.vec3_isConcordant(this._myLastRight)) {
                    right.pp_copy(this._myLastRight);
                } else {
                    this._myLastRight.vec3_negate(right);
                }
            }

            forward.vec3_removeComponentAlongAxis(playerUp, forward);
            right.vec3_removeComponentAlongAxis(playerUp, right);

            right.vec3_cross(forward, up);
            forward.vec3_cross(up, right);

            if (this._myStartForward != null) {
                if (this._myStartUp.vec3_isConcordant(playerUp) != up.vec3_isConcordant(playerUp)) {
                    if (!this._myStartForward.vec3_isConcordant(forward)) {
                        forward.vec3_negate(forward);
                    } else {
                        right.vec3_negate(right);
                    }

                    up.vec3_negate(up);
                }
            }
        }

        forward.vec3_normalize(forward);
        right.vec3_normalize(right);
        up.vec3_normalize(up);

        this._myLastForward = forward.pp_clone();
        this._myLastRight = right.pp_clone();

        if (this._myStartForward == null) {
            this._myStartForward = forward.pp_clone();
            this._myStartUp = up.pp_clone();
            this._myStartRight = right.pp_clone();
        }

        let debugArrowParamsForward = new PP.DebugArrowParams();
        debugArrowParamsForward.myStart = this._myRightHandObject.pp_getPosition();
        debugArrowParamsForward.myDirection = forward;
        debugArrowParamsForward.myLength = 0.2;
        debugArrowParamsForward.myColor = [0, 0, 1, 1];
        PP.myDebugManager.draw(debugArrowParamsForward);

        let debugArrowParamsStartForward = new PP.DebugArrowParams();
        debugArrowParamsStartForward.myStart = this._myRightHandObject.pp_getPosition();
        //debugArrowParamsStartForward.myDirection = conversionObject.pp_getForward().vec3_removeComponentAlongAxis(playerUp).vec3_normalize();
        debugArrowParamsStartForward.myDirection = this._myStartForward;
        debugArrowParamsStartForward.myLength = 0.2;
        debugArrowParamsStartForward.myColor = [0, 0, 0.5, 1];
        PP.myDebugManager.draw(debugArrowParamsStartForward);

        let debugArrowParamsRight = new PP.DebugArrowParams();
        debugArrowParamsRight.myStart = this._myRightHandObject.pp_getPosition();
        debugArrowParamsRight.myDirection = right;
        debugArrowParamsRight.myLength = 0.2;
        debugArrowParamsRight.myColor = [1, 0, 0, 1];
        PP.myDebugManager.draw(debugArrowParamsRight);

        let debugArrowParamsUp = new PP.DebugArrowParams();
        debugArrowParamsUp.myStart = this._myRightHandObject.pp_getPosition();
        debugArrowParamsUp.myDirection = up;
        debugArrowParamsUp.myLength = 0.2;
        debugArrowParamsUp.myColor = [0, 1, 0, 1];
        PP.myDebugManager.draw(debugArrowParamsUp);

        let direction = right.vec3_scale(stickAxes[0]).vec3_add(forward.vec3_negate().vec3_scale(-stickAxes[1]));

        if (removeUp) {
            direction.vec3_removeComponentAlongAxis(playerUp, direction);
        }

        return direction;
    },
    _onXRSessionStart(session) {
        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;
        this._myVisibilityWentHidden = false;

        this._myDelaySessionStartResyncCounter = 0;
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();

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

        this._myDelaySessionStartResyncCounter = 2;

        this._mySessionActive = true;

        //console.error("session start");
    },
    _onXRSessionEnd(session) {
        if (this._myDelaySessionStartResyncCounter == 0) {
            let headTransform = this._myHeadObject.pp_getTransformQuat();

            if (this._myBlurRecoverHeadTransform != null) {
                let playerUp = this._myPlayerObject.pp_getUp();
                if (playerUp.vec3_angle(this._myBlurRecoverPlayerUp) == 0) {
                    headTransform = this._myBlurRecoverHeadTransform;
                }
            }

            this._teleportPlayerTransform(headTransform);
        }

        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;
        this._myVisibilityWentHidden = false;

        this._myDelaySessionStartResyncCounter = 0;
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();

        this._mySessionActive = false;

        //console.error("session end");
    },
    _onXRSessionBlurStart(session) {
        if (this._myBlurRecoverHeadTransform == null && this._mySessionActive) {
            if (this._myDelaySessionStartResyncCounter > 0) {
                this._myBlurRecoverHeadTransform = this._getHeadOnPlayerTransform();
                this._myBlurRecoverPlayerUp = this._myPlayerObject.pp_getUp();
            } else {
                this._myBlurRecoverHeadTransform = this._myHeadObject.pp_getTransformQuat();
                this._myBlurRecoverPlayerUp = this._myPlayerObject.pp_getUp();
            }
        } else if (!this._mySessionActive) {
            this._myBlurRecoverHeadTransform = null;
            this._myBlurRecoverPlayerUp = null;
        }

        this._myVisibilityWentHidden = this._myVisibilityWentHidden || session.visibilityState == "hidden";

        //console.error("blur start", session.visibilityState);
    },
    _onXRSessionBlurEnd(session) {
        if (this._myDelaySessionStartResyncCounter == 0) {
            if (this._myBlurRecoverHeadTransform != null && this._mySessionActive) {
                let playerUp = this._myPlayerObject.pp_getUp();
                if (playerUp.vec3_angle(this._myBlurRecoverPlayerUp) == 0) {
                    this._myDelayBlurEndResyncCounter = 2;
                    if (this._myVisibilityWentHidden) {
                        //this._myDelayBlurEndResyncTimer.start();
                    }
                } else {
                    this._myBlurRecoverHeadTransform = null;
                    this._myBlurRecoverPlayerUp = null;
                }
            } else {
                this._myBlurRecoverHeadTransform = null;
                this._myBlurRecoverPlayerUp = null;
            }
        } else {
            this._myDelaySessionStartResyncCounter = 2;

            this._myBlurRecoverHeadTransform = null;
            this._myBlurRecoverPlayerUp = null;
        }

        //console.error("blur end");
    },
    _onViewReset() {
        if (this._mySessionActive) {
            //console.error("reset");
            this._teleportPlayerTransform(this._myHeadObject.pp_getTransformQuat());
        }
    },
    _getHeadHeight(headPosition) {
        let playerPosition = this._myPlayerObject.pp_getPosition();
        let playerUp = this._myPlayerObject.pp_getUp();

        let headDisplacement = headPosition.vec3_sub(playerPosition);
        let height = headDisplacement.vec3_componentAlongAxis(playerUp).vec3_length();

        return height;
    },
    _teleportPlayerTransform(headTransform) {
        let headPosition = headTransform.quat2_getPosition();
        let headHeight = this._getHeadHeight(headPosition);

        let playerUp = this._myPlayerObject.pp_getUp();
        let newPlayerPosition = headPosition.vec3_sub(playerUp.vec3_scale(headHeight));

        this._myPlayerObject.pp_setPosition(newPlayerPosition);

        let playerForward = this._myPlayerObject.pp_getForward();
        let headForward = headTransform.quat2_getAxes()[2];
        let headForwardNegated = headForward.vec3_negate(); // the head is rotated 180 degrees from the player for rendering reasons

        let rotationToPerform = playerForward.vec3_lookToPivotedQuat(headForwardNegated, playerUp);

        this._myPlayerObject.pp_rotateQuat(rotationToPerform);
    },
    _headToPlayer() {
        let headPosition = this._myHeadObject.pp_getPosition();
        let headHeight = this._getHeadHeight(headPosition);

        let playerPosition = this._myPlayerObject.pp_getPosition();
        let playerUp = this._myPlayerObject.pp_getUp();
        let headToPlayerPosition = playerPosition.vec3_add(playerUp.vec3_scale(headHeight));

        this._teleportHeadPosition(headToPlayerPosition);

        let playerForward = this._myPlayerObject.pp_getForward();
        let headForward = this._myHeadObject.pp_getForward();
        let headForwardNegated = headForward.vec3_negate(); // the head is rotated 180 degrees from the player for rendering reasons

        let rotationToPerform = headForwardNegated.vec3_lookToPivotedQuat(playerForward, playerUp);

        this._myPlayerObject.pp_rotateQuat(rotationToPerform);
    },
    _blurEndResync() {
        if (this._myBlurRecoverHeadTransform != null) {
            let playerUp = this._myPlayerObject.pp_getUp();
            if (playerUp.vec3_angle(this._myBlurRecoverPlayerUp) == 0) {
                let headHeight = this._getHeadHeight(this._myHeadObject.pp_getPosition());
                let recoverHeadHeight = this._getHeadHeight(this._myBlurRecoverHeadTransform.quat2_getPosition());

                let recoverHeadPosition = this._myBlurRecoverHeadTransform.quat2_getPosition();
                let newHeadPosition = recoverHeadPosition.vec3_add(playerUp.vec3_scale(headHeight - recoverHeadHeight));

                let recoverHeadForward = this._myBlurRecoverHeadTransform.quat2_getAxes()[2];
                let currentHeadForward = this._myHeadObject.pp_getForward();
                let rotationToPerform = currentHeadForward.vec3_lookToPivotedQuat(recoverHeadForward, playerUp);

                this._teleportHeadPosition(newHeadPosition);
                this._rotateHead(rotationToPerform);

                //console.error("blur end resync");
            }
        }

        this._myBlurRecoverHeadTransform = null;
        this._myBlurRecoverPlayerUp = null;
    },
    _sessionStartResync() {
        if (this._myBlurRecoverHeadTransform == null) {
            this._headToPlayer();
        }
    },
    _getHeadOnPlayerTransform() {
        let headPosition = this._myHeadObject.pp_getPosition();
        let headHeight = this._getHeadHeight(headPosition);

        let playerPosition = this._myPlayerObject.pp_getPosition();
        let playerUp = this._myPlayerObject.pp_getUp();
        let headOnPlayerPosition = playerPosition.vec3_add(playerUp.vec3_scale(headHeight));

        let playerRotation = this._myPlayerObject.pp_getRotationQuat();

        let transform = PP.quat2_create();
        transform.quat2_setPositionRotationQuat(headOnPlayerPosition, playerRotation);

        return transform;
    }
});