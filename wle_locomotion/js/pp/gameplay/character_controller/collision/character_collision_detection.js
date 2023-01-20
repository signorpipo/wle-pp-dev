PP.CharacterCollisionDetection = class CharacterCollisionDetection {
    constructor() {
        this._myTotalRaycasts = 0;
        this._myTotalRaycastsMax = 0;
    }

    update(dt) {
        this._myTotalRaycasts = 0;
        this._myTotalRaycastsMax = Math.max(this._myTotalRaycasts, this._myTotalRaycastsMax);
    }

    checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        PP.CollisionCheckBridge.checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }

    checkTeleportToPosition(teleportPosition, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        // implemented outside class definition
    }

    checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        PP.CollisionCheckBridge.checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }

    checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        PP.CollisionCheckBridge.checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }

    updateSurfaceInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        this.updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
        this.updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }

    updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        PP.CollisionCheckBridge.updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }

    updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
        PP.CollisionCheckBridge.updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    }
};



// IMPLEMENTATION

PP.CharacterCollisionDetection.prototype.checkTeleportToPosition = function () {
    let teleportTransformQuat = PP.quat2_create();
    return function checkTeleportToPosition(teleportPosition, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults) {
        teleportTransformQuat.quat2_copy(currentTransformQuat);
        teleportTransformQuat.quat2_setPosition(teleportPosition);
        this.checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults);
    };
}();



Object.defineProperty(PP.CharacterCollisionDetection.prototype, "checkTeleportToPosition", { enumerable: false });