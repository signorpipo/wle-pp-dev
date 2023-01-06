PlayerTransformManagerSyncFlag = {
    BODY_COLLIDING: 0,
    HEAD_COLLIDING: 1,
    FAR: 2,
    FLOATING: 3
};

PlayerTransformManagerParams = class PlayerTransformManagerParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myMovementCollisionCheckParams = null;
        this.myTeleportCollisionCheckParams = null; // can be left null and will be generated from the movement one
        this.myTeleportCollisionCheckParamsCopyFromMovement = false;
        this.myTeleportCollisionCheckParamsCheck360 = false;

        this.mySyncEnabledFlagMap = new Map();
        this.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, true);
        this.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, true);
        this.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.FAR, true);
        this.mySyncEnabledFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, true);

        this.mySyncPositionFlagMap = new Map();
        this.mySyncPositionFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, true);
        this.mySyncPositionFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, false);
        this.mySyncPositionFlagMap.set(PlayerTransformManagerSyncFlag.FAR, true);
        this.mySyncPositionFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, true);

        this.mySyncPositionHeadFlagMap = new Map();
        this.mySyncPositionHeadFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, false);
        this.mySyncPositionHeadFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, true);
        this.mySyncPositionHeadFlagMap.set(PlayerTransformManagerSyncFlag.FAR, false);
        this.mySyncPositionHeadFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, false);

        this.mySyncRotationFlagMap = new Map();
        this.mySyncRotationFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, false);
        this.mySyncRotationFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, false);
        this.mySyncRotationFlagMap.set(PlayerTransformManagerSyncFlag.FAR, false);
        this.mySyncRotationFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, false);

        this.mySyncHeightFlagMap = new Map();
        this.mySyncHeightFlagMap.set(PlayerTransformManagerSyncFlag.BODY_COLLIDING, true);
        this.mySyncHeightFlagMap.set(PlayerTransformManagerSyncFlag.HEAD_COLLIDING, false);
        this.mySyncHeightFlagMap.set(PlayerTransformManagerSyncFlag.FAR, true);
        this.mySyncHeightFlagMap.set(PlayerTransformManagerSyncFlag.FLOATING, true);

        this.myIsLeaningValidAboveDistance = false;
        this.myLeaningValidDistance = 0;

        // settings for both hop and lean
        this.myIsFloatingValidIfVerticalMovement = false;
        this.myIsFloatingValidIfVerticalMovementAndRealOnGround = false; //#TODO this is more an override
        this.myIsFloatingValidIfRealOnGround = false;
        this.myIsFloatingValidIfSteepGround = false;
        this.myIsFloatingValidIfVerticalMovementAndSteepGround = false;

        this.myFloatingSplitCheckEnabled = false;
        this.myFloatingSplitCheckMaxLength = 0;
        this.myFloatingSplitCheckMaxSteps = null;
        this.myFloatingSplitCheckStepEqualLength = false;
        this.myFloatingSplitCheckStepEqualLengthMinLength = 0;

        this.myIsMaxDistanceFromRealToSyncEnabled = false;
        this.myMaxDistanceFromRealToSync = 0;
        // max distance to resync valid with head, if you head is further do not resync

        this.myHeadRadius = 0;
        this.myHeadCollisionBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myHeadCollisionObjectsToIgnore = [];

        this.myRotateOnlyIfSynced = false;
        this.myResetRealResetRotationIfUpChanged = true;

        // this.myDistanceToStartApplyGravityWhenFloating = 0; // this should be moved outisde, that is, if it is floating stop gravity

        // set valid if head synced (head manager)

        this.myRealMovementAllowVerticalAdjustments = false;
        // this true means that the real movement should also snap on ground or fix the vertical to pop from it
        // you may want this if u want that while real moving u can also climb stairs

        // real movement apply vertical snap or not (other option to apply gravity) 
        // (gravity inside this class?) only when movement is applied not for head only)

        this.myDebugActive = false;
    }
};

