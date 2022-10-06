PlayerLocomotionTeleportTeleportState = class PlayerLocomotionTeleportTeleportState extends PlayerLocomotionTeleportState {
    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams) {
        super(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);
    }

    update(dt, fsm) {
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);

        fsm.perform("done");
    }

    completeTeleport() {
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
    }
};

PlayerLocomotionTeleportTeleportState.prototype._teleportToPosition = function () {
    let playerUp = PP.vec3_create();
    let feetPosition = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let teleportRotation = PP.quat_create();
    let teleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _teleportToPosition(teleportPosition, rotationOnUp, collisionRuntimeParams) {
        this._myTeleportAsMovementFailed = false;

        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        feetTransformQuat = this._myTeleportParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.quat2_setPositionRotationQuat(feetPosition, feetRotationQuat);
        }

        teleportCollisionRuntimeParams.copy(collisionRuntimeParams);
        if (!this._myTeleportParams.myPerformTeleportAsMovement) {
            this._checkTeleport(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        } else {
            this._checkTeleportAsMovement(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        }

        if (!teleportCollisionRuntimeParams.myTeleportCanceled) {
            collisionRuntimeParams.copy(teleportCollisionRuntimeParams);
            this._myTeleportParams.myPlayerHeadManager.teleportFeetPosition(collisionRuntimeParams.myNewPosition);
            if (rotationOnUp != 0) {
                teleportRotation.quat_fromAxis(rotationOnUp, playerUp);
                this._myTeleportParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(teleportRotation);
            }
        }
    };
}();