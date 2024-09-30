import { quat2_create, quat_create, vec3_create } from "../../../../../../plugin/js/extensions/array/vec_create_extension.js";
import { CollisionRuntimeParams } from "../../../../character_controller/collision/legacy/collision_check/collision_params.js";

export class PlayerLocomotionTeleportState {

    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams, movementCollisionCheckParams, teleportCollisionCheckParams) {
        this._myLocomotionRuntimeParams = locomotionRuntimeParams;

        this._myTeleportParams = teleportParams;
        this._myTeleportRuntimeParams = teleportRuntimeParams;

        this._myMovementCollisionCheckParams = movementCollisionCheckParams;
        this._myTeleportCollisionCheckParams = teleportCollisionCheckParams;

        this._myTeleportAsMovementFailed = false;
    }

    _checkTeleport(teleportPosition, feetTransformQuat, collisionRuntimeParams, checkTeleportCollisionRuntimeParams = null) {
        // Implemented outside class definition
    }

    _checkTeleportAsMovement(teleportPosition, feetTransformQuat, collisionRuntimeParams, checkTeleportCollisionRuntimeParams) {
        // Implemented outside class definition
    }

    _teleportToPosition(teleportPosition, rotationOnUp, collisionRuntimeParams, forceTeleport = false) {
        // Implemented outside class definition
    }
}



// IMPLEMENTATION

PlayerLocomotionTeleportState.prototype._checkTeleport = function () {
    let teleportTransformQuat = quat2_create();
    return function _checkTeleport(teleportPosition, teleportRotationQuat, collisionRuntimeParams, checkTeleportCollisionRuntimeParams = null) {
        teleportTransformQuat.quat2_setPositionRotationQuat(teleportPosition, teleportRotationQuat);

        this._myTeleportParams.myPlayerTransformManager.checkTeleportToTransformQuat(teleportTransformQuat, undefined, this._myTeleportCollisionCheckParams, collisionRuntimeParams);

        if (checkTeleportCollisionRuntimeParams != null) {
            checkTeleportCollisionRuntimeParams.copy(collisionRuntimeParams);
        }
    };
}();

PlayerLocomotionTeleportState.prototype._checkTeleportAsMovement = function () {
    let checkTeleportMovementCollisionRuntimeParams = new CollisionRuntimeParams();
    let feetRotationQuat = quat_create();
    let playerUp = vec3_create();

    let currentFeetPosition = vec3_create();
    let fixedTeleportPosition = vec3_create();

    let teleportMovement = vec3_create();
    let extraVerticalMovement = vec3_create();
    let movementToTeleportPosition = vec3_create();
    let movementFeetTransformQuat = quat2_create();
    return function _checkTeleportAsMovement(teleportPosition, teleportRotationQuat, collisionRuntimeParams, checkTeleportCollisionRuntimeParams) {
        checkTeleportMovementCollisionRuntimeParams.copy(collisionRuntimeParams);

        this._checkTeleport(teleportPosition, teleportRotationQuat, collisionRuntimeParams, checkTeleportCollisionRuntimeParams);

        // If teleport is ok then we can check movement knowing we have to move toward the teleported position (which has also snapped/fixed the position)
        if (!collisionRuntimeParams.myTeleportCanceled) {
            let teleportMovementValid = false;

            fixedTeleportPosition.vec3_copy(collisionRuntimeParams.myNewPosition);
            this._myTeleportParams.myPlayerTransformManager.getPosition(currentFeetPosition);

            for (let i = 0; i < this._myTeleportParams.myTeleportAsMovementMaxSteps; i++) {
                teleportMovement = fixedTeleportPosition.vec3_sub(currentFeetPosition, teleportMovement);

                if (this._myTeleportParams.myTeleportAsMovementRemoveVerticalMovement) {
                    teleportMovement = teleportMovement.vec3_removeComponentAlongAxis(playerUp, teleportMovement);
                }

                if (this._myTeleportParams.myTeleportAsMovementExtraVerticalMovementPerMeter != 0) {
                    let meters = teleportMovement.vec3_length();
                    let extraVerticalMovementValue = meters * this._myTeleportParams.myTeleportAsMovementExtraVerticalMovementPerMeter;
                    extraVerticalMovement = playerUp.vec3_scale(extraVerticalMovementValue, extraVerticalMovement);
                    teleportMovement = teleportMovement.vec3_add(extraVerticalMovement, teleportMovement);
                }

                movementFeetTransformQuat.quat2_setPositionRotationQuat(currentFeetPosition, feetRotationQuat);

                this._myTeleportParams.myPlayerTransformManager.checkMovement(teleportMovement, movementFeetTransformQuat, this._myTeleportCollisionCheckParams, checkTeleportMovementCollisionRuntimeParams);

                if (!checkTeleportMovementCollisionRuntimeParams.myHorizontalMovementCanceled && !checkTeleportMovementCollisionRuntimeParams.myVerticalMovementCanceled) {
                    movementToTeleportPosition = fixedTeleportPosition.vec3_sub(checkTeleportMovementCollisionRuntimeParams.myNewPosition, movementToTeleportPosition);
                    //console.error(movementToTeleportPosition.vec3_length());
                    if (movementToTeleportPosition.vec3_length() < this._myTeleportParams.myTeleportAsMovementMaxDistanceFromTeleportPosition + 0.00001) {
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

            this._myTeleportAsMovementFailed = !teleportMovementValid;
        }
    };
}();

PlayerLocomotionTeleportState.prototype._teleportToPosition = function () {
    let playerUp = vec3_create();
    let newFeetTransformQuat = quat2_create();
    let newFeetRotationQuat = quat_create();
    return function _teleportToPosition(teleportPosition, rotationOnUp, forceTeleport = false) {
        this._myTeleportAsMovementFailed = false;

        this._myTeleportParams.myPlayerTransformManager.getRotationRealQuat(newFeetRotationQuat);

        if (rotationOnUp != 0) {
            newFeetRotationQuat.quat_getUp(playerUp);
            newFeetRotationQuat = newFeetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, newFeetRotationQuat);
        }

        newFeetTransformQuat.quat2_setPositionRotationQuat(teleportPosition, newFeetRotationQuat);

        this._myTeleportParams.myPlayerTransformManager.teleportTransformQuat(newFeetTransformQuat, forceTeleport, undefined);
    };
}();