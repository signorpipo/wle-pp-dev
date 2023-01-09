PlayerHeadManagerParams = class PlayerHeadManagerParams {
    constructor() {
        this.mySessionChangeResyncEnabled = false;

        this.myBlurEndResyncEnabled = false;
        this.myBlurEndResyncRotation = false;

        this.myEnterSessionResyncHeight = false;

        this.myExitSessionResyncHeight = false;
        this.myExitSessionResyncVerticalAngle = false;
        this.myExitSessionRemoveRightTilt = false; // for now right tilt is removed even if this setting is false, if the vertical angle has to be adjusted
        this.myExitSessionAdjustMaxVerticalAngle = false;
        this.myExitSessionMaxVerticalAngle = 0;

        this.myHeightOffsetVRWithFloor = null;
        this.myHeightOffsetVRWithoutFloor = null;
        this.myHeightOffsetNonVR = null;

        this.myForeheadExtraHeight = 0;
        // can be used to always add a bit of height, for example to compensate the fact 
        // that the default height is actually the eye height and you may want to also add a forehead offset

        this.myDebugActive = false;
    }
};

// could be intended as the generic player body manager (maybe with hands and stuff also)
PlayerHeadManager = class PlayerHeadManager {
    constructor(params = new PlayerHeadManagerParams()) {
        this._myParams = params;

        this._myCurrentHead = PP.myPlayerObjects.myNonVRHead;

        this._mySessionChangeResyncHeadTransform = null;
        this._myBlurRecoverHeadTransform = null;
        this._myCurrentHeadTransformQuat = PP.quat2_create();
        this._myPreviousHeadTransformQuat = PP.quat2_create();

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
        this._updateHeightOffset();

        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    getPlayer() {
        return PP.myPlayerObjects.myPlayer;
    }

    getHead() {
        return this._myCurrentHead;
    }

    getHeightHead() {
        return this.getHeightEyes() + this._myParams.myForeheadExtraHeight;
    }

    getHeightEyes() {
        // implemented outside class definition
    }

    getTransformFeetQuat(outTransformFeetQuat = PP.quat2_create()) {
        // implemented outside class definition
    }

    getTransformHeadQuat(outTransformFeetQuat = PP.quat2_create()) {
        return this.getHead().pp_getTransformQuat(outTransformFeetQuat);
    }

    getPositionFeet(outPositionFeet = PP.vec3_create()) {
        // implemented outside class definition
    }

    getPositionHead(outPositionHead = PP.vec3_create()) {
        return this._myCurrentHead.pp_getPosition(outPositionHead);
    }

    getRotationFeetQuat(outRotationFeetQuat = PP.quat_create()) {
        // implemented outside class definition
    }

    getRotationHeadQuat(outRotationHeadQuat = PP.quat_create()) {
        return this.getHead().pp_getRotationQuat(outRotationHeadQuat);
    }

    isSynced() {
        return this._myDelaySessionChangeResyncCounter == 0 && this._myDelayBlurEndResyncCounter == 0 && !this._myDelayBlurEndResyncTimer.isRunning() && !this._mySessionBlurred;
    }

    moveFeet(movement) {
        // implemented outside class definition
    }

    moveHead(movement) {
        this.moveFeet(movement);
    }

    teleportPositionHead(teleportPosition) {
        // implemented outside class definition
    }

    teleportPositionFeet(teleportPosition) {
        // implemented outside class definition
    }

    teleportPlayerToHeadTransformQuat(headTransformQuat) {
        // implemented outside class definition
    }

    rotateFeetQuat(rotationQuat) {
        // implemented outside class definition 
    }

    rotateHeadQuat(rotationQuat) {
        // implemented outside class definition 
    }

    canRotateFeet() {
        return true;
    }

    canRotateHead() {
        return !this._mySessionActive;
    }

    setRotationFeetQuat() {
        // implemented outside class definition 
    }

    setRotationHeadQuat() {
        // implemented outside class definition 
    }

    lookToFeet() {
        //#TODO to implement
    }

    lookToHead() {
        //#TODO to implement
    }

    update(dt) {
        this._updateHeightOffset();

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

        if (this.isSynced()) {
            this._myPreviousHeadTransformQuat.quat2_copy(this._myCurrentHeadTransformQuat);
            this._myCurrentHead.pp_getTransformQuat(this._myCurrentHeadTransformQuat);
        }

        if (this._myParams.myDebugActive) {
            this._debugUpdate(dt);
        }
    }

    _debugUpdate(dt) {
        PP.myDebugVisualManager.drawLineEnd(0, this.getPositionFeet(), this.getPositionHead(), [1, 0, 0, 1], 0.01);

        console.error(this.getHeightEyes());
    }
};

PlayerHeadManager.prototype.getHeightEyes = function () {
    let headPosition = PP.vec3_create();
    return function getHeightEyes() {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let eyesHeight = this._getPositionHeight(headPosition);

        return eyesHeight;
    };
}();

PlayerHeadManager.prototype.getTransformFeetQuat = function () {
    let feetPosition = PP.vec3_create();
    let feetRotationQuat = PP.quat_create();
    return function getTransformFeetQuat(outTransformFeetQuat = PP.quat2_create()) {
        outTransformFeetQuat.quat2_setPositionRotationQuat(this.getPositionFeet(feetPosition), this.getRotationFeetQuat(feetRotationQuat));
        return outTransformFeetQuat;
    };
}();

PlayerHeadManager.prototype.getRotationFeetQuat = function () {
    let playerUp = PP.vec3_create();
    let headForward = PP.vec3_create();
    return function getRotationFeetQuat(outRotationFeetQuat = PP.quat_create()) {
        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
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

        outRotationFeetQuat.quat_setUp(playerUp, headForward);
        return outRotationFeetQuat;
    };
}();

PlayerHeadManager.prototype.getPositionFeet = function () {
    let headPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    return function getPositionFeet(outPositionFeet = PP.vec3_create()) {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let headHeight = this._getPositionHeight(headPosition);

        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
        outPositionFeet = headPosition.vec3_sub(playerUp.vec3_scale(headHeight, outPositionFeet), outPositionFeet);

        return outPositionFeet;
    };
}();

PlayerHeadManager.prototype.moveFeet = function (movement) {
    PP.myPlayerObjects.myPlayer.pp_translate(movement);
};

PlayerHeadManager.prototype.rotateFeetQuat = function () {
    let currentHeadPosition = PP.vec3_create();
    let newHeadPosition = PP.vec3_create();
    let adjustmentMovement = PP.vec3_create();
    return function rotateFeetQuat(rotationQuat) {
        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);

        PP.myPlayerObjects.myPlayer.pp_rotateAroundQuat(rotationQuat, currentHeadPosition);

        newHeadPosition = this._myCurrentHead.pp_getPosition(newHeadPosition);
        adjustmentMovement = currentHeadPosition.vec3_sub(newHeadPosition, adjustmentMovement);

        this.moveFeet(adjustmentMovement);
    };
}();

