PlayerLocomotionTeleportParams = class PlayerLocomotionTeleportParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myMaxDistance = 0;
        this.myMaxHeightDifference = 0;
        this.myGroundAngleToIgnoreUpward = 0;

        this.myTeleportBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myTeleportFeetPositionMustBeVisible = false;
        this.myTeleportHeadPositionMustBeVisible = false;

        this.myVisibilityCheckRadius = 0.05;
        this.myVisibilityCheckFeetPositionVerticalOffset = 0.1;
        this.myVisibilityCheckDistanceFromHitThreshold = 0.1;
        this.myVisibilityCheckCircumferenceSliceAmount = 6;
        this.myVisibilityCheckCircumferenceStepAmount = 1;
        this.myVisibilityCheckCircumferenceRotationPerStep = 30;
        this.myVisibilityBlockLayerFlags = new PP.PhysicsLayerFlags();

        //flag to perform it has a movement (so the same check)

        this.myDebugActive = false;
    }
};

PlayerLocomotionTeleport = class PlayerLocomotionTeleport {
    constructor(params) {
        this._myParams = params;

        this._myMouse = new PP.Mouse();
        this._myStickIdleTimer = new PP.Timer(0.25, false);

        this._mySessionActive = false;

        this._myTeleportPositionValid = false;
        this._myTeleportPosition = PP.vec3_create();
        this._myTeleportRotationOnUp = 0;

        this._myFSM = new PP.FSM();
        this._myFSM.setDebugLogActive(true, "Locomotion Teleport");

        this._myFSM.addState("init");
        this._myFSM.addState("idle", this._idleUpdate.bind(this));
        this._myFSM.addState("detect", this._detectUpdate.bind(this));
        this._myFSM.addState("teleport", this._teleportUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");

        this._myFSM.addTransition("idle", "detect", "detect");
        this._myFSM.addTransition("detect", "teleport", "teleport");
        this._myFSM.addTransition("detect", "idle", "cancel");
        this._myFSM.addTransition("teleport", "idle", "done");

        this._myFSM.addTransition("detect", "idle", "stop");
        this._myFSM.addTransition("teleport", "idle", "stop");

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }

    init() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));

        this._myMouse.setContextMenuActive(false);
    }

    start() {
    }

    stop() {
        // if is teleporting complete the teleport
        this._myFSM.perform("stop");
    }

    update(dt) {
        this._myMouse.update(dt);

        this._myFSM.update(dt);

        // collision check for gravity/keep snapping
    }

    _idleUpdate(dt) {
        if (this._startDetecting()) {
            this._myFSM.perform("detect");
        }
    }

    _detectUpdate(dt) {
        this._detectTeleportPosition();

        this._showTeleportPosition(dt);

        if (this._confirmTeleport()) {
            if (this._myTeleportPositionValid) {
                this._myFSM.perform("teleport");
            } else {
                this._myFSM.perform("cancel");
            }
        } else if (this._cancelTeleport()) {
            this._myFSM.perform("cancel");
        }
    }

    _teleportUpdate(dt) {
        this._teleportToPosition(this._myTeleportPosition, this._myTeleportRotationOnUp, this._myParams.myCollisionRuntimeParams);
        this._myFSM.perform("done");
    }

    _startDetecting() {
        let startDetecting = false;

        if (!this._mySessionActive) {
            startDetecting = this._myMouse.isButtonPressStart(PP.MouseButtonType.MIDDLE);
        } else {

        }

        return startDetecting;
    }

    _confirmTeleport() {
        let confirmTeleport = false;

        if (!this._mySessionActive) {
            confirmTeleport = this._myMouse.isButtonPressEnd(PP.MouseButtonType.MIDDLE);
        } else {

        }

        return confirmTeleport;
    }

    _cancelTeleport() {
        let cancelTeleport = false;

        if (!this._mySessionActive) {
            cancelTeleport = this._myMouse.isButtonPressEnd(PP.MouseButtonType.RIGHT);
        } else {

        }

        return cancelTeleport;
    }

    _detectTeleportPosition() {
        if (this._mySessionActive) {
            this._detectTeleportPositionVR();
        } else {
            this._detectTeleportPositionNonVR();
        }
    }

    _showTeleportPosition() {

    }

    _onXRSessionStart(session) {
        this._mySessionActive = true;
    }

    _onXRSessionEnd(session) {
        this._mySessionActive = false;
    }
};

