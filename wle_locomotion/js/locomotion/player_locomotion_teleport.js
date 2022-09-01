PlayerLocomotionTeleportParams = class PlayerLocomotionTeleportParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;

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
        this.myTeleportAsMovementRemoveVerticalMovement = true;
        this.myTeleportAsMovementExtraVerticalMovementPerMeter = 1; // this simulate the gravity for the teleport movement

        this.myAdjustPositionEveryFrame = true;
        this.myGravityAcceleration = 0;

        this.myDebugActive = false;
        this.myDebugDetectActive = false;
        this.myDebugVisibilityActive = false;
    }
};

PlayerLocomotionTeleport = class PlayerLocomotionTeleport extends PlayerLocomotionMovement {
    constructor(params, runtimeParams) {
        super(runtimeParams);

        this._myParams = params;

        this._myStickIdleTimer = new PP.Timer(0.25, false);

        this._mySessionActive = false;

        this._myTeleportDetectionValid = false;
        this._myStickIdleCharge = false;
        this._myStickIdleThreshold = 0.1;

        this._myForwardMinAngleToBeValid = 15;

        this._myTeleportPositionValid = false;
        this._myTeleportPosition = PP.vec3_create();
        this._myTeleportRotationOnUp = 0;

        this._myGravitySpeed = 0;

        this._myFSM = new PP.FSM();
        //this._myFSM.setDebugLogActive(true, "Locomotion Teleport");

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
    }

    init() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
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
        this._myFSM.update(dt);

        if (this._myParams.myAdjustPositionEveryFrame || this._myParams.myGravityAcceleration != 0) {
            this._applyGravity(dt);
        }

        if (this._myRuntimeParams.myCollisionRuntimeParams.myIsOnGround) {
            this._myRuntimeParams.myIsFlying = false;
        }
    }

    _idleUpdate(dt) {
        if (this._startDetecting()) {
            this._myFSM.perform("detect");
        }
    }

    _detectUpdate(dt) {
        this._detectTeleportPosition();

        if (this._myTeleportDetectionValid) {
            this._showTeleportPosition(dt);
        }

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
        this._teleportToPosition(this._myTeleportPosition, this._myTeleportRotationOnUp, this._myRuntimeParams.myCollisionRuntimeParams);
        this._myFSM.perform("done");
    }

    _startDetecting() {
        let startDetecting = false;

        if (!this._mySessionActive) {
            startDetecting = PP.myMouse.isButtonPressStart(PP.MouseButtonType.MIDDLE);
        } else {
            let axes = PP.myLeftGamepad.getAxesInfo().getAxes();

            if (axes.vec2_length() <= this._myStickIdleThreshold) {
                this._myStickIdleCharge = true;
            }

            if (this._myStickIdleCharge && axes[1] >= 0.75) {
                this._myStickIdleCharge = false;
                startDetecting = true;
            }
        }

        return startDetecting;
    }

    _confirmTeleport() {
        let confirmTeleport = false;

        if (!this._mySessionActive) {
            if (PP.myMouse.isInsideView()) {
                confirmTeleport = PP.myMouse.isButtonPressEnd(PP.MouseButtonType.MIDDLE);
            }
        } else {
            let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
            if (axes.vec2_length() <= this._myStickIdleThreshold) {
                confirmTeleport = true;
            }
        }

        return confirmTeleport;
    }

    _cancelTeleport() {
        let cancelTeleport = false;

        if (!this._mySessionActive) {
            cancelTeleport = PP.myMouse.isButtonPressEnd(PP.MouseButtonType.RIGHT) || !PP.myMouse.isInsideView();
        } else {
            cancelTeleport = PP.myLeftGamepad.getButtonInfo(PP.ButtonType.THUMBSTICK).isPressed();
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
        this._teleportToPosition(this._myTeleportPosition, this._myTeleportRotationOnUp, this._myRuntimeParams.myCollisionRuntimeParams);
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
        this._myTeleportDetectionValid = false;

        raycastSetup.myDistance = this._myParams.myMaxDistance;

        raycastSetup.myBlockLayerFlags.setMask(this._myParams.myTeleportBlockLayerFlags.getMask());

        raycastSetup.myObjectsToIgnore.pp_clear();
        raycastSetup.myIgnoreHitsInsideCollision = false;

        raycastResult = PP.myMouse.raycastWorld(raycastSetup, raycastResult);

        if (raycastResult.isColliding()) {
            this._myTeleportDetectionValid = true;

            let hit = raycastResult.myHits.pp_first();

            this._myTeleportPosition.vec3_copy(hit.myPosition);
            this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRotationOnUp);
        }

        if (this._myParams.myDebugActive && this._myParams.myDebugDetectActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }
    };
}();

