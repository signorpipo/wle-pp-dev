PP.CollisionCheckBridge = {
    _myCollisionCheck: new CollisionCheck(),

    checkMovement: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.move(movement, currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    checkTeleportToTransform: function () {
        let teleportPosition = PP.vec3_create();
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            teleportPosition = teleportTransformQuat.quat2_getPosition(teleportPosition);
            this._myCollisionCheck.teleport(teleportPosition, teleportTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    checkTransform: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.positionCheck(allowAdjustments, checkTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    updateGroundInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeCeilingInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    updateCeilingInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeGroundInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    convertCharacterColliderSetupToCollisionCheckParams: function (characterColliderSetup, outCollisionCheckParams) {

    },
    convertCharacterCollisionResultsToCollisionRuntimeParams: function (characterCollisionResults, outCollisionRuntimeParams) {

    },
    convertCollisionRuntimeParamsToCharacterCollisionResults: function (collisionRuntimeParams, outCharacterCollisionResults) {

    }
};