PlayerLocomotionTeleport.prototype._detectTeleportPositionNonVR = function () {
    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();

    return function _detectTeleportPositionNonVR(dt) {
        this._myTeleportRotationOnUp = 0;
        this._myTeleportPosition.vec3_zero();
        this._myTeleportPositionValid = false;

        raycastSetup.myDistance = this._myParams.myMaxDistance;

        raycastSetup.myBlockLayerFlags.setMask(this._myParams.myTeleportBlockLayerFlags.getMask());

        raycastSetup.myObjectsToIgnore.pp_clear();
        raycastSetup.myIgnoreHitsInsideCollision = false;

        raycastResult = this._myMouse.raycastWorld(raycastSetup, raycastResult);

        if (raycastResult.isColliding()) {
            let hit = raycastResult.myHits.pp_first();

            this._myTeleportPosition.vec3_copy(hit.myPosition);
            this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRotationOnUp);
        }

        if (this._myParams.myDebugActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }
    };
}();

PlayerLocomotionTeleport.prototype._detectTeleportPositionVR = function () {
    return function _detectTeleportPositionVR(dt) {

    };
}();

PlayerLocomotionTeleport.prototype._isTeleportHitValid = function () {
    let playerUp = PP.vec3_create();
    let teleportCheckCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _isTeleportHitValid(hit, rotationOnUp) {
        let isValid = false;

        if (hit.isValid() && !hit.myIsInsideCollision) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            if (hit.myNormal.vec3_isConcordant(playerUp)) {
                teleportCheckCollisionRuntimeParams.copy(this._myParams.myCollisionRuntimeParams);

                isValid = this._isTeleportPositionValid(hit.myPosition, rotationOnUp, teleportCheckCollisionRuntimeParams);
            }
        }

        return isValid;
    };
}();

PlayerLocomotionTeleport.prototype._isTeleportPositionValid = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let feetPosition = PP.vec3_create();
    let differenceOnUpVector = PP.vec3_create();
    return function _isTeleportPositionValid(position, rotationOnUp, collisionRuntimeParams) {
        let isValid = false;

        let positionVisible = this._isPositionVisible(position);

        if (positionVisible) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
            if (rotationOnUp != 0) {
                feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
                feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
                feetTransformQuat.setRotationQuat(feetRotationQuat);
            }

            feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
            let differenceOnUp = position.vec3_sub(feetPosition, differenceOnUpVector).vec3_componentAlongAxis(playerUp, differenceOnUpVector).vec3_length();

            if (differenceOnUp < this._myParams.myMaxHeightDifference + 0.00001) {
                CollisionCheckGlobal.teleport(position, feetTransformQuat, this._myParams.myCollisionCheckParams, collisionRuntimeParams);

                if (!collisionRuntimeParams.myTeleportCanceled && collisionRuntimeParams.myIsOnGround) {
                    let groundAngleValid = true;
                    let isTeleportingUpward = collisionRuntimeParams.myFixedTeleportPosition.vec3_isFurtherAlongDirection(feetPosition, playerUp);
                    if (isTeleportingUpward) {
                        groundAngleValid = collisionRuntimeParams.myGroundAngle < this._myParams.myGroundAngleToIgnoreUpward + 0.0001;
                    }

                    if (groundAngleValid) {
                        isValid = true;
                    }
                }
            }
        }

        return isValid;
    };
}();

PlayerLocomotionTeleport.prototype._isPositionVisible = function () {
    let playerUp = PP.vec3_create();
    let standardUp = PP.vec3_create(0, 1, 0);
    let standardForward = PP.vec3_create(0, 0, 1);
    let referenceUp = PP.vec3_create();
    let headPosition = PP.vec3_create();
    let direction = PP.vec3_create();
    let fixedRight = PP.vec3_create();
    let fixedForward = PP.vec3_create();
    let fixedUp = PP.vec3_create();
    let raycastEndPosition = PP.vec3_create();
    let offsetTeleportPosition = PP.vec3_create();

    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();
    return function _isPositionVisible(teleportPosition) {
        let isVisible = true;

        if (this._myParams.myTeleportFeetPositionMustBeVisible || this._myParams.myTeleportHeadPositionMustBeVisible) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
            offsetTeleportPosition = teleportPosition.vec3_add(playerUp.vec3_scale(this._myParams.myVisibilityCheckFeetPositionVerticalOffset, offsetTeleportPosition), offsetTeleportPosition);
            if (this._myParams.myTeleportFeetPositionMustBeVisible) {

            }

            if (isVisible && this._myParams.myTeleportHeadPositionMustBeVisible) {
                let currentHead = this._myParams.myPlayerHeadManager.getCurrentHead();
                headPosition = currentHead.pp_getPosition(headPosition);
                direction = offsetTeleportPosition.vec3_sub(headPosition, direction).vec3_normalize(direction);

                referenceUp.vec3_copy(standardUp);
                if (direction.vec3_angle(standardUp) < 0.0001) {
                    referenceUp.vec3_copy(standardForward);
                }

                fixedRight = direction.vec3_cross(referenceUp, fixedRight);
                fixedUp = fixedRight.vec3_cross(direction, fixedUp);
                fixedForward.vec3_copy(direction);

                fixedUp.vec3_normalize(fixedUp);
                fixedForward.vec3_normalize(fixedForward);

                let checkPositions = this._getVisibilityCheckPositions(headPosition, fixedUp, fixedForward);

                let distance = headPosition.vec3_distance(offsetTeleportPosition);

                for (let position of checkPositions) {
                    raycastSetup.myOrigin.vec3_copy(position);
                    raycastSetup.myDirection.vec3_copy(direction);
                    raycastSetup.myDistance = distance;

                    raycastSetup.myBlockLayerFlags.setMask(this._myParams.myVisibilityBlockLayerFlags.getMask());

                    raycastSetup.myObjectsToIgnore = this._myParams.myCollisionCheckParams.myObjectsToIgnore;
                    raycastSetup.myIgnoreHitsInsideCollision = true;

                    raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                    if (this._myParams.myDebugActive) {
                        let debugParams = new PP.DebugRaycastParams();
                        debugParams.myRaycastResult = raycastResult;
                        debugParams.myNormalLength = 0.2;
                        debugParams.myThickness = 0.005;
                        PP.myDebugManager.draw(debugParams);
                    }

                    if (raycastResult.isColliding()) {
                        raycastEndPosition = position.vec3_add(direction.vec3_scale(distance, raycastEndPosition), raycastEndPosition);
                        let hit = raycastResult.myHits.pp_first();

                        if (this._myParams.myVisibilityCheckDistanceFromHitThreshold == 0 || hit.myPosition.vec3_distance(raycastEndPosition) > this._myParams.myVisibilityCheckDistanceFromHitThreshold + 0.00001) {
                            isVisible = false;
                            break;
                        }
                    }
                }
            }
        }

        return isVisible;
    };
}();