PlayerLocomotionTeleport.prototype._detectTeleportPositionVR = function () {
    let handPosition = PP.vec3_create();
    let handForward = PP.vec3_create();
    let handRight = PP.vec3_create();
    let playerUp = PP.vec3_create();
    let playerUpNegate = PP.vec3_create();
    let extraRotationAxis = PP.vec3_create();
    let teleportDirection = PP.vec3_create();

    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();
    return function _detectTeleportPositionVR(dt) {
        this._myTeleportDetectionValid = false;

        let referenceObject = PP.myPlayerObjects.myHandLeft;

        handPosition = referenceObject.pp_getPosition(handPosition);
        handForward = referenceObject.pp_getForward(handForward);
        handRight = referenceObject.pp_getRight(handRight);

        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
        playerUpNegate = playerUp.vec3_negate(playerUpNegate);

        extraRotationAxis = handForward.vec3_cross(playerUp, extraRotationAxis).vec3_normalize(extraRotationAxis);
        if (!extraRotationAxis.vec3_isConcordant(handRight)) {
            extraRotationAxis.vec3_negate(extraRotationAxis);
        }

        teleportDirection = handForward.vec3_rotateAxis(-45, extraRotationAxis);

        if (!teleportDirection.vec3_isConcordant(playerUp) && (
            handForward.vec3_angle(playerUp) > this._myForwardMinAngleToBeValid &&
            handForward.vec3_angle(playerUpNegate) > this._myForwardMinAngleToBeValid
        )) {
            this._myTeleportDetectionValid = true;
        }

        if (this._myTeleportDetectionValid) {
            raycastSetup.myOrigin.vec3_copy(handPosition);
            raycastSetup.myDirection.vec3_copy(teleportDirection);
            raycastSetup.myDistance = this._myParams.myMaxDistance;
            raycastSetup.myBlockLayerFlags.setMask(this._myParams.myTeleportBlockLayerFlags.getMask());
            raycastSetup.myObjectsToIgnore.pp_clear();
            raycastSetup.myIgnoreHitsInsideCollision = false;

            raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

            if (raycastResult.isColliding()) {
                this._myTeleportDetectionValid = true;

                let hit = raycastResult.myHits.pp_first();

                this._myTeleportPosition.vec3_copy(hit.myPosition);
                this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRotationOnUp);
            }

            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams);
        }
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

        let positionVisible = this._isTeleportPositionVisible(teleportPosition);

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
                teleportCheckCollisionRuntimeParams.copy(this._myRuntimeParams.myCollisionRuntimeParams);

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

