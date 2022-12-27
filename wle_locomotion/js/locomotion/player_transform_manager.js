PlayerTransformManagerParams = class PlayerTransformManagerParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myMovementCollisionCheckParams = null;
        this.myTeleportCollisionCheckParams = null; // can be left null and will be generated from the movement one
        this.myIsLeaningValidAboveDistance = false;
        this.myLeaningValidDistance = 0;

        // max distance to resync valid with head, if you head is further do not resync

        this.myHeadRadius = 0;
        this.myHeadCollisionCheckComplexityLevel = 0; // 1,2,3
        this.myHeadCollisionBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myHeadCollisionObjectsToIgnore = [];

        this.myRotateOnlyIfValid = false;
        this.myResetRealResetRotationIfUpChanged = true;

        // this.myDistanceToStartApplyGravityWhenLeaning = 0; // this should be moved outisde, that is, if it is leaning stop gravity

        // set valid if head synced (head manager)

        this.myRealMovementAllowVerticalAdjustments = false;
        // this true means that the real movement should also snap on ground or fix the vertical to pop from it
        // you may want this if u want that while real moving u can also climb stairs

        // head movement apply vertical snap or not (other option to apply gravity 
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

        if (this._myParams.myTeleportCollisionCheckParams == null && this._myParams.myMovementCollisionCheckParams != null) {
            this._generateTeleportParamsFromMovementParams();
        }

        this._myHeadCollisionCheckParams = null;
        this._setupHeadCollision();

        this._myValidPosition = PP.vec3_create();
        this._myValidRotationQuat = new PP.quat_create();
        this._myValidHeight = 0;
        this._myValidPositionHead = PP.vec3_create();

        this._myIsBodyColliding = false;
        this._myIsHeadColliding = false;
        this._myIsLeaning = false;
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
        return !this._myParams.myRotateOnlyIfValid || this.isRealValid();
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

    getPositionHead(outPosition = PP.vec3_create()) {
        return outPosition.vec3_copy(this._myValidPositionHead);
    }

    getRotationQuat(outRotation = PP.quat_create()) {
        return outRotation.quat_copy(this._myValidRotationQuat);
    }

    getHeight() {
        return this._myValidHeight;
    }

    getTransformRealQuat(outTransformQuat = PP.quat2_create()) {
        return this.getPlayerHeadManager().getTransformFeetQuat(outTransformQuat);
    }

    getPositionReal(outPosition = PP.vec3_create()) {
        return this.getPlayerHeadManager().getPositionFeet(outPosition);
    }

    getPositionHeadReal(outPosition = PP.vec3_create()) {
        return this.getPlayerHeadManager().getPositionHead(outPosition);
    }

    getRotationQuatReal(outRotation = PP.quat_create()) {
        return this.getPlayerHeadManager().getRotationFeetQuat(outRotation);
    }

    getHeightReal() {
        return this._myParams.myPlayerHeadManager.getHeight();
    }

    isRealValid() {
        return !this.isBodyColliding() && !this.isHeadColliding() && !this.isLeaning();
    }

    isRealSynced() {
        return this.getPlayerHeadManager().isSynced();
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

    isLeaning() {
        return this._myIsLeaning;
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

    collisionCheckParamsUpdated(recomputeTeleportFromMovement = false) {
        if (recomputeTeleportFromMovement) {
            this.generateTeleportParamsFromMovementParams();
        }

        this._generateRealMovementParamsFromMovementParams();
    }

    _setupHeadCollision() {
        this._myHeadCollisionCheckParams = new CollisionCheckParams();
        let params = this._myHeadCollisionCheckParams;

        params.myRadius = this._myParams.myHeadRadius;
        params.myDistanceFromFeetToIgnore = 0;
        params.myDistanceFromHeadToIgnore = 0;

        params.mySplitMovementEnabled = false;
        params.myHorizontalMovementCheckEnabled = false;

        params.myHalfConeAngle = 180;
        params.myHalfConeSliceAmount = 6;
        params.myCheckConeBorder = true;
        params.myCheckConeRay = true;
        params.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = false;
        params.myHorizontalPositionCheckVerticalDirectionType = 0;

        params.myHeight = params.myRadius * 2;

        params.myCheckHeight = true;
        params.myHeightCheckStepAmount = 2;
        params.myCheckHeightTop = true;
        params.myCheckHeightConeOnCollision = false;
        params.myCheckVerticalStraight = true;
        params.myCheckVerticalDiagonalRay = false;
        params.myCheckVerticalDiagonalBorder = false;
        params.myCheckVerticalDiagonalBorderRay = false;
        params.myCheckVerticalSearchFurtherVerticalHit = false;

        params.myCheckVerticalFixedForwardEnabled = true;
        params.myCheckVerticalFixedForward = [0, 0, 1];

        params.myCheckHorizontalFixedForwardEnabled = true;
        params.myCheckHorizontalFixedForward = [0, 0, 1];

        params.myGroundAngleToIgnore = 0;
        params.myCeilingAngleToIgnore = 0;

        params.myVerticalMovementCheckEnabled = false;
        params.myVerticalPositionCheckEnabled = false;

        params.myComputeGroundInfoEnabled = false;
        params.myComputeCeilingInfoEnabled = false;

        params.mySlidingEnabled = false;

        params.myBlockLayerFlags.copy(this._myParams.myHeadCollisionBlockLayerFlags);
        params.myObjectsToIgnore.pp_copy(this._myParams.myHeadCollisionObjectsToIgnore);

        params.myDebugActive = false;

        params.myDebugHorizontalMovementActive = false;
        params.myDebugHorizontalPositionActive = true;
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

        this._myParams.myTeleportCollisionCheckParams = CollisionCheckUtils.generateTeleportParamsFromMovementParams(this._myParams.myMovementCollisionCheckParams, this._myParams.myTeleportCollisionCheckParams);
    }

    _generateRealMovementParamsFromMovementParams() {
        if (this._myRealMovementCollisionCheckParams == null) {
            this._myRealMovementCollisionCheckParams = new CollisionCheckParams();
        }

        this._myRealMovementCollisionCheckParams.copy(this._myParams.myMovementCollisionCheckParams);
        this._myRealMovementCollisionCheckParams.mySlidingEnabled = false;

        if (!this._myParams.myRealMovementAllowVerticalAdjustments) {
            this._myRealMovementCollisionCheckParams.mySnapOnGroundEnabled = false;
            this._myRealMovementCollisionCheckParams.mySnapOnCeilingEnabled = false;
            this._myRealMovementCollisionCheckParams.myGroundPopOutEnabled = false;
            this._myRealMovementCollisionCheckParams.myCeilingPopOutEnabled = false;
            this._myRealMovementCollisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle = false;
        }
    }

    _debugUpdate(dt) {
        PP.myDebugVisualManager.drawPoint(0, this._myValidPosition, [1, 0, 0, 1], 0.05);
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
    let feetTransformQuat = PP.quat2_create();
    let collisionRuntimeParams = new CollisionRuntimeParams();
    let teleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function update(dt) {
        // check if new head is ok and update the data
        // if head is not synced (blurred or session changing) avoid this and keep last valid
        if (this.isRealSynced()) {

            this._myIsBodyColliding = false;
            this._myIsHeadColliding = false;
            this._myIsLeaning = false;

            //this._myValidPosition = PP.vec3_create();
            //this._myValidRotationQuat = new PP.quat_create();
            //this._myValidHeight = 0;
            //this._myValidPositionHead = PP.vec3_create();

            collisionRuntimeParams.copy(this._myCollisionRuntimeParams);
            feetTransformQuat = this.getTransformQuat(feetTransformQuat);
            movementToCheck = this.getPositionReal(positionReal).vec3_sub(this.getPosition(position), movementToCheck);

            CollisionCheckGlobal.move(movementToCheck, feetTransformQuat, this._myRealMovementCollisionCheckParams, collisionRuntimeParams);

            if (!collisionRuntimeParams.myHorizontalMovementCanceled && !collisionRuntimeParams.myVerticalMovementCanceled) {
                this._myIsBodyColliding = false;

                this._myValidPosition.vec3_copy(collisionRuntimeParams.myNewPosition);
            } else {
                this._myIsBodyColliding = true;
            }

            //#TODO this should update ground and ceiling info but not sliding info
        }

        if (this._myParams.myDebugActive) {
            this._debugUpdate(dt);
        }
    }
}();