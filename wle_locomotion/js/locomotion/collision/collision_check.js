_myTotalRaycasts = 0; // #TODO debug stuff, remove later
_myTotalRaycastsMax = 0; // #TODO debug stuff, remove later

CollisionCheck = class CollisionCheck {
    constructor() {
        this._myRaycastSetup = new PP.RaycastSetup();
        this._myRaycastResult = new PP.RaycastResult();
        this._myFixRaycastResult = new PP.RaycastResult();

        this._myBackupRaycastHit = new PP.RaycastHit();

        this._myPrevCollisionRuntimeParams = new CollisionRuntimeParams();

        this._mySlidingCollisionRuntimeParams = new CollisionRuntimeParams();
        this._myCheckBetterSlidingNormalCollisionRuntimeParams = new CollisionRuntimeParams();
        this._myInternalSlidingCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingFlickeringFixCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingFlickeringFixSlidingCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingOppositeDirectionCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingOnVerticalCheckCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myDebugActive = false;

        _myTotalRaycasts = 0;
        _myTotalRaycastsMax = 0;

        //console.error = function () { };
    }

    move(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        this._move(movement, transformQuat, collisionCheckParams, collisionRuntimeParams);
    }

    teleport(position, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        this._teleport(position, transformQuat, collisionCheckParams, collisionRuntimeParams);
    }

    _debugMovement(movement, fixedMovement, feetPosition, up, collisionCheckParams) {
        let originalHorizontalMovement = movement.vec3_removeComponentAlongAxis(up);

        let horizontalMovement = fixedMovement.vec3_removeComponentAlongAxis(up);
        let verticalMovement = fixedMovement.vec3_componentAlongAxis(up);

        let feetPositionPlusOffset = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.001));

        if (!originalHorizontalMovement.vec3_isZero()) {
            originalHorizontalMovement.vec3_normalize(originalHorizontalMovement);

            PP.myDebugVisualManager.drawArrow(0, feetPositionPlusOffset, originalHorizontalMovement, 0.2, [0.5, 0.5, 1, 1]);
        }

        if (!horizontalMovement.vec3_isZero()) {
            horizontalMovement.vec3_normalize(horizontalMovement);

            PP.myDebugVisualManager.drawArrow(0, feetPositionPlusOffset, horizontalMovement, 0.2, [0, 0, 1, 1]);
        }

        if (!verticalMovement.vec3_isZero()) {
            verticalMovement.vec3_normalize(verticalMovement);

            PP.myDebugVisualManager.drawArrow(0, feetPosition, verticalMovement, 0.2, [0, 0, 1, 1]);
        }
    }

    _debugRuntimeParams(collisionRuntimeParams) {
        if (collisionRuntimeParams.myHorizontalCollisionHit.isValid()) {
            PP.myDebugVisualManager.drawArrow(0,
                collisionRuntimeParams.myHorizontalCollisionHit.myPosition,
                collisionRuntimeParams.myHorizontalCollisionHit.myNormal, 0.2, [1, 0, 0, 1]);
        }

        if (collisionRuntimeParams.mySlidingCollisionHit.isValid()) {
            PP.myDebugVisualManager.drawArrow(0,
                collisionRuntimeParams.mySlidingCollisionHit.myPosition,
                collisionRuntimeParams.mySlidingCollisionHit.myNormal, 0.2, [1, 0, 0, 1]);
        }

        if (collisionRuntimeParams.myVerticalCollisionHit.isValid()) {
            PP.myDebugVisualManager.drawArrow(0,
                collisionRuntimeParams.myVerticalCollisionHit.myPosition,
                collisionRuntimeParams.myVerticalCollisionHit.myNormal, 0.2, [1, 0, 0, 1]);
        }
    }
};

CollisionCheck.prototype._raycastAndDebug = function () {
    return function _raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
        this._myRaycastSetup.myOrigin.vec3_copy(origin);
        this._myRaycastSetup.myDirection.vec3_copy(direction);
        this._myRaycastSetup.myDistance = distance;

        this._myRaycastSetup.myBlockLayerFlags.setMask(collisionCheckParams.myBlockLayerFlags.getMask());

        this._myRaycastSetup.myObjectsToIgnore = collisionCheckParams.myObjectsToIgnore;
        this._myRaycastSetup.myIgnoreHitsInsideCollision = ignoreHitsInsideCollision;

        let raycastResult = PP.PhysicsUtils.raycast(this._myRaycastSetup, this._myRaycastResult);
        _myTotalRaycasts++;
        //raycastResult.myHits = [];

        if (this._myDebugActive) {
            PP.myDebugVisualManager.drawRaycast(0, raycastResult);
        }

        return raycastResult;
    };
}();



Object.defineProperty(CollisionCheck.prototype, "_raycastAndDebug", { enumerable: false });