PlayerTransformManager = class PlayerTransformManager {
    constructor(params) {
        this._myParams = params;

        this._myRealMovementCollisionCheckParams = null;
        this._generateRealMovementParamsFromMovementParams();

        this._myCollisionRuntimeParams = new CollisionRuntimeParams();
        this._myRealCollisionRuntimeParams = new CollisionRuntimeParams();

        if (this._myParams.myTeleportCollisionCheckParamsCopyFromMovement) {
            this._generateTeleportParamsFromMovementParams();
        }

        this._myHeadCollisionCheckParams = null;
        this._setupHeadCollisionCheckParams();

        this._myValidPosition = PP.vec3_create();
        this._myValidRotationQuat = new PP.quat_create();
        this._myValidHeight = 0;
        this._myValidPositionHead = PP.vec3_create();

        this._myIsBodyColliding = false;
        this._myIsHeadColliding = false;
        this._myIsLeaning = false;
        this._myIsHopping = false;
        this._myIsFar = false;
    }

    start() {
        // get the current head position as valid for initialization no matter if colliding
    }

    // update should be before to check the new valid transform and if the head new transform is fine
    // then update movements, so that they will use the proper transform
    // pre/post update?
    // for sliding if previous frame no horizontal movement then reset sliding on pre update
    // in generale capire come fare per risolvere i problemi quando c'è un move solo verticale che sputtana i dati dello sliding precedente
    // che servono per far slidare bene anche dopo, magari un flag per dire non aggiornare le cose relative al movimento orizzontale
    // o un move check solo verticale
    update(dt) {
        // implemented outside class definition
    }

    move(movement, outCollisionRuntimeParams = null, forceMove = false) {
        // collision runtime will copy the result, so that u can use that for later reference like if it was sliding
        // maybe there should be a way to sum all the things happened for proper movement in a summary runtime
        // or maybe the move should be done once per frame, or at least in theory

        // collision check and move

        // move should move the valid transform, but also move the player object so that they head, even is colliding is dragged with it
        // also teleport, should get the difference from previous and move the player object, this will keep the relative position head-to-valid

        //#TODO
    }

    teleportPosition(position, outCollisionRuntimeParams = null, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case
        // use current valid rotation

        //#TODO
    }

    teleportTransformQuat(transformQuat, outCollisionRuntimeParams = null, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case

        //#TODO
    }

    teleportToReal(outCollisionRuntimeParams = null, forceTeleport = false) {
        // implemented outside class definition
    }

    rotateQuat(rotationQuat, forceRotate = false) {
        if (this.canRotate() || forceRotate) {
            this.myPlayerHeadManager.rotateFeetQuat(rotationQuat);
        }
    }

    rotateHeadQuat(rotationQuat, forceRotate = false) {
        if (this.canRotateHead() || forceRotate) {
            this.myPlayerHeadManager.rotateHeadQuat(rotationQuat);
        }
    }

    setRotationQuat(rotationQuat, forceSet = false) {
        if (this.canRotate() || forceSet) {
            this.myPlayerHeadManager.setRotationFeetQuat(rotationQuat);
        }
    }

    setHeadRotationQuat(rotationQuat, forceSet = false) {
        if (this.canRotateHead() || forceSet) {
            this.myPlayerHeadManager.setRotationHeadQuat(rotationQuat);
        }
    }

    canRotate() {
        return !this._myParams.myRotateOnlyIfSynced || this.isSynced();
    }

    canRotateHead() {
        return this.canRotate() && this.canrothis._myParams.myPlayerHeadManager.canRotateHead();
    }

    getPlayer() {
        return this._myParams.myPlayerHeadManager.getPlayer();
    }

    getHead() {
        return this._myParams.myPlayerHeadManager.getHead();
    }

    getTransformQuat(outTransformQuat = PP.quat2_create()) {
        return outTransformQuat.quat2_setPositionRotationQuat(this.getPosition(), this.getRotationQuat());
    }

    getPosition(outPosition = PP.vec3_create()) {
        return outPosition.vec3_copy(this._myValidPosition);
    }

    getRotationQuat(outRotation = PP.quat_create()) {
        return outRotation.quat_copy(this._myValidRotationQuat);
    }

    getPositionHead(outPosition = PP.vec3_create()) {
        return outPosition.vec3_copy(this._myValidPositionHead);
    }

    getTransformHeadQuat(outTransformQuat = PP.quat2_create()) {
        return outTransformQuat.quat2_setPositionRotationQuat(this.getPositionHead(), this.getRotationQuat());
    }

    getHeight() {
        return this._myValidHeight;
    }

    getTransformRealQuat(outTransformQuat = PP.quat2_create()) {
        return this.getPlayerHeadManager().getTransformFeetQuat(outTransformQuat);
    }

    getTransformHeadRealQuat(outTransformQuat = PP.quat2_create()) {
        return this.getPlayerHeadManager().getTransformHeadQuat(outTransformQuat);
    }

    getPositionReal(outPosition = PP.vec3_create()) {
        return this.getPlayerHeadManager().getPositionFeet(outPosition);
    }

    getPositionHeadReal(outPosition = PP.vec3_create()) {
        return this.getPlayerHeadManager().getPositionHead(outPosition);
    }

    getRotationRealQuat(outRotation = PP.quat_create()) {
        return this.getPlayerHeadManager().getRotationFeetQuat(outRotation);
    }

    getHeightReal() {
        return this._myParams.myPlayerHeadManager.getHeight();
    }

    isSynced(syncFlagMap = null) {
        let isBodyColliding = this.isBodyColliding() && (syncFlagMap == null || syncFlagMap.get(PlayerTransformManagerSyncFlag.BODY_COLLIDING));
        let isHeadColliding = this.isHeadColliding() && (syncFlagMap == null || syncFlagMap.get(PlayerTransformManagerSyncFlag.HEAD_COLLIDING));
        let isFar = this.isFar() && (syncFlagMap == null || syncFlagMap.get(PlayerTransformManagerSyncFlag.FAR));
        let isFloating = this.isFloating() && (syncFlagMap == null || syncFlagMap.get(PlayerTransformManagerSyncFlag.FLOATING));
        return !isBodyColliding && !isHeadColliding && !isFar && !isFloating;
    }

    resetReal(resetRotation = false) {
        // implemented outside class definition
    }

    isBodyColliding() {
        return this._myIsBodyColliding;
    }

    isHeadColliding() {
        return this._myIsHeadColliding;
    }

    isFloating() {
        return this.isLeaning() || this.isHopping();
    }

    isHopping() {
        return this._myIsHopping;
    }

    isLeaning() {
        return this._myIsLeaning;
    }

    isHopping() {
        return this._myIsHopping;
    }

    isFar() {
        return this._myIsFar;
    }

    getDistanceToReal() {
        // implemented outside class definition
    }

    getDistanceToRealHead() {
        // implemented outside class definition
    }

    getPlayerHeadManager() {
        return this._myParams.myPlayerHeadManager;
    }

    getParams() {
        return this._myParams;
    }

    getMovementCollisionCheckParams() {
        return this._myParams.myMovementCollisionCheckParams;
    }

    getTeleportCollisionCheckParams() {
        return this._myParams.myTeleportCollisionCheckParams;
    }

    collisionCheckParamsUpdated() {
        if (this._myParams.myTeleportCollisionCheckParamsCopyFromMovement) {
            this._generateTeleportParamsFromMovementParams();
        }

        this._generateRealMovementParamsFromMovementParams();
    }

    getRealCollisionRuntimeParams() {
        return this._myRealCollisionRuntimeParams;
    }

    _updateCollisionHeight() {
        let currentHeight = Math.max(0, this.getHeight());

        this._myParams.myMovementCollisionCheckParams.myHeight = currentHeight;
        this._myParams.myTeleportCollisionCheckParams.myHeight = currentHeight;

        this._myRealMovementCollisionCheckParams.myHeight = currentHeight;
    }

    _setupHeadCollisionCheckParams() {
        this._myHeadCollisionCheckParams = new CollisionCheckParams();
        let params = this._myHeadCollisionCheckParams;

        params.myRadius = this._myParams.myHeadRadius;
        params.myDistanceFromFeetToIgnore = 0;
        params.myDistanceFromHeadToIgnore = 0;

        params.mySplitMovementEnabled = true;
        params.mySplitMovementMaxLength = 0.5;
        params.mySplitMovementMaxStepsEnabled = true;
        params.mySplitMovementMaxSteps = 2;
        params.mySplitMovementStopWhenHorizontalMovementCanceled = true;
        params.mySplitMovementStopWhenVerticalMovementCanceled = true;

        params.myHorizontalMovementCheckEnabled = true;
        params.myHorizontalMovementRadialStepAmount = 1;
        params.myHorizontalMovementCheckDiagonal = true;
        params.myHorizontalMovementCheckVerticalDiagonalUpward = true;

        params.myHorizontalPositionCheckEnabled = true;
        params.myHalfConeAngle = 180;
        params.myHalfConeSliceAmount = 3;
        params.myCheckConeBorder = true;
        params.myCheckConeRay = true;
        params.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = false;
        params.myHorizontalPositionCheckVerticalDirectionType = 0;

        params.myHeight = params.myRadius; // on purpose the height "radius" is half, to avoid hitting before with head than body collision (through height)
        params.myPositionOffsetLocal.vec3_set(0, -params.myRadius / 2, 0)

        params.myCheckHeight = true;
        params.myHeightCheckStepAmount = 2;
        params.myCheckHeightTop = true;
        params.myCheckVerticalStraight = true;

        params.myCheckVerticalFixedForwardEnabled = true;
        params.myCheckVerticalFixedForward = [0, 0, 1];

        params.myCheckHorizontalFixedForwardEnabled = true;
        params.myCheckHorizontalFixedForward = [0, 0, 1];

        params.myVerticalMovementCheckEnabled = true;
        params.myVerticalPositionCheckEnabled = true;

        params.myGroundCircumferenceAddCenter = true;
        params.myGroundCircumferenceSliceAmount = 6;
        params.myGroundCircumferenceStepAmount = 2;
        params.myGroundCircumferenceRotationPerStep = 30;
        params.myFeetRadius = params.myRadius;

        params.myBlockLayerFlags.copy(this._myParams.myHeadCollisionBlockLayerFlags);
        params.myObjectsToIgnore.pp_copy(this._myParams.myHeadCollisionObjectsToIgnore);

        params.myDebugActive = false;

        params.myDebugHorizontalMovementActive = true;
        params.myDebugHorizontalPositionActive = false;
        params.myDebugVerticalMovementActive = false;
        params.myDebugVerticalPositionActive = false;
        params.myDebugSlidingActive = false;
        params.myDebugSurfaceInfoActive = false;
        params.myDebugRuntimeParamsActive = false;
        params.myDebugMovementActive = false;
    }

    _generateTeleportParamsFromMovementParams() {
        if (this._myParams.myTeleportCollisionCheckParams == null) {
            this._myParams.myTeleportCollisionCheckParams = new CollisionCheckParams();
        }

        if (this._myParams.myTeleportCollisionCheckParamsCheck360) {
            this._myParams.myTeleportCollisionCheckParams = CollisionCheckUtils.generate360TeleportParamsFromMovementParams(this._myParams.myMovementCollisionCheckParams, this._myParams.myTeleportCollisionCheckParams);
        } else {
            this._myParams.myTeleportCollisionCheckParams.copy(this._myParams.myMovementCollisionCheckParams);
        }
    }

    _generateRealMovementParamsFromMovementParams() {
        if (this._myRealMovementCollisionCheckParams == null) {
            this._myRealMovementCollisionCheckParams = new CollisionCheckParams();
        }

        let params = this._myRealMovementCollisionCheckParams;
        params.copy(this._myParams.myMovementCollisionCheckParams);

        params.mySplitMovementEnabled = true;
        params.mySplitMovementMaxLength = 0.5;
        params.mySplitMovementMaxStepsEnabled = true;
        params.mySplitMovementMaxSteps = 2;
        params.mySplitMovementStopWhenHorizontalMovementCanceled = true;
        params.mySplitMovementStopWhenVerticalMovementCanceled = true;

        params.mySlidingEnabled = false;

        if (!this._myParams.myRealMovementAllowVerticalAdjustments) {
            params.mySnapOnGroundEnabled = false;
            params.mySnapOnCeilingEnabled = false;
            params.myGroundPopOutEnabled = false;
            params.myCeilingPopOutEnabled = false;
            params.myAdjustVerticalMovementWithSurfaceAngle = false;
            params.myVerticalMovementReduceEnabled = false;
        }

        //params.myHorizontalMovementGroundAngleIgnoreHeight = 0.1 * 3;
        //params.myHorizontalMovementCeilingAngleIgnoreHeight = 0.1 * 3;

        params.myIsOnGroundIfInsideHit = true;

        params.myDebugActive = false;

        params.myDebugHorizontalMovementActive = false;
        params.myDebugHorizontalPositionActive = false;
        params.myDebugVerticalMovementActive = false;
        params.myDebugVerticalPositionActive = false;
        params.myDebugSlidingActive = false;
        params.myDebugSurfaceInfoActive = true;
        params.myDebugRuntimeParamsActive = false;
        params.myDebugMovementActive = false;
    }

    _debugUpdate(dt) {
        PP.myDebugVisualManager.drawPoint(0, this._myValidPosition, [1, 0, 0, 1], 0.05);
        PP.myDebugVisualManager.drawLineEnd(0, this._myValidPosition, this.getPositionReal(), [1, 0, 0, 1], 0.05);

        PP.myDebugVisualManager.drawPoint(0, this._myValidPositionHead, [1, 1, 0, 1], 0.05);
    }
};