PlayerHeadManager.prototype.rotateHeadQuat = function () {
    let newHeadRotation = PP.quat_create();
    let newHeadUp = PP.vec3_create();
    return function rotateHeadQuat(rotationQuat) {
        if (this.canRotateHead()) {
            this._myCurrentHead.pp_rotateQuat(rotationQuat);
            newHeadRotation = this._myCurrentHead.pp_getRotationQuat(newHeadRotation);

            newHeadRotation = newHeadRotation.quat_rotateAxisRadians(Math.PI, newHeadRotation.quat_getUp(newHeadUp), newHeadRotation);
            PP.myPlayerObjects.myNonVRCamera.pp_setRotationQuat(newHeadRotation);
        }
    };
}();

PlayerHeadManager.prototype.setRotationFeetQuat = function () {
    let currentRotationQuat = PP.quat_create();
    let rotationQuatToRotate = PP.quat_create();
    return function setRotationFeetQuat(rotationQuat) {
        currentRotationQuat = this.getRotationFeetQuat(currentRotationQuat);
        rotationQuatToRotate = currentRotationQuat.quat_rotationToQuat(rotationQuat, rotationQuatToRotate);
        this.rotateFeetQuat(rotationQuatToRotate);
    };
}();

PlayerHeadManager.prototype.setRotationHeadQuat = function () {
    let currentRotationQuat = PP.quat_create();
    let rotationQuatToRotate = PP.quat_create();
    return function setRotationHeadQuat(rotationQuat) {
        currentRotationQuat = this.getRotationHeadQuat(currentRotationQuat);
        rotationQuatToRotate = currentRotationQuat.quat_rotationToQuat(rotationQuat, rotationQuatToRotate);
        this.rotateHeadQuat(rotationQuatToRotate);
    };
}();

