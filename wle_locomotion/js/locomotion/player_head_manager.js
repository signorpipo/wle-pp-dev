PlayerHeadManagerParams = class PlayerHeadManagerParams {
    constructor() {
        this.mySessionChangeResyncEnabled = true;

        this.myBlurEndResyncEnabled = true;
        this.myBlurEndResyncRotation = true;

        this.myExitSessionResyncHeight = true;
        this.myExitSessionResyncVerticalAngle = true;
        this.myExitSessionRemoveRightTilt = true; // for now right tilt is removed even if this setting is false, if the vertical angle has to be adjusted
        this.myExitSessionAdjustMaxVerticalAngle = true;
        this.myExitSessionMaxVerticalAngle = 90;
    }
};

// could be intended as the generic player body manager (maybe with hands and stuff also)
PlayerHeadManager = class PlayerHeadManager {
    constructor(params = new PlayerHeadManagerParams()) {
        this._myParams = params;

        this._myCurrentHead = PP.myPlayerObjects.myNonVRHead;

        this._mySessionChangeResyncHeadTransform = null;

        this._myBlurRecoverHeadTransform = null;

        this._myDelaySessionChangeResyncCounter = 0; // needed because VR head takes some frames to get the tracked position
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer = new PP.Timer(5, false);
        this._myVisibilityHidden = false;

        this._mySessionActive = false;
        this._mySessionBlurred = false;

        // Setup

        this._myResyncCounterFrames = 3;
    }

    start() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    getPlayer() {
        return PP.myPlayerObjects.myPlayer;
    }

    getCurrentHead() {
        return this._myCurrentHead;
    }

    getHeadHeight() {
        // implemented outside class definition
    }

    getFeetTransformQuat(outFeetTransformQuat = PP.quat2_create()) {
        // implemented outside class definition
    }

    getFeetPosition(outFeetPosition = PP.vec3_create()) {
        // implemented outside class definition
    }

    isSynced() {
        return this._myDelaySessionChangeResyncCounter == 0 && this._myDelayBlurEndResyncCounter == 0 && !this._myDelayBlurEndResyncTimer.isRunning() && !this._mySessionBlurred;
    }

    canRotateVertically() {
        return !this._mySessionActive;
    }

    moveHead(movement) {
        // implemented outside class definition
    }

    rotateHeadHorizontallyQuat(rotationQuat) {
        // implemented outside class definition 
    }

    rotateHeadVerticallyQuat(rotationQuat) {
        // implemented outside class definition 
    }

    teleportHeadPosition(teleportPosition) {
        // implemented outside class definition
    }

    teleportFeetPosition(teleportPosition) {
        // implemented outside class definition
    }

    teleportPlayerToHeadTransformQuat(headTransformQuat) {
        // implemented outside class definition
    }

    update(dt) {
        if (this._myDelaySessionChangeResyncCounter > 0) {
            this._myDelaySessionChangeResyncCounter--;
            if (this._myDelaySessionChangeResyncCounter == 0) {
                this._sessionChangeResync();
            }
        }

        if (this._myDelayBlurEndResyncCounter > 0 && !this._myDelayBlurEndResyncTimer.isRunning()) {
            this._myDelayBlurEndResyncCounter--;
            if (this._myDelayBlurEndResyncCounter == 0) {
                this._blurEndResync();
            }
        }

        // not really used since visibility hidden end is not considered a special case anymore
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
    }
};

PlayerHeadManager.prototype.getHeadHeight = function () {
    let headPosition = PP.vec3_create();
    return function getHeadHeight() {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let headHeight = this._getPositionHeight(headPosition);

        return headHeight;
    };
}();