PlayerTransformManager.prototype.getDistanceToReal = function () {
    let realPosition = PP.vec3_create();
    return function getDistanceToReal() {
        realPosition = this.getPositionReal(realPosition);
        return realPosition.vec3_distance(this.getPosition());
    };
}();

PlayerTransformManager.prototype.getDistanceToRealHead = function () {
    let realPosition = PP.vec3_create();
    return function getDistanceToRealHead() {
        realPosition = this.getPositionHeadReal(realPosition);
        return realPosition.vec3_distance(this.getPositionHead());
    };
}();

PlayerTransformManager.prototype.resetReal = function () {
    let realUp = PP.vec3_create();
    let validUp = PP.vec3_create();
    return function resetReal(resetRotation = false) {
        let playerHeadManager = this.getPlayerHeadManager();

        playerHeadManager.teleportPositionFeet(this.getPosition());

        realUp = this.getRotationFeetQuat().quat_getUp(realUp);
        validUp = this.getRotationQuat().quat_getUp(validUp);

        if (resetRotation || (realUp.vec3_angle(validUp) > Math.PP_EPSILON_DEGREES && this._myParams.myResetRealResetRotationIfUpChanged)) {
            playerHeadManager.setRotationFeetQuat(this.getRotationQuat());
        }

        // next frame the colliding flags will be updated, but I could also add a flag to specify to recompute that too, maybe a function that can be called
    };
}();