PlayerHeadManager.prototype.teleportPositionHead = function () {
    let currentHeadPosition = PP.vec3_create();
    let teleportMovementToPerform = PP.vec3_create();
    return function teleportPositionHead(teleportPosition) {
        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentHeadPosition, teleportMovementToPerform);
        this.moveFeet(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportPositionFeet = function () {
    let currentFeetPosition = PP.vec3_create();
    let teleportMovementToPerform = PP.vec3_create();
    return function teleportPositionFeet(teleportPosition) {
        currentFeetPosition = this.getPositionFeet(currentFeetPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentFeetPosition, teleportMovementToPerform);
        this.moveFeet(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportPlayerToHeadTransformQuat = function () {
    let headPosition = PP.vec3_create();
    let playerUp = PP.vec3_create();
    let flatCurrentPlayerPosition = PP.vec3_create();
    let flatNewPlayerPosition = PP.vec3_create();
    let teleportMovement = PP.vec3_create();
    let playerForward = PP.vec3_create();
    let headForward = PP.vec3_create();
    let headForwardNegated = PP.vec3_create();
    let rotationToPerform = PP.quat_create();
    return function teleportPlayerToHeadTransformQuat(headTransformQuat) {
        headPosition = headTransformQuat.quat2_getPosition(headPosition);

        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);
        flatCurrentPlayerPosition = PP.myPlayerObjects.myPlayer.pp_getPosition(flatCurrentPlayerPosition).vec3_removeComponentAlongAxis(playerUp, flatCurrentPlayerPosition);
        flatNewPlayerPosition = headPosition.vec3_removeComponentAlongAxis(playerUp, flatNewPlayerPosition);

        teleportMovement = flatNewPlayerPosition.vec3_sub(flatCurrentPlayerPosition, teleportMovement);
        PP.myPlayerObjects.myPlayer.pp_translate(teleportMovement);

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
    let heightVector = PP.vec3_create();
    return function _getPositionHeight(position) {
        playerPosition = PP.myPlayerObjects.myPlayer.pp_getPosition(playerPosition);
        playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);

        heightVector = position.vec3_sub(playerPosition, heightVector).vec3_componentAlongAxis(playerUp, heightVector);
        let height = heightVector.vec3_length();
        if (!playerUp.vec3_isConcordant(heightVector)) {
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

        this._updateHeightOffset();
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

        this._updateHeightOffset();
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
    return function _onViewReset() {
        if (this._mySessionActive && this.isSynced()) {
            this.teleportPlayerToHeadTransformQuat(this._myPreviousHeadTransformQuat);
        }
    };
}();

PlayerHeadManager.prototype._blurEndResync = function () {
    let playerUp = PP.vec3_create();
    let currentHeadPosition = PP.vec3_create();
    let recoverHeadPosition = PP.vec3_create();
    let flatCurrentHeadPosition = PP.vec3_create();
    let flatRecoverHeadPosition = PP.vec3_create();
    let recoverMovement = PP.vec3_create();
    let recoverHeadForward = PP.vec3_create();
    let currentHeadForward = PP.vec3_create();
    let rotationToPerform = PP.quat_create();
    return function _blurEndResync() {
        if (this._myBlurRecoverHeadTransform != null) {
            playerUp = PP.myPlayerObjects.myPlayer.pp_getUp(playerUp);

            currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
            recoverHeadPosition = this._myBlurRecoverHeadTransform.quat2_getPosition(recoverHeadPosition);

            flatCurrentHeadPosition = currentHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatCurrentHeadPosition);
            flatRecoverHeadPosition = recoverHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatRecoverHeadPosition);

            recoverMovement = flatRecoverHeadPosition.vec3_sub(flatCurrentHeadPosition, recoverMovement);
            this.moveFeet(recoverMovement);

            recoverHeadForward = this._myBlurRecoverHeadTransform.quat2_getForward(recoverHeadForward);
            currentHeadForward = this._myCurrentHead.pp_getForward(currentHeadForward);
            rotationToPerform = currentHeadForward.vec3_rotationToPivotedQuat(recoverHeadForward, playerUp, rotationToPerform);

            if (this._myParams.myBlurEndResyncRotation) {
                this.rotateFeetQuat(rotationToPerform);
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
                this.moveFeet(resyncMovement);

                if (this._myParams.myEnterSessionResyncHeight) {
                    let resyncHeadHeight = this._getPositionHeight(resyncHeadPosition);
                    let currentHeadHeight = this._getPositionHeight(currentHeadPosition);
                    this._myParams.myHeightOffsetVRWithoutFloor = resyncHeadHeight + this._myParams.myForeheadExtraHeight;
                    if (this._myParams.myHeightOffsetVRWithFloor == null) {
                        this._myParams.myHeightOffsetVRWithFloor = 0;
                    }
                    this._myParams.myHeightOffsetVRWithFloor = this._myParams.myHeightOffsetVRWithFloor + (resyncHeadHeight - currentHeadHeight);
                    this._updateHeightOffset();
                }

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

                this.rotateFeetQuat(rotationToPerform);
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
                    this._myParams.myHeightOffsetNonVR = resyncHeadHeight + this._myParams.myForeheadExtraHeight;
                    this._updateHeightOffset();
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

PlayerHeadManager.prototype._updateHeightOffset = function () {
    return function _updateHeightOffset() {
        if (this._mySessionActive) {
            if (PP.XRUtils.isReferenceSpaceLocalFloor() || PP.XRUtils.isDeviceEmulated()) {
                this._setPlayerPivotHeightOffset(this._myParams.myHeightOffsetVRWithFloor, 0);
            } else {
                this._setPlayerPivotHeightOffset(this._myParams.myHeightOffsetVRWithoutFloor, this._myParams.myForeheadExtraHeight);
            }
        } else {
            this._setPlayerPivotHeightOffset(this._myParams.myHeightOffsetNonVR, this._myParams.myForeheadExtraHeight);
        }
    }
}();

PlayerHeadManager.prototype._setPlayerPivotHeightOffset = function () {
    let playerPivotPosition = PP.vec3_create();
    return function _setPlayerPivotHeightOffset(offset, amountToRemove) {
        if (offset != null) {
            playerPivotPosition = PP.myPlayerObjects.myPlayerPivot.pp_getPositionLocal(playerPivotPosition);
            PP.myPlayerObjects.myPlayerPivot.pp_setPositionLocal([playerPivotPosition[0], offset - amountToRemove, playerPivotPosition[2]]);
        }
    }
}();


Object.defineProperty(PlayerHeadManager.prototype, "getHeightEyes", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "getTransformFeetQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "getPositionFeet", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "moveFeet", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "rotateFeetQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "rotateHeadQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportPositionHead", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportPositionFeet", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "teleportPlayerToHeadTransformQuat", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_getPositionHeight", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionStart", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionEnd", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionBlurStart", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onXRSessionBlurEnd", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_onViewReset", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_blurEndResync", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_sessionChangeResync", { enumerable: false });
Object.defineProperty(PlayerHeadManager.prototype, "_setPlayerPivotHeightOffset", { enumerable: false });