PlayerHeadManager.prototype.getFeetTransformQuat = function () {
    let headPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    let feetPosition = PP.vec3_create();
    let feetRotationQuat = PP.quat_create();
    let headForward = PP.vec3_create();
    return function getFeetTransformQuat(outFeetTransformQuat = PP.quat2_create()) {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let headHeight = this._getPositionHeight(headPosition);

        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
        feetPosition = headPosition.vec3_sub(playerUp.vec3_scale(headHeight, feetPosition), feetPosition);

        headForward = this._myCurrentHead.pp_getForward(headForward);

        // feet are considered to always be flat on the player up
        let angleWithUp = headForward.vec3_angle(playerUp);
        let mingAngle = 10;
        if (angleWithUp < mingAngle) {
            headForward = this._myCurrentHead.pp_getDown(headForward);
        } else if (angleWithUp > 180 - mingAngle) {
            headForward = this._myCurrentHead.pp_getUp(headForward);
        }

        headForward = headForward.vec3_removeComponentAlongAxis(playerUp, headForward);
        headForward.vec3_normalize(headForward);

        feetRotationQuat.quat_setUp(playerUp, headForward);

        outFeetTransformQuat.quat2_setPositionRotationQuat(feetPosition, feetRotationQuat);
        return outFeetTransformQuat;
    };
}();

PlayerHeadManager.prototype.getFeetPosition = function () {
    let headPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    return function getFeetPosition(outFeetPosition = PP.vec3_create()) {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let headHeight = this._getPositionHeight(headPosition);

        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
        outFeetPosition = headPosition.vec3_sub(playerUp.vec3_scale(headHeight, outFeetPosition), outFeetPosition);

        return outFeetPosition;
    };
}();

PlayerHeadManager.prototype.moveHead = function (movement) {
    PP.myPlayerObjects.myPlayer.pp_translate(movement);
};

PlayerHeadManager.prototype.rotateHeadHorizontallyQuat = function () {
    let currentHeadPosition = PP.vec3_create();
    let newHeadPosition = PP.vec3_create();
    let adjustmentMovement = PP.vec3_create();
    return function rotateHeadHorizontallyQuat(rotationQuat) {
        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);

        PP.myPlayerObjects.myPlayer.pp_rotateAroundQuat(rotationQuat, currentHeadPosition);

        newHeadPosition = this._myCurrentHead.pp_getPosition(newHeadPosition);
        adjustmentMovement = currentHeadPosition.vec3_sub(newHeadPosition, adjustmentMovement);

        this.moveHead(adjustmentMovement);
    };
}();

PlayerHeadManager.prototype.rotateHeadVerticallyQuat = function () {
    let newHeadRotation = PP.quat_create();
    let newHeadUp = PP.vec3_create();
    return function rotateHeadVerticallyQuat(rotationQuat) {
        if (this.canRotateVertically()) {
            this._myCurrentHead.pp_rotateQuat(rotationQuat);
            newHeadRotation = this._myCurrentHead.pp_getRotationQuat(newHeadRotation);

            newHeadRotation = newHeadRotation.quat_rotateAxisRadians(Math.PI, newHeadRotation.quat_getUp(newHeadUp), newHeadRotation);
            PP.myPlayerObjects.myNonVRCamera.pp_setRotationQuat(newHeadRotation);
        }
    };
}();

