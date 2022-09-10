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

        if (!originalHorizontalMovement.vec3_isZero()) {
            originalHorizontalMovement.vec3_normalize(originalHorizontalMovement);

            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.001));
            visualParams.myDirection = originalHorizontalMovement;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [0.5, 0.5, 1, 1];
            PP.myDebugVisualManager.draw(visualParams);
        }

        if (!horizontalMovement.vec3_isZero()) {
            horizontalMovement.vec3_normalize(horizontalMovement);

            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.001));
            visualParams.myDirection = horizontalMovement;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [0, 0, 1, 1];
            PP.myDebugVisualManager.draw(visualParams);
        }

        if (!verticalMovement.vec3_isZero()) {
            verticalMovement.vec3_normalize(verticalMovement);

            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = feetPosition;
            visualParams.myDirection = verticalMovement;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [0, 0, 1, 1];
            PP.myDebugVisualManager.draw(visualParams);
        }
    }

    _debugRuntimeParams(collisionRuntimeParams) {
        if (collisionRuntimeParams.myHorizontalCollisionHit.isValid()) {
            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = collisionRuntimeParams.myHorizontalCollisionHit.myPosition;
            visualParams.myDirection = collisionRuntimeParams.myHorizontalCollisionHit.myNormal;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [1, 0, 0, 1];
            PP.myDebugVisualManager.draw(visualParams);
        }

        if (collisionRuntimeParams.mySlidingCollisionHit.isValid()) {
            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = collisionRuntimeParams.mySlidingCollisionHit.myPosition;
            visualParams.myDirection = collisionRuntimeParams.mySlidingCollisionHit.myNormal;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [1, 0, 0, 1];
            PP.myDebugVisualManager.draw(visualParams);
        }

        if (collisionRuntimeParams.myVerticalCollisionHit.isValid()) {
            let visualParams = new PP.VisualArrowParams();
            visualParams.myStart = collisionRuntimeParams.myVerticalCollisionHit.myPosition;
            visualParams.myDirection = collisionRuntimeParams.myVerticalCollisionHit.myNormal;
            visualParams.myLength = 0.2;
            visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualParams.myMaterial.color = [1, 0, 0, 1];
            PP.myDebugVisualManager.draw(visualParams);
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
            let visualParams = new PP.VisualRaycastParams();
            visualParams.myRaycastResult = raycastResult;
            PP.myDebugVisualManager.draw(visualParams);
        }

        return raycastResult;
    };
}();



Object.defineProperty(CollisionCheck.prototype, "_raycastAndDebug", { enumerable: false });

