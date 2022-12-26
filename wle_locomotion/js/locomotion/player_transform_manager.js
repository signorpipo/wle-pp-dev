PlayerTransformManagerParams = class PlayerTransformManagerParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myMovementCollisionCheckParams = null;
        this.myTeleportCollisionCheckParams = null;

        this.myCollisionRuntimeParams = null;

        this.myHeadRadius = 0;
        this.myHeadCollisionCheckComplexityLevel = 0; // 1,2,3
        this.myHeadCollisionBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myHeadCollisionObjectsToIgnore = [];

        this.myRotateOnlyIfValid = false;
        this.myResetRealResetRotationIfUpChanged = true;

        // this.myDistanceToStartApplyGravityWhenLeaning = 0; // this should be moved outisde, that is, if it is leaning stop gravity
    }
};

// update this before to check the new valid transform and if the head new trnsform is fine, then update movements, so that they will use the proper transform

PlayerTransformManager = class PlayerTransformManager {
    constructor(params) {
        this._myParams = params;

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

    }

    update(dt) {
        // check if new head is ok and update the data

        //#TODO
    }

    move(movement, collisionRuntime = null, forceMove = false) {
        // collision runtime will copy the result, so that u can use that for later reference like if it was sliding
        // maybe there should be a way to sum all the things happened for proper movement in a summary runtime
        // or maybe the move should be done once per frame, or at least theoretically

        // collision check and move

        //#TODO
    }

    teleportPosition(position, collisionRuntime = null, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case
        // use current valid rotation

        //#TODO
    }

    teleportTransformQuat(transformQuat, collisionRuntime = null, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case

        //#TODO
    }

    teleportToReal(collisionRuntime = null, forceTeleport = false) {
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

    getPosition() {
        return this._myValidPosition;
    }

    getPositionHead() {
        return this._myValidPositionHead;
    }

    getRotationQuat() {
        return this._myValidRotationQuat;
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

    getPositionHeadReal() {
        return this.getPlayerHeadManager().getPositionHead(outPosition);
    }

    getRotationQuatReal() {
        return this.getPlayerHeadManager().getRotationFeetQuat(outPosition);
    }

    getHeightReal() {
        return this._myParams.myPlayerHeadManager.getHeight();
    }

    isRealValid() {
        return !this.isBodyColliding() && !this.isHeadColliding() && !this.isLeaning();
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
        this._myParams.myPlayerHeadManager;
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
        params.myHorizontalPositionCheckVerticalDirectionType = 2; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!

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