PlayerHeadManager.prototype.teleportHeadPosition = function () {
    let currentHeadPosition = PP.vec3_create();
    let teleportMovementToPerform = PP.vec3_create();
    return function teleportHeadPosition(teleportPosition) {
        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentHeadPosition, teleportMovementToPerform);
        this.moveHead(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportFeetPosition = function () {
    let currentFeetPosition = PP.vec3_create();
    let teleportMovementToPerform = PP.vec3_create();
    return function teleportFeetPosition(teleportPosition) {
        currentFeetPosition = this.getFeetPosition(currentFeetPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentFeetPosition, teleportMovementToPerform);
        this.moveHead(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportPlayerToHeadTransformQuat = function () {
    let headPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    let newPlayerPosition = PP.vec3_create();
    let playerForward = PP.vec3_create();
    let headForward = PP.vec3_create();
    let headForwardNegated = PP.vec3_create();
    let rotationToPerform = PP.quat_create();
    return function teleportPlayerToHeadTransformQuat(headTransformQuat) {
        headPosition = headTransformQuat.quat2_getPosition(headPosition);
        let headHeight = this._getPositionHeight(headPosition);

        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
        newPlayerPosition = headPosition.vec3_sub(playerUp.vec3_scale(headHeight, newPlayerPosition), newPlayerPosition);

        PP.myPlayerObjects.myPlayer.pp_setPosition(newPlayerPosition);

        playerForward = PP.myPlayerObjects.myPlayer.pp_getForward(playerForward);
        headForward = headTransformQuat.quat2_getForward(headForward);
        headForwardNegated = headForward.vec3_negate(headForwardNegated); // the head is rotated 180 degrees from the player for rendering reasons

        rotationToPerform = playerForward.vec3_rotationToPivotedQuat(headForwardNegated, playerUp, rotationToPerform);

        PP.myPlayerObjects.myPlayer.pp_rotateQuat(rotationToPerform);
    };
}();

PlayerHeadManager.prototype._getPositionHeight = function () {
    let playerPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    let headDisplacement = PP.vec3_create();
    return function _getPositionHeight(headPosition) {
        playerPosition = PP.myPlayerObjects.myPlayer.pp_getPosition(playerPosition);
        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);

        headDisplacement = headPosition.vec3_sub(playerPosition, headDisplacement).vec3_componentAlongAxis(playerUp, headDisplacement);
        let height = headDisplacement.vec3_length();
        if (!playerUp.vec3_isConcordant(headDisplacement)) {
            height = -height;
        }

        return height;
    };
}();

// #TODO what happens if the player go in the blurred state before wle has loaded?
PlayerHeadManager.prototype._onXRSessionStart = function () {
    return function _onXRSessionStart(session) {
        this._myBlurRecoverHeadTransform = null;
        this._myVisibilityHidden = false;

        this._myDelaySessionChangeResyncCounter = 0;
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();

        session.requestReferenceSpace(WebXR.refSpace).then(function (referenceSpace) {
            if (referenceSpace.addEventListener != null) {
                referenceSpace.addEventListener("reset", this._onViewReset.bind(this));
            }
        }.bind(this));

        session.addEventListener('visibilitychange', function (event) {
            if (event.session.visibilityState != "visible") {
                if (!this._mySessionBlurred) {
                    this._onXRSessionBlurStart(event.session);
                }

                this._myVisibilityHidden = session.visibilityState == "hidden";
            } else {
                if (this._mySessionBlurred) {
                    this._onXRSessionBlurEnd(event.session);
                }

                this._myVisibilityHidden = false;
            }
        }.bind(this));

        if (this._myParams.mySessionChangeResyncEnabled) {
            if (this._myDelaySessionChangeResyncCounter == 0) {
                let previousHeadObject = this._myCurrentHead;
                this._mySessionChangeResyncHeadTransform = previousHeadObject.pp_getTransformQuat();
            }

            this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
        } else {
            this._myDelaySessionChangeResyncCounter = 0;
            this._mySessionChangeResyncHeadTransform = null;
        }

        this._myCurrentHead = PP.myPlayerObjects.myVRHead;

        this._mySessionActive = true;
        this._mySessionBlurred = false;
    };
}();

PlayerHeadManager.prototype._onXRSessionEnd = function () {
    return function _onXRSessionEnd(session) {
        if (this._myParams.mySessionChangeResyncEnabled) {
            if (this._myDelaySessionChangeResyncCounter == 0) {
                let previousHeadTransform = this._myCurrentHead.pp_getTransformQuat();

                if (this._myBlurRecoverHeadTransform != null) {
                    previousHeadTransform = this._myBlurRecoverHeadTransform;
                }

                this._mySessionChangeResyncHeadTransform = previousHeadTransform;
            }

            this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
        } else {
            this._myDelaySessionChangeResyncCounter = 0;
            this._mySessionChangeResyncHeadTransform = null;
        }

        this._myBlurRecoverHeadTransform = null;
        this._myVisibilityHidden = false;

        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();

        this._myCurrentHead = PP.myPlayerObjects.myNonVRHead;

        this._mySessionActive = false;
        this._mySessionBlurred = false;
    };
}();

PlayerHeadManager.prototype._onXRSessionBlurStart = function () {
    return function _onXRSessionBlurStart(session) {
        if (this._myParams.myBlurEndResyncEnabled && this._myBlurRecoverHeadTransform == null && this._mySessionActive) {
            if (this._myDelaySessionChangeResyncCounter > 0) {
                this._myBlurRecoverHeadTransform = this._mySessionChangeResyncHeadTransform;
            } else {
                this._myBlurRecoverHeadTransform = this._myCurrentHead.pp_getTransformQuat();
            }
        } else if (!this._mySessionActive || !this._myParams.myBlurEndResyncEnabled) {
            this._myBlurRecoverHeadTransform = null;
        }

        this._myDelayBlurEndResyncCounter = 0;

        this._mySessionBlurred = true;
    };
}();

PlayerHeadManager.prototype._onXRSessionBlurEnd = function () {
    return function _onXRSessionBlurEnd(session) {
        if (this._myDelaySessionChangeResyncCounter == 0) {
            if (this._myParams.myBlurEndResyncEnabled && this._myBlurRecoverHeadTransform != null && this._mySessionActive) {
                this._myDelayBlurEndResyncCounter = this._myResyncCounterFrames;
                if (this._myVisibilityHidden) {
                    // this._myDelayBlurEndResyncTimer.start();

                    // this was added because on the end of hidden u can have the resync delay cause of the guardian resync
                    // but I just decided to skip this since it's not reliable and the guardian resync can happen in other cases
                    // with no notification anyway
                }
            } else {
                this._myBlurRecoverHeadTransform = null;
                this._myDelayBlurEndResyncCounter = 0;
            }
        } else {
            this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
            this._myBlurRecoverHeadTransform = null;
        }

        this._mySessionBlurred = false;
    };
}();

PlayerHeadManager.prototype._onViewReset = function () {
    let currentHeadTransformQuat = PP.quat2_create();
    return function _onViewReset() {
        if (this._mySessionActive) {
            this.teleportPlayerToHeadTransformQuat(this._myCurrentHead.pp_getTransformQuat(currentHeadTransformQuat));
        }
    };
}();

PlayerHeadManager.prototype._blurEndResync = function () {
    let playerUp = PP.vec3_create();
    let currentHeadPosition = PP.vec3_create();
    let recoverHeadPosition = PP.vec3_create();
    let newHeadPosition = PP.vec3_create();
    let recoverHeadForward = PP.vec3_create();
    let currentHeadForward = PP.vec3_create();
    let rotationToPerform = PP.quat_create();
    return function _blurEndResync() {
        if (this._myBlurRecoverHeadTransform != null) {
            playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);

            recoverHeadPosition = this._myBlurRecoverHeadTransform.quat2_getPosition(recoverHeadPosition);

            let headHeight = this._getPositionHeight(this._myCurrentHead.pp_getPosition(currentHeadPosition));
            let recoverHeadHeight = this._getPositionHeight(recoverHeadPosition);

            newHeadPosition = recoverHeadPosition.vec3_add(playerUp.vec3_scale(headHeight - recoverHeadHeight, newHeadPosition), newHeadPosition);

            recoverHeadForward = this._myBlurRecoverHeadTransform.quat2_getForward(recoverHeadForward);
            currentHeadForward = this._myCurrentHead.pp_getForward(currentHeadForward);
            rotationToPerform = currentHeadForward.vec3_rotationToPivotedQuat(recoverHeadForward, playerUp, rotationToPerform);

            this.teleportHeadPosition(newHeadPosition);

            if (this._myParams.myBlurEndResyncRotation) {
                this.rotateHeadHorizontallyQuat(rotationToPerform);
            }
        }

        this._myBlurRecoverHeadTransform = null;
    };
}();

PlayerHeadManager.prototype._sessionChangeResync = function () {
    let currentHeadPosition = PP.vec3_create();
    let resyncHeadPosition = PP.vec3_create();
    let resyncHeadRotation = PP.quat_create();
    let playerUp = PP.vec3_create();
    let playerUpNegate = PP.vec3_create();
    let flatCurrentHeadPosition = PP.vec3_create();
    let flatResyncHeadPosition = PP.vec3_create();
    let resyncMovement = PP.vec3_create();
    let currentHeadForward = PP.vec3_create();
    let resyncHeadForward = PP.vec3_create();
    let resyncHeadUp = PP.vec3_create();
    let resyncHeadRight = PP.vec3_create();
    let fixedResyncForward = PP.vec3_create();
    let rotationToPerform = PP.quat_create();
    let playerPosition = PP.vec3_create();
    let newPlayerPosition = PP.vec3_create();
    let newNonVRCameraPosition = PP.vec3_create();
    let fixedHeadRight = PP.vec3_create();
    let fixedHeadRightNegate = PP.vec3_create();
    let fixedHeadUp = PP.vec3_create();
    let fixedHeadForward = PP.vec3_create();
    let fixedHeadRotation = PP.quat_create();
    return function _sessionChangeResync() {
        if (this._myBlurRecoverHeadTransform == null && this._mySessionChangeResyncHeadTransform != null) {
            if (this._mySessionActive) {
                currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
                resyncHeadPosition = this._mySessionChangeResyncHeadTransform.quat2_getPosition(resyncHeadPosition);
                resyncHeadRotation = this._mySessionChangeResyncHeadTransform.quat2_getRotationQuat(resyncHeadRotation);

                playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
                playerUpNegate = playerUp.vec3_negate(playerUpNegate);

                flatCurrentHeadPosition = currentHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatCurrentHeadPosition);
                flatResyncHeadPosition = resyncHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatResyncHeadPosition);

                resyncMovement = flatResyncHeadPosition.vec3_sub(flatCurrentHeadPosition, resyncMovement);
                this.moveHead(resyncMovement);

                currentHeadForward = this._myCurrentHead.pp_getForward(currentHeadForward);
                resyncHeadForward = resyncHeadRotation.quat_getForward(resyncHeadForward);
                resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);

                fixedResyncForward.vec3_copy(resyncHeadForward);

                let minAngle = 1;
                if (resyncHeadForward.vec3_angle(playerUp) < minAngle) {
                    if (resyncHeadUp.vec3_isConcordant(playerUp)) {
                        fixedResyncForward = resyncHeadUp.vec3_negate(fixedResyncForward);
                    } else {
                        fixedResyncForward.vec3_copy(resyncHeadUp);
                    }
                } else if (resyncHeadForward.vec3_angle(playerUpNegate) < minAngle) {
                    if (resyncHeadUp.vec3_isConcordant(playerUp)) {
                        fixedResyncForward.vec3_copy(resyncHeadUp);
                    } else {
                        fixedResyncForward = resyncHeadUp.vec3_negate(fixedResyncForward);
                    }
                }

                if (!resyncHeadUp.vec3_isConcordant(playerUp)) {
                    rotationToPerform = currentHeadForward.vec3_rotationToPivotedQuat(fixedResyncForward.vec3_negate(), playerUp, rotationToPerform);
                } else {
                    rotationToPerform = currentHeadForward.vec3_rotationToPivotedQuat(fixedResyncForward, playerUp, rotationToPerform);
                }

                this.rotateHeadHorizontallyQuat(rotationToPerform);
            } else {
                playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);

                resyncHeadPosition = this._mySessionChangeResyncHeadTransform.quat2_getPosition(resyncHeadPosition);
                flatResyncHeadPosition = resyncHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatResyncHeadPosition);

                playerPosition = PP.myPlayerObjects.myPlayer.pp_getPosition(playerPosition);
                newPlayerPosition = flatResyncHeadPosition.vec3_add(playerPosition.vec3_componentAlongAxis(playerUp, newPlayerPosition), newPlayerPosition);

                PP.myPlayerObjects.myPlayer.pp_setPosition(newPlayerPosition);
                PP.myPlayerObjects.myNonVRCamera.pp_resetPositionLocal();

                if (this._myParams.myExitSessionResyncHeight) {
                    let resyncHeadHeight = this._getPositionHeight(resyncHeadPosition);
                    PP.myPlayerObjects.myNonVRCamera.pp_setPosition(playerUp.vec3_scale(resyncHeadHeight, newNonVRCameraPosition).vec3_add(newPlayerPosition, newNonVRCameraPosition));
                }

                resyncHeadRotation = this._mySessionChangeResyncHeadTransform.quat2_getRotationQuat(resyncHeadRotation);

                if (this._myParams.myExitSessionRemoveRightTilt ||
                    this._myParams.myExitSessionAdjustMaxVerticalAngle || !this.myExitSessionResyncVerticalAngle) {
                    resyncHeadForward = resyncHeadRotation.quat_getForward(resyncHeadForward);
                    resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);

                    fixedHeadRight = resyncHeadForward.vec3_cross(playerUp, fixedHeadRight);
                    fixedHeadRight.vec3_normalize(fixedHeadRight);

                    if (!resyncHeadUp.vec3_isConcordant(playerUp)) {
                        let angleForwardUp = resyncHeadForward.vec3_angle(playerUp);
                        let negateAngle = 45;
                        if (angleForwardUp > (180 - negateAngle) || angleForwardUp < negateAngle) {
                            // this way I get a good fixed result for both head upside down and head rotated on forward
                            // when the head is looking down and a bit backward (more than 135 degrees), I want the forward to actually
                            // be the opposite because it's like u rotate back the head up and look forward again
                            fixedHeadRight.vec3_negate(fixedHeadRight);
                        }
                    }

                    if (fixedHeadRight.vec3_isZero(0.000001)) {
                        fixedHeadRight = resyncHeadRotation.quat_getRight(fixedHeadRight);
                    }

                    fixedHeadUp = fixedHeadRight.vec3_cross(resyncHeadForward, fixedHeadUp);
                    fixedHeadUp.vec3_normalize(fixedHeadUp);
                    fixedHeadForward = fixedHeadUp.vec3_cross(fixedHeadRight, fixedHeadForward);
                    fixedHeadForward.vec3_normalize(fixedHeadForward);

                    fixedHeadRotation.quat_fromAxes(fixedHeadRight.vec3_negate(fixedHeadRightNegate), fixedHeadUp, fixedHeadForward);
                    resyncHeadRotation.quat_copy(fixedHeadRotation);
                }

                if (this._myParams.myExitSessionAdjustMaxVerticalAngle || !this.myExitSessionResyncVerticalAngle) {
                    resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);
                    resyncHeadRight = resyncHeadRotation.quat_getRight(resyncHeadRight);

                    let maxVerticalAngle = Math.max(0, this._myParams.myExitSessionMaxVerticalAngle - 0.0001);
                    if (!this._myParams.myExitSessionResyncVerticalAngle) {
                        maxVerticalAngle = 0;
                    }

                    let angleWithUp = Math.pp_angleClamp(resyncHeadUp.vec3_angleSigned(playerUp, resyncHeadRight));
                    if (Math.abs(angleWithUp) > maxVerticalAngle) {
                        let fixAngle = (Math.abs(angleWithUp) - maxVerticalAngle) * Math.pp_sign(angleWithUp);
                        resyncHeadRotation = resyncHeadRotation.quat_rotateAxis(fixAngle, resyncHeadRight, resyncHeadRotation);
                    }
                }

                resyncHeadRotation = resyncHeadRotation.quat_rotateAxisRadians(Math.PI, resyncHeadRotation.quat_getUp(resyncHeadUp), resyncHeadRotation);

                PP.myPlayerObjects.myNonVRCamera.pp_setRotationQuat(resyncHeadRotation);
            }
        }

        this._mySessionChangeResyncHeadTransform = null;
    };
}();



Object.defineProperty(PlayerHeadManager.prototype, "getHeadHeight", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "getFeetTransformQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "getFeetPosition", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "moveHead", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "rotateHeadHorizontallyQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "rotateHeadVerticallyQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportHeadPosition", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportFeetPosition", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportPlayerToHeadTransformQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_getPositionHeight", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionStart", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionEnd", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionBlurStart", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionBlurEnd", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onViewReset", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_blurEndResync", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_sessionChangeResync", { enumerable: false });