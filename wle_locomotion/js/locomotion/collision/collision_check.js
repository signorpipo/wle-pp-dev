_myTotalRaycasts = 0;
_myTotalRaycastsMax = 0;

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

    fixMovement(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        this._fixMovement(movement, transformQuat, collisionCheckParams, collisionRuntimeParams);
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

CollisionCheck.prototype._fixMovement = function () {
    let transformUp = PP.vec3_create();
    let transformForward = PP.vec3_create();
    let feetPosition = PP.vec3_create();

    let horizontalMovement = PP.vec3_create();
    let verticalMovement = PP.vec3_create();

    let movementStep = PP.vec3_create();
    let fixedMovement = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let fixedMovementStep = PP.vec3_create();
    return function (movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        //return [0, 0, 0];

        transformUp = transformQuat.quat2_getUp(transformUp);
        transformForward = transformQuat.quat2_getForward(transformForward);
        feetPosition = transformQuat.quat2_getPosition(feetPosition);

        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it
        if (height < 0.00001) {
            height = 0;
        }

        horizontalMovement = movement.vec3_removeComponentAlongAxis(transformUp, horizontalMovement);
        verticalMovement = movement.vec3_componentAlongAxis(transformUp, verticalMovement);
        //feetPosition = feetPosition.vec3_add(horizontalMovement.vec3_normalize().vec3_scale(0.5));
        //height = height / 2;
        //horizontalMovement.vec3_normalize(horizontalMovement).vec3_scale(0.3, horizontalMovement); movement = horizontalMovement.vec3_add(verticalMovement);

        let movementStepAmount = 1;
        movementStep.vec3_copy(movement);

        if (collisionCheckParams.mySplitMovementEnabled) {
            movementStepAmount = Math.max(1, Math.ceil(movement.vec3_length() / collisionCheckParams.mySplitMovementMaxLength));
            movement.vec3_scale(1 / movementStepAmount, movementStep);
        }

        fixedMovement.vec3_zero();

        for (let i = 0; i < movementStepAmount; i++) {
            newFeetPosition = feetPosition.vec3_add(fixedMovement, newFeetPosition);
            fixedMovementStep.vec3_zero();
            fixedMovementStep = this._fixMovementStep(movementStep, newFeetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams, fixedMovementStep);
            fixedMovement.vec3_add(fixedMovementStep, fixedMovement);
        }

        //fixedMovement.vec3_zero();

        collisionRuntimeParams.myOriginalPosition.vec3_copy(feetPosition);
        collisionRuntimeParams.myOriginalHeight = height;

        collisionRuntimeParams.myOriginalForward.vec3_copy(transformForward);
        collisionRuntimeParams.myOriginalUp.vec3_copy(transformUp);

        collisionRuntimeParams.myOriginalMovement.vec3_copy(movement);
        collisionRuntimeParams.myFixedMovement.vec3_copy(fixedMovement);

    };
}();
Object.defineProperty(CollisionCheck.prototype, "_fixMovement", { enumerable: false });

CollisionCheck.prototype._fixMovementStep = function () {
    let horizontalMovement = PP.vec3_create();
    let verticalMovement = PP.vec3_create();
    let fixedHorizontalMovement = PP.vec3_create();
    let fixedVerticalMovement = PP.vec3_create();
    let horizontalDirection = PP.vec3_create();
    let forwardForVertical = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let surfaceAdjustedVerticalMovement = PP.vec3_create();
    let extraSurfaceVerticalMovement = PP.vec3_create();
    return function (movement, feetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams, outFixedMovement) {
        // #TODO refactor and split horizontal check and vertical check into: hMovement + vMovement + hPosition + vPosition?
        // Will make the sliding heavier, if I slide repeating all the 4 steps instead of 2 as now, but would be more correct

        //_myTotalRaycasts = 0;

        horizontalMovement = movement.vec3_removeComponentAlongAxis(transformUp, horizontalMovement);
        if (horizontalMovement.vec3_isZero(0.000001)) {
            horizontalMovement.vec3_zero();
        }

        verticalMovement = movement.vec3_componentAlongAxis(transformUp, verticalMovement);
        if (verticalMovement.vec3_isZero(0.000001)) {
            verticalMovement.vec3_zero();
        }

        if (horizontalMovement.vec3_isZero()) {
            //return [0, 0, 0];
        }

        //collisionCheckParams.myDebugActive = true;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        fixedHorizontalMovement.vec3_zero();

        if (!horizontalMovement.vec3_isZero()) {
            horizontalDirection = horizontalMovement.vec3_normalize(horizontalDirection);
            let surfaceTooSteep = this._surfaceTooSteep(transformUp, horizontalDirection, collisionCheckParams, this._myPrevCollisionRuntimeParams);

            if (!surfaceTooSteep) {
                fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams, false, fixedHorizontalMovement);
                //console.error(_myTotalRaycasts );
                //collisionRuntimeParams.myIsCollidingHorizontally = true;
                //collisionRuntimeParams.myHorizontalCollisionHit.myNormal = [0, 0, 1];
                if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingHorizontally) {
                    fixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams, fixedHorizontalMovement);
                } else {
                    //console.error("no slide");
                }
            }
        }

        if (fixedHorizontalMovement.vec3_isZero(0.000001)) {
            fixedHorizontalMovement.vec3_zero();
        }

        forwardForVertical.vec3_copy(collisionCheckParams.myCheckVerticalFixedForward);

        if (!collisionCheckParams.myCheckVerticalFixedForwardEnabled) {
            if (fixedHorizontalMovement.vec3_isZero()) {
                if (!horizontalMovement.vec3_isZero()) {
                    forwardForVertical = horizontalMovement.vec3_normalize(forwardForVertical);
                } else {
                    forwardForVertical.vec3_copy(transformForward);
                }
            } else {
                forwardForVertical = fixedHorizontalMovement.vec3_normalize(forwardForVertical);
            }
        }

        if (!horizontalMovement.vec3_isZero() && fixedHorizontalMovement.vec3_isZero()) {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
        }


        //console.error(_myTotalRaycasts );
        // collisionCheckParams.myDebugActive = false;

        surfaceAdjustedVerticalMovement.vec3_copy(verticalMovement);
        if (collisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle) {
            extraSurfaceVerticalMovement.vec3_zero();
            extraSurfaceVerticalMovement = this._computeExtraSurfaceVerticalMovement(fixedHorizontalMovement, transformUp, collisionCheckParams, this._myPrevCollisionRuntimeParams, extraSurfaceVerticalMovement);
            surfaceAdjustedVerticalMovement.vec3_add(extraSurfaceVerticalMovement, surfaceAdjustedVerticalMovement);
        }

        newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement, newFeetPosition);
        let originalMovementSign = Math.pp_sign(verticalMovement.vec3_lengthSigned(transformUp), 0);

        fixedVerticalMovement.vec3_zero();
        fixedVerticalMovement = this._verticalCheck(surfaceAdjustedVerticalMovement, originalMovementSign, newFeetPosition, height, transformUp, forwardForVertical, collisionCheckParams, collisionRuntimeParams, fixedVerticalMovement);

        //console.error(_myTotalRaycasts );
        outFixedMovement.vec3_zero();
        if (!collisionRuntimeParams.myIsCollidingVertically) {
            outFixedMovement = fixedHorizontalMovement.vec3_add(fixedVerticalMovement, outFixedMovement);
        } else {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
            collisionRuntimeParams.myVerticalMovementCancelled = true;
        }

        newFeetPosition = feetPosition.vec3_add(outFixedMovement, newFeetPosition);

        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, true, collisionCheckParams, collisionRuntimeParams);
        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, false, collisionCheckParams, collisionRuntimeParams);

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugMovementActive) {
            this._debugMovement(movement, outFixedMovement, newFeetPosition, transformUp, collisionCheckParams);
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }

        //console.error(_myTotalRaycasts );

        _myTotalRaycastsMax = Math.max(_myTotalRaycasts, _myTotalRaycastsMax);
        //console.error(_myTotalRaycastsMax);

        //return outFixedMovement.vec3_zero();

        return outFixedMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_fixMovementStep", { enumerable: false });

CollisionCheck.prototype._raycastAndDebug = function () {
    return function (origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
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