PlayerLocomotionTeleport.prototype._isTeleportPositionVisible = function () {
    let playerUp = PP.vec3_create();

    let offsetFeetTeleportPosition = PP.vec3_create();
    let headTeleportPosition = PP.vec3_create();
    return function _isTeleportPositionVisible(teleportPosition) {
        let isVisible = true;

        if (this._myParams.myTeleportFeetPositionMustBeVisible ||
            this._myParams.myTeleportHeadPositionMustBeVisible ||
            this._myParams.myTeleportHeadOrFeetPositionMustBeVisible) {

            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
            let isHeadVisible = false;
            let isFeetVisible = false;

            if (this._myParams.myTeleportHeadOrFeetPositionMustBeVisible ||
                this._myParams.myTeleportHeadPositionMustBeVisible) {
                let headheight = this._myParams.myPlayerHeadManager.getHeadHeight();
                headTeleportPosition = teleportPosition.vec3_add(playerUp.vec3_scale(headheight, headTeleportPosition), headTeleportPosition);
                isHeadVisible = this._isPositionVisible(headTeleportPosition);
            } else {
                isHeadVisible = true;
            }

            if (this._myParams.myTeleportHeadOrFeetPositionMustBeVisible && isHeadVisible) {
                isFeetVisible = true;
            } else {
                if (this._myParams.myTeleportHeadOrFeetPositionMustBeVisible ||
                    (this._myParams.myTeleportFeetPositionMustBeVisible && isHeadVisible)) {
                    offsetFeetTeleportPosition = teleportPosition.vec3_add(playerUp.vec3_scale(this._myParams.myVisibilityCheckFeetPositionVerticalOffset, offsetFeetTeleportPosition), offsetFeetTeleportPosition);
                    isFeetVisible = this._isPositionVisible(offsetFeetTeleportPosition);
                } else {
                    isFeetVisible = true;
                }
            }

            isVisible = isHeadVisible && isFeetVisible;
        }

        return isVisible;
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

    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();
    return function _isPositionVisible(position) {
        let isVisible = true;

        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        let currentHead = this._myParams.myPlayerHeadManager.getCurrentHead();
        headPosition = currentHead.pp_getPosition(headPosition);
        direction = position.vec3_sub(headPosition, direction).vec3_normalize(direction);

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

        let distance = headPosition.vec3_distance(position);

        for (let checkPosition of checkPositions) {
            raycastSetup.myOrigin.vec3_copy(checkPosition);
            raycastSetup.myDirection.vec3_copy(fixedForward);
            raycastSetup.myDistance = distance;

            raycastSetup.myBlockLayerFlags.setMask(this._myParams.myVisibilityBlockLayerFlags.getMask());

            raycastSetup.myObjectsToIgnore = this._myParams.myCollisionCheckParams.myObjectsToIgnore;
            raycastSetup.myIgnoreHitsInsideCollision = true;

            raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

            if (this._myParams.myDebugActive && this._myParams.myDebugVisibilityActive) {
                let debugParams = new PP.DebugRaycastParams();
                debugParams.myRaycastResult = raycastResult;
                debugParams.myNormalLength = 0.2;
                debugParams.myThickness = 0.005;
                PP.myDebugManager.draw(debugParams);
            }

            if (raycastResult.isColliding()) {
                raycastEndPosition = checkPosition.vec3_add(fixedForward.vec3_scale(distance, raycastEndPosition), raycastEndPosition);
                let hit = raycastResult.myHits.pp_first();

                if (this._myParams.myVisibilityCheckDistanceFromHitThreshold == 0 || hit.myPosition.vec3_distance(raycastEndPosition) > this._myParams.myVisibilityCheckDistanceFromHitThreshold + 0.00001) {
                    isVisible = false;
                    break;
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
    let extraVerticalMovement = PP.vec3_create();
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

                if (this._myParams.myTeleportAsMovementRemoveVerticalMovement) {
                    teleportMovement = teleportMovement.vec3_removeComponentAlongAxis(feetUp, teleportMovement);
                }

                if (this._myParams.myTeleportAsMovementExtraVerticalMovementPerMeter != 0) {
                    let meters = teleportMovement.vec3_length();
                    let extraVerticalMovementValue = meters * this._myParams.myTeleportAsMovementExtraVerticalMovementPerMeter;
                    extraVerticalMovement = feetUp.vec3_scale(extraVerticalMovementValue, extraVerticalMovement);
                    teleportMovement = teleportMovement.vec3_add(extraVerticalMovement, teleportMovement);
                }

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

        if (this._myRuntimeParams.myIsFlying) {
            gravityMovement.vec3_zero();
        }

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        CollisionCheckGlobal.move(gravityMovement, feetTransformQuat, this._myParams.myCollisionCheckParams, this._myRuntimeParams.myCollisionRuntimeParams);
        if (!this._myRuntimeParams.myCollisionRuntimeParams.myVerticalMovementCanceled) {
            this._myParams.myPlayerHeadManager.teleportFeetPosition(this._myRuntimeParams.myCollisionRuntimeParams.myNewPosition);
        }

        if (this._myGravitySpeed > 0 && this._myRuntimeParams.myCollisionRuntimeParams.myIsOnCeiling ||
            this._myGravitySpeed < 0 && this._myRuntimeParams.myCollisionRuntimeParams.myIsOnGround) {
            this._myGravitySpeed = 0;
        }
    };
}();


Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionNonVR", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionVR", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportHitValid", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportPositionValid", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportPositionVisible", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isPositionVisible", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_teleportToPosition", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_getVisibilityCheckPositions", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_checkTeleport", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_checkTeleportAsMovement", { enumerable: false });
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_applyGravity", { enumerable: false });