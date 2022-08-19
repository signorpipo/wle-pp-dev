PlayerLocomotionTeleportParams = class PlayerLocomotionTeleportParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myMaxDistance = 0;
        this.myMaxHeightDifference = 0;
        this.myGroundAngleToIgnoreUpward = 0;
        this.myMustBeOnGround = false;

        this.myTeleportBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myTeleportFeetPositionMustBeVisible = false;
        this.myTeleportHeadPositionMustBeVisible = false;
        this.myTeleportHeadOrFeetPositionMustBeVisible = false; // wins over previous parameters

        this.myVisibilityCheckRadius = 0.05;
        this.myVisibilityCheckFeetPositionVerticalOffset = 0.1;
        this.myVisibilityCheckDistanceFromHitThreshold = 0.1;
        this.myVisibilityCheckCircumferenceSliceAmount = 6;
        this.myVisibilityCheckCircumferenceStepAmount = 1;
        this.myVisibilityCheckCircumferenceRotationPerStep = 30;
        this.myVisibilityBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myPerformTeleportAsMovement = false;
        this.myTeleportAsMovementMaxDistanceFromTeleportPosition = 0.001;
        this.myTeleportAsMovementMaxSteps = 2;

        this.myAdjustPositionEveryFrame = true;
        this.myGravityAcceleration = 0;

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

        this._myGravitySpeed = 0;

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

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("detect", "idle", "stop");
        this._myFSM.addTransition("teleport", "idle", "stop", this._completeTeleport.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        // check is flying, if it is flying do not apply gravity
        // a way to get if it is flying and set it in the other locomotion, like smooth
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
        this._myGravitySpeed = 0;
    }

    stop() {
        this._myFSM.perform("stop");
    }

    canStop() {
        return this._myFSM.isInState("idle");
    }

    update(dt) {
        this._myMouse.update(dt);

        this._myFSM.update(dt);

        if (this._myParams.myAdjustPositionEveryFrame || this._myParams.myGravityAcceleration != 0) {
            this._applyGravity(dt);
        }
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

    _completeTeleport() {
        this._teleportToPosition(this._myTeleportPosition, this._myTeleportRotationOnUp, this._myParams.myCollisionRuntimeParams);
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
    return function _isTeleportHitValid(hit, rotationOnUp) {
        let isValid = false;

        if (hit.isValid() && !hit.myIsInsideCollision) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            if (hit.myNormal.vec3_isConcordant(playerUp)) {

                isValid = this._isTeleportPositionValid(hit.myPosition, rotationOnUp);
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
    let teleportCheckCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _isTeleportPositionValid(teleportPosition, rotationOnUp) {
        let isValid = false;

        let positionVisible = this._isPositionVisible(teleportPosition);

        if (positionVisible) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
            if (rotationOnUp != 0) {
                feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
                feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
                feetTransformQuat.setRotationQuat(feetRotationQuat);
            }

            feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
            let differenceOnUp = teleportPosition.vec3_sub(feetPosition, differenceOnUpVector).vec3_componentAlongAxis(playerUp, differenceOnUpVector).vec3_length();

            if (differenceOnUp < this._myParams.myMaxHeightDifference + 0.00001) {

                let teleportCheckValid = false;
                teleportCheckCollisionRuntimeParams.copy(this._myParams.myCollisionRuntimeParams);

                if (!this._myParams.myPerformTeleportAsMovement) {
                    this._checkTeleport(teleportPosition, feetTransformQuat, teleportCheckCollisionRuntimeParams);
                } else {
                    this._checkTeleportAsMovement(teleportPosition, feetTransformQuat, teleportCheckCollisionRuntimeParams);
                }

                if (!teleportCheckCollisionRuntimeParams.myTeleportCanceled) {
                    teleportCheckValid = true;
                }

                if (teleportCheckValid && (!this._myParams.myMustBeOnGround || teleportCheckCollisionRuntimeParams.myIsOnGround)) {

                    let groundAngleValid = true;
                    let isTeleportingUpward = teleportCheckCollisionRuntimeParams.myNewPosition.vec3_isFurtherAlongDirection(feetPosition, playerUp);
                    if (isTeleportingUpward) {
                        groundAngleValid = teleportCheckCollisionRuntimeParams.myGroundAngle < this._myParams.myGroundAngleToIgnoreUpward + 0.0001;
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
    let teleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _teleportToPosition(teleportPosition, rotationOnUp, collisionRuntimeParams) {
        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.setRotationQuat(feetRotationQuat);
        }

        teleportCollisionRuntimeParams.copy(collisionRuntimeParams);
        if (!this._myParams.myPerformTeleportAsMovement) {
            this._checkTeleport(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        } else {
            this._checkTeleportAsMovement(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        }

        if (!teleportCollisionRuntimeParams.myTeleportCanceled) {
            collisionRuntimeParams.copy(teleportCollisionRuntimeParams);
            this._myParams.myPlayerHeadManager.teleportFeetPosition(collisionRuntimeParams.myNewPosition);
            if (rotationOnUp != 0) {
                teleportRotation.quat_fromAxis(rotationOnUp, playerUp);
                this._myParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(teleportRotation);
            }
        }
    };
}();

PlayerLocomotionTeleport.prototype._checkTeleport = function () {
    return function _checkTeleport(teleportPosition, feetTransformQuat, collisionRuntimeParams) {
        CollisionCheckGlobal.teleport(teleportPosition, feetTransformQuat, this._myParams.myCollisionCheckParams, collisionRuntimeParams);
        teleportOk = !collisionRuntimeParams.myTeleportCanceled;
    };
}();

PlayerLocomotionTeleport.prototype._checkTeleportAsMovement = function () {
    let checkTeleportMovementCollisionRuntimeParams = new CollisionRuntimeParams();
    let feetRotationQuat = PP.quat_create();
    let feetPosition = PP.vec3_create();
    let feetUp = PP.vec3_create();
    let teleportFeetForward = PP.vec3_create();
    let teleportFeetRotationQuat = PP.quat_create();
    let teleportFeetTransformQuat = PP.quat2_create();

    let currentFeetPosition = PP.vec3_create();
    let fixedTeleportPosition = PP.vec3_create();

    let teleportMovement = PP.vec3_create();
    let movementToTeleportPosition = PP.vec3_create();
    let movementFeetTransformQuat = PP.quat2_create();
    return function _checkTeleportAsMovement(teleportPosition, feetTransformQuat, collisionRuntimeParams) {
        feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
        feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);

        // first try a normal teleport
        feetUp = feetRotationQuat.quat_getUp(feetUp);
        teleportFeetForward = teleportPosition.vec3_sub(feetPosition, teleportFeetForward).vec3_removeComponentAlongAxis(feetUp, teleportFeetForward);
        teleportFeetForward.vec3_normalize(teleportFeetForward);
        if (teleportFeetForward.vec3_isZero(0.00001)) {
            teleportFeetForward = feetRotationQuat.quat_getForward(teleportFeetForward);
        }

        teleportFeetRotationQuat.quat_setUp(feetUp, teleportFeetForward);
        teleportFeetTransformQuat.quat2_setPositionRotationQuat(feetPosition, teleportFeetRotationQuat);

        this._checkTeleport(teleportPosition, teleportFeetTransformQuat, collisionRuntimeParams);

        // if teleport is ok then we can check movement knowing we have to move toward the teleported position (which has also snapped/fixed the position)
        if (!collisionRuntimeParams.myTeleportCanceled) {
            let teleportMovementValid = false;

            checkTeleportMovementCollisionRuntimeParams.copy(collisionRuntimeParams);
            fixedTeleportPosition.vec3_copy(collisionRuntimeParams.myNewPosition);
            currentFeetPosition.vec3_copy(feetPosition);
            for (let i = 0; i < this._myParams.myTeleportAsMovementMaxSteps; i++) {
                teleportMovement = fixedTeleportPosition.vec3_sub(currentFeetPosition, teleportMovement);
                movementFeetTransformQuat.quat2_setPositionRotationQuat(currentFeetPosition, feetRotationQuat);
                CollisionCheckGlobal.move(teleportMovement, movementFeetTransformQuat, this._myParams.myCollisionCheckParams, checkTeleportMovementCollisionRuntimeParams);

                if (!checkTeleportMovementCollisionRuntimeParams.myHorizontalMovementCanceled && !checkTeleportMovementCollisionRuntimeParams.myVerticalMovementCanceled) {
                    movementToTeleportPosition = fixedTeleportPosition.vec3_sub(checkTeleportMovementCollisionRuntimeParams.myNewPosition, movementToTeleportPosition);
                    //console.error(movementToTeleportPosition.vec3_length());
                    if (movementToTeleportPosition.vec3_length() < this._myParams.myTeleportAsMovementMaxDistanceFromTeleportPosition + 0.00001) {
                        teleportMovementValid = true;
                        break;
                    } else {
                        teleportMovement.vec3_copy(movementToTeleportPosition);
                        currentFeetPosition.vec3_copy(checkTeleportMovementCollisionRuntimeParams.myNewPosition);
                    }
                } else {
                    break;
                }
            }

            if (!teleportMovementValid) {
                collisionRuntimeParams.myTeleportCanceled = true;
            }
        }
    };
}();

PlayerLocomotionTeleport.prototype._applyGravity = function () {
    let playerUp = PP.vec3_create();
    let gravityMovement = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    return function _applyGravity(dt) {
        // if gravity is zero it's still important to move to remain snapped and gather proper surface data even when not teleporting

        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        this._myGravitySpeed += this._myParams.myGravityAcceleration * dt;
        gravityMovement = playerUp.vec3_scale(this._myGravitySpeed * dt, gravityMovement);

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        CollisionCheckGlobal.move(gravityMovement, feetTransformQuat, this._myParams.myCollisionCheckParams, this._myParams.myCollisionRuntimeParams);
        if (!this._myParams.myCollisionRuntimeParams.myVerticalMovementCanceled) {
            this._myParams.myPlayerHeadManager.teleportFeetPosition(this._myParams.myCollisionRuntimeParams.myNewPosition);
        }

        if (this._myGravitySpeed > 0 && this._myParams.myCollisionRuntimeParams.myIsOnCeiling ||
            this._myGravitySpeed < 0 && this._myParams.myCollisionRuntimeParams.myIsOnGround) {
            this._myGravitySpeed = 0;
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
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_checkTeleport", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_checkTeleportAsMovement", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_applyGravity", { enumerable: false });