PlayerTransformManager.prototype.teleportToReal = function () {
    let transformQuat = PP.quat2_create();
    return function teleportToReal(forceTeleport = false) {
        this.teleportTransformQuat(this.getTransformRealQuat(transformQuat), forceTeleport);
    }
}();

PlayerTransformManager.prototype.update = function () {
    let movementToCheck = PP.vec3_create();
    let position = PP.vec3_create();
    let positionReal = PP.vec3_create();
    let transformQuat = PP.quat2_create();
    let collisionRuntimeParams = new CollisionRuntimeParams();

    let newPosition = PP.vec3_create();
    let newPositionHead = PP.vec3_create();
    let movementStep = PP.vec3_create();
    let currentMovementStep = PP.vec3_create();
    let transformUp = PP.vec3_create();
    let verticalMovement = PP.vec3_create();
    let movementChecked = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let floatingTransformQuat = PP.quat2_create();
    return function update(dt) {
        // check if new head is ok and update the data
        // if head is not synced (blurred or session changing) avoid this and keep last valid
        if (this.getPlayerHeadManager().isSynced()) {
            this._updateCollisionHeight();

            this._myIsBodyColliding = false;
            this._myIsHeadColliding = false;
            this._myIsLeaning = false;
            this._myIsHopping = false;
            this._myIsFar = false;

            //this._myValidPosition = PP.vec3_create();
            //this._myValidRotationQuat = new PP.quat_create();
            //this._myValidHeight = 0;
            //this._myValidPositionHead = PP.vec3_create();

            movementToCheck = this.getPositionReal(positionReal).vec3_sub(this.getPosition(position), movementToCheck);

            // Far
            if (this._myParams.mySyncEnabledFlagMap.get(PlayerTransformManagerSyncFlag.FAR)) {
                if (this._myParams.myIsMaxDistanceFromRealToSyncEnabled && movementToCheck.vec3_length() > this._myParams.myMaxDistanceFromRealToSync) {
                    this._myIsFar = true;
                }
            }

            // Body Colliding
            collisionRuntimeParams.copy(this._myCollisionRuntimeParams);
            transformQuat = this.getTransformQuat(transformQuat);
            newPosition.vec3_copy(this._myValidPosition);
            if (this._myParams.mySyncEnabledFlagMap.get(PlayerTransformManagerSyncFlag.BODY_COLLIDING)) {
                CollisionCheckGlobal.move(movementToCheck, transformQuat, this._myRealMovementCollisionCheckParams, collisionRuntimeParams);

                if (!collisionRuntimeParams.myHorizontalMovementCanceled && !collisionRuntimeParams.myVerticalMovementCanceled) {
                    this._myIsBodyColliding = false;
                    newPosition.vec3_copy(collisionRuntimeParams.myNewPosition);
                } else {
                    this._myIsBodyColliding = true;
                }
            }

            // Floating 
            if (this._myParams.mySyncEnabledFlagMap.get(PlayerTransformManagerSyncFlag.FLOATING)) {

                if (!this._myIsBodyColliding) {
                    movementToCheck = newPosition.vec3_sub(position, movementToCheck);
                } else {
                    movementToCheck = positionReal.vec3_sub(position, movementToCheck);
                }

                collisionRuntimeParams.copy(this._myCollisionRuntimeParams);
                floatingTransformQuat.quat2_setPositionRotationQuat(this._myValidPosition, this._myValidRotationQuat);
                CollisionCheckGlobal.updateSurfaceInfo(floatingTransformQuat, this._myRealMovementCollisionCheckParams, collisionRuntimeParams);
                //#TODO utilizzare on ground del body gia calcolato, ma ora non c'è quindi va bene così

                if (collisionRuntimeParams.myIsOnGround) {
                    transformUp = transformQuat.quat2_getUp(transformUp);
                    verticalMovement = movementToCheck.vec3_componentAlongAxis(transformUp);
                    let isVertical = !verticalMovement.vec3_isZero(0.00001);
                    if (!isVertical || !this._myParams.myIsFloatingValidIfVerticalMovement) {
                        let movementStepAmount = 1;
                        movementStep.vec3_copy(movementToCheck);
                        if (!movementToCheck.vec3_isZero(0.00001) && this._myParams.myFloatingSplitCheckEnabled) {
                            let equalStepLength = movementToCheck.vec3_length() / this._myParams.myFloatingSplitCheckMaxSteps;
                            if (!this._myParams.myFloatingSplitCheckStepEqualLength || equalStepLength < this._myParams.myFloatingSplitCheckStepEqualLengthMinLength) {
                                let maxLength = this._myParams.myFloatingSplitCheckStepEqualLength ? this._myParams.myFloatingSplitCheckStepEqualLengthMinLength : this._myParams.myFloatingSplitCheckMaxLength;
                                movementStepAmount = Math.ceil(movementToCheck.vec3_length() / maxLength);
                                if (movementStepAmount > 1) {
                                    movementStep = movementStep.vec3_normalize(movementStep).vec3_scale(maxLength, movementStep);
                                    movementStepAmount = (this._myParams.myFloatingSplitCheckMaxSteps != null) ? Math.min(movementStepAmount, this._myParams.myFloatingSplitCheckMaxSteps) : movementStepAmount;
                                }

                                movementStepAmount = Math.max(1, movementStepAmount);

                                if (movementStepAmount == 1) {
                                    movementStep.vec3_copy(movementToCheck);
                                }
                            } else {
                                movementStepAmount = this._myParams.myFloatingSplitCheckMaxSteps;
                                if (movementStepAmount > 1) {
                                    movementStep = movementStep.vec3_normalize(movementStep).vec3_scale(equalStepLength, movementStep);
                                }
                            }
                        }

                        let isOnValidGroundAngle = collisionRuntimeParams.myGroundAngle <= this._myRealMovementCollisionCheckParams.myGroundAngleToIgnore + 0.0001;

                        movementChecked.vec3_zero();
                        newFeetPosition.vec3_copy(this._myValidPosition);
                        collisionRuntimeParams.copy(this._myCollisionRuntimeParams);

                        let atLeastOneNotOnGround = false;
                        let isOneOnGroundBetweenNoGround = false;
                        let isLastOnGround = false;
                        let isOneOnSteepGround = false;

                        for (let i = 0; i < movementStepAmount; i++) {
                            if (movementStepAmount == 1 || i != movementStepAmount - 1) {
                                currentMovementStep.vec3_copy(movementStep);
                            } else {
                                currentMovementStep = movementToCheck.vec3_sub(movementChecked, currentMovementStep);
                            }

                            newFeetPosition = newFeetPosition.vec3_add(currentMovementStep, newFeetPosition);
                            floatingTransformQuat.quat2_setPositionRotationQuat(newFeetPosition, this._myValidRotationQuat);
                            collisionRuntimeParams.copy(this._myCollisionRuntimeParams);
                            CollisionCheckGlobal.updateSurfaceInfo(floatingTransformQuat, this._myRealMovementCollisionCheckParams, collisionRuntimeParams);
                            movementChecked = movementChecked.vec3_add(currentMovementStep, movementChecked);

                            if (!collisionRuntimeParams.myIsOnGround) {
                                atLeastOneNotOnGround = true;
                            } else {
                                if (collisionRuntimeParams.myGroundAngle > this._myRealMovementCollisionCheckParams.myGroundAngleToIgnore + 0.0001) {
                                    isOneOnSteepGround = true;
                                }

                                if (atLeastOneNotOnGround) {
                                    isOneOnGroundBetweenNoGround = true;
                                }

                                if (i == movementStepAmount - 1) {
                                    isLastOnGround = true;
                                }
                            }
                        }

                        let isFloatingOnSteepGroundFail = isOneOnSteepGround && isOnValidGroundAngle &&
                            !this._myParams.myIsFloatingValidIfSteepGround && (!isVertical || !this._myParams.myIsFloatingValidIfVerticalMovementAndSteepGround);
                        if (atLeastOneNotOnGround || isFloatingOnSteepGroundFail) {
                            if (isOneOnGroundBetweenNoGround) {
                                this._myIsHopping = true;
                            } else {
                                this._myIsLeaning = true;
                            }

                            let distance = movementToCheck.vec3_length();
                            if (this._myParams.myIsLeaningValidAboveDistance && distance > this._myParams.myLeaningValidDistance) {
                                this._myIsLeaning = false;
                            }

                            if (isLastOnGround && this._myParams.myIsFloatingValidIfRealOnGround) {
                                this._myIsLeaning = false;
                                this._myIsHopping = false;
                            } else if (isLastOnGround && isVertical && this._myParams.myIsFloatingValidIfVerticalMovementAndRealOnGround) {
                                this._myIsLeaning = false;
                                this._myIsHopping = false;
                            }
                        } else {
                            this._myIsLeaning = false;
                            this._myIsHopping = false;
                        }
                    }
                }
            }

            // Head Colliding
            movementToCheck = this.getPositionHeadReal(positionReal).vec3_sub(this.getPositionHead(position), movementToCheck);
            collisionRuntimeParams.reset();
            transformQuat = this.getTransformHeadQuat(transformQuat);
            newPositionHead.vec3_copy(this._myValidPositionHead);
            if (this._myParams.mySyncEnabledFlagMap.get(PlayerTransformManagerSyncFlag.HEAD_COLLIDING)) {
                CollisionCheckGlobal.move(movementToCheck, transformQuat, this._myHeadCollisionCheckParams, collisionRuntimeParams);

                if (!collisionRuntimeParams.myHorizontalMovementCanceled && !collisionRuntimeParams.myVerticalMovementCanceled) {
                    this._myIsHeadColliding = false;
                    newPositionHead.vec3_copy(collisionRuntimeParams.myNewPosition);
                } else {
                    this._myIsHeadColliding = true;
                }
            }

            if (this.isSynced(this._myParams.mySyncPositionFlagMap)) {
                this._myValidPosition.vec3_copy(newPosition);
            }

            if (this.isSynced(this._myParams.mySyncPositionHeadFlagMap)) {
                this._myValidPositionHead = this.getPositionHeadReal(newPositionHead);
            }

            if (this.isSynced(this._myParams.mySyncRotationFlagMap)) {
                this._myValidRotationQuat = this.getRotationRealQuat(this._myValidRotationQuat);
            }

            if (this.isSynced(this._myParams.mySyncHeightFlagMap)) {
                this._myValidHeight = this.getHeightReal();
                this._updateCollisionHeight();
            }

            // at the end, update head manager if it is synced to the new valid position

            //#TODO this should update ground and ceiling info but not sliding info

            transformQuat = this.getTransformRealQuat(transformQuat);
            CollisionCheckGlobal.positionCheck(true, transformQuat, this._myParams.myMovementCollisionCheckParams, this._myRealCollisionRuntimeParams);
        }

        if (this._myParams.myDebugActive) {
            this._debugUpdate(dt);
        }
    }
}();