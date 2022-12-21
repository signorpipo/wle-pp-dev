PlayerTransformManagerParams = class PlayerTransformManagerParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myMovementCollisionCheckParams = null;
        this.myTeleportCollisionCheckParams = null;

        this.myCollisionRuntimeParams = null;

        this.myHeadRadius = 0;
        this.myHeadCollisionCheckComplexityLevel = 0; // 1,2,3

        this.myRotateOnlyIfValid = false;
        this.myResetRealResetRotationIfUpChanged = true;

        // this.myDistanceToStartApplyGravityWhenLeaning = 0; // this should be moved outisde, that is, if it is leaning stop gravity
    }
};

// update this before to check the new valid transform and if the head new trnsform is fine, then update movements, so that they will use the proper transform

PlayerTransformManager = class PlayerTransformManager {
    constructor(params) {
        this._myParams = params;
        this._myHeadCollisionCheckParams = new CollisionCheckParams();

        this._myValidPositionHead = PP.vec3_create();

        this._myValidPosition = PP.vec3_create();
        this._myValidRotationQuat = new PP.quat_create();
        this._myValidHeight = 0;

        this._myIsBodyColliding = false;
        this._myIsHeadColliding = false;
        this._myIsLeaning = false;
    }

    start() {

    }

    update(dt) {
        // check if new head is ok and update the data
    }

    move(movement, forceMove = false) {
        // collision check and move
    }

    teleportPosition(position, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case
        // use current valid rotation
    }

    teleportTransformQuat(transformQuat, forceTeleport = false) {
        // collision check and teleport, if force teleport teleport in any case
    }

    teleportToReal(forceTeleport = false) {
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