PlayerLocomotionTeleport.prototype._getVisibilityCheckPositions = function () {
    let checkPositions = [];
    let cachedCheckPositions = [];
    let currentCachedCheckPositionIndex = 0;
    let _localGetCachedCheckPosition = function () {
        let item = null;
        while (cachedCheckPositions.length <= currentCachedCheckPositionIndex) {
            cachedCheckPositions.push(PP.vec3_create());
        }

        item = cachedCheckPositions[currentCachedCheckPositionIndex];
        currentCachedCheckPositionIndex++;
        return item;
    };

    let currentDirection = PP.vec3_create();
    return function _getVisibilityCheckPositions(position, up, forward) {
        checkPositions.length = 0;
        currentCachedCheckPositionIndex = 0;

        {
            let tempCheckPosition = _localGetCachedCheckPosition();
            tempCheckPosition.vec3_copy(position);
            checkPositions.push(tempCheckPosition);
        }

        let radiusStep = this._myParams.myVisibilityCheckRadius / this._myParams.myVisibilityCheckCircumferenceStepAmount;
        let sliceAngle = 360 / this._myParams.myVisibilityCheckCircumferenceSliceAmount;
        let currentStepRotation = 0;
        for (let i = 0; i < this._myParams.myVisibilityCheckCircumferenceStepAmount; i++) {
            let currentRadius = radiusStep * (i + 1);

            currentDirection = up.vec3_rotateAxis(currentStepRotation, forward, currentDirection);
            for (let j = 0; j < this._myParams.myVisibilityCheckCircumferenceSliceAmount; j++) {
                let tempCheckPosition = _localGetCachedCheckPosition();
                let sliceDirection = currentDirection.vec3_rotateAxis(sliceAngle * j, forward, tempCheckPosition);
                checkPositions.push(position.vec3_add(sliceDirection.vec3_scale(currentRadius, sliceDirection), sliceDirection));
            }

            currentStepRotation += this._myParams.myVisibilityCheckCircumferenceRotationPerStep;
        }

        return checkPositions;
    };
}();

PlayerLocomotionTeleport.prototype._teleportToPosition = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let teleportRotation = PP.quat_create();
    let tempTeleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _teleportToPosition(position, rotationOnUp, collisionRuntimeParams) {
        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.setRotationQuat(feetRotationQuat);
        }

        tempTeleportCollisionRuntimeParams.copy(collisionRuntimeParams);
        CollisionCheckGlobal.teleport(position, feetTransformQuat, this._myParams.myCollisionCheckParams, tempTeleportCollisionRuntimeParams);

        if (!tempTeleportCollisionRuntimeParams.myTeleportCanceled) {
            collisionRuntimeParams.copy(tempTeleportCollisionRuntimeParams);
            this._myParams.myPlayerHeadManager.teleportFeetPosition(collisionRuntimeParams.myFixedTeleportPosition);
            if (rotationOnUp != 0) {
                teleportRotation.quat_fromAxis(rotationOnUp, playerUp);
                this._myParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(teleportRotation);
            }
        }
    };
}();



Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionNonVR", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionVR", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportHitValid", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportPositionValid", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isPositionVisible", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_teleportToPosition", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_getVisibilityCheckPositions", { enumerable: false });