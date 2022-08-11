_myTotalRaycasts = 0; // #TODO debug stuff, remove later
_myTotalRaycastsMax = 0; // #TODO debug stuff, remove later

CollisionCheck = class CollisionCheck {
    constructor() {
        this._myRaycastSetup = new PP.RaycastSetup();
        this._myRaycastResult = new PP.RaycastResult();
        this._myFixRaycastResult = new PP.RaycastResult();

        this._myBackupRaycastHit = new PP.RaycastResultHit();

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

        if (!originalHorizontalMovement.vec3_isZero()) {
            originalHorizontalMovement.vec3_normalize(originalHorizontalMovement);

            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.001));
            debugParams.myDirection = originalHorizontalMovement;
            debugParams.myLength = 0.2;
            debugParams.myColor = [0.5, 0.5, 1, 1];
            PP.myDebugManager.draw(debugParams);
        }

        if (!horizontalMovement.vec3_isZero()) {
            horizontalMovement.vec3_normalize(horizontalMovement);

            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.001));
            debugParams.myDirection = horizontalMovement;
            debugParams.myLength = 0.2;
            debugParams.myColor = [0, 0, 1, 1];
            PP.myDebugManager.draw(debugParams);
        }

        if (!verticalMovement.vec3_isZero()) {
            verticalMovement.vec3_normalize(verticalMovement);

            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = feetPosition;
            debugParams.myDirection = verticalMovement;
            debugParams.myLength = 0.2;
            debugParams.myColor = [0, 0, 1, 1];
            PP.myDebugManager.draw(debugParams);
        }
    }

    _debugRuntimeParams(collisionRuntimeParams) {
        if (collisionRuntimeParams.myHorizontalCollisionHit.isValid()) {
            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = collisionRuntimeParams.myHorizontalCollisionHit.myPosition;
            debugParams.myDirection = collisionRuntimeParams.myHorizontalCollisionHit.myNormal;
            debugParams.myLength = 0.2;
            debugParams.myColor = [1, 0, 0, 1];
            PP.myDebugManager.draw(debugParams);
        }

        if (collisionRuntimeParams.mySlidingCollisionHit.isValid()) {
            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = collisionRuntimeParams.mySlidingCollisionHit.myPosition;
            debugParams.myDirection = collisionRuntimeParams.mySlidingCollisionHit.myNormal;
            debugParams.myLength = 0.2;
            debugParams.myColor = [1, 0, 0, 1];
            PP.myDebugManager.draw(debugParams);
        }

        if (collisionRuntimeParams.myVerticalCollisionHit.isValid()) {
            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = collisionRuntimeParams.myVerticalCollisionHit.myPosition;
            debugParams.myDirection = collisionRuntimeParams.myVerticalCollisionHit.myNormal;
            debugParams.myLength = 0.2;
            debugParams.myColor = [1, 0, 0, 1];
            PP.myDebugManager.draw(debugParams);
        }
    }
};

CollisionCheck.prototype._raycastAndDebug = function () {
    return function _raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
        this._myRaycastSetup.myOrigin.vec3_copy(origin);
        this._myRaycastSetup.myDirection.vec3_copy(direction);
        this._myRaycastSetup.myDistance = distance;

        this._myRaycastSetup.myBlockLayerFlags = collisionCheckParams.myBlockLayerFlags;

        this._myRaycastSetup.myObjectsToIgnore = collisionCheckParams.myObjectsToIgnore;
        this._myRaycastSetup.myIgnoreHitsInsideCollision = ignoreHitsInsideCollision;

        let raycastResult = PP.PhysicsUtils.raycast(this._myRaycastSetup, this._myRaycastResult);
        _myTotalRaycasts++;
        //raycastResult.myHits = [];

        if (this._myDebugActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }

        return raycastResult;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_raycastAndDebug", { enumerable: false });

