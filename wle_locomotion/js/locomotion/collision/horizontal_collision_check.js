CollisionCheck.prototype._horizontalCheck = function () {
    let movementDirection = PP.vec3_create();
    let fixedFeetPosition = PP.vec3_create();
    let newFixedFeetPosition = PP.vec3_create();
    return function _horizontalCheck(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, avoidSlidingExtraCheck, outFixedMovement) {
        collisionRuntimeParams.myIsCollidingHorizontally = false;
        collisionRuntimeParams.myHorizontalCollisionHit.reset();

        if (movement.vec3_isZero(0.000001)) {
            return outFixedMovement.vec3_zero();
        }

        movementDirection = movement.vec3_normalize(movementDirection);

        fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.0001, fixedFeetPosition), fixedFeetPosition);
        let fixedHeight = Math.max(0, height - collisionCheckParams.myDistanceFromFeetToIgnore - collisionCheckParams.myDistanceFromHeadToIgnore - 0.0001 * 2);

        let canMove = true;
        if (collisionCheckParams.myHorizontalMovementCheckEnabled) {
            canMove = this._horizontalMovementCheck(movement, fixedFeetPosition, fixedHeight, up, collisionCheckParams, collisionRuntimeParams);
        }

        outFixedMovement.vec3_zero();
        if (canMove) {
            newFixedFeetPosition = fixedFeetPosition.vec3_add(movement, newFixedFeetPosition);
            let canStay = this._horizontalPositionCheck(newFixedFeetPosition, fixedHeight, up, movementDirection, collisionCheckParams, collisionRuntimeParams);
            if (canStay) {
                outFixedMovement.vec3_copy(movement);
            }

            if (outFixedMovement.vec3_isZero(0.000001)) {
                outFixedMovement.vec3_zero();
            }
        } else if (!avoidSlidingExtraCheck && collisionCheckParams.mySlidingEnabled && collisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal) {
            this._horizontalCheckBetterSlideNormal(movement, fixedFeetPosition, fixedHeight, up, collisionCheckParams, collisionRuntimeParams);
        }

        return outFixedMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalCheck", { enumerable: false });

CollisionCheck.prototype._horizontalCheckRaycast = function () {
    let direction = PP.vec3_create();
    let fixedFeedPosition = PP.vec3_create();
    let fixedHitPosition = PP.vec3_create();
    return function _horizontalCheckRaycast(startPosition, endPosition, movementDirection, up,
        ignoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
        feetPosition, fixHitOnCollision,
        collisionCheckParams, collisionRuntimeParams, checkAllHits = false, ignoreHitsInsideCollisionIfObjectToIgnore = false) {

        let origin = startPosition;
        direction = endPosition.vec3_sub(origin, direction);

        if (movementDirection != null && !direction.vec3_isConcordant(movementDirection)) {
            direction.vec3_negate(direction);
            origin = endPosition;
        }

        let distance = direction.vec3_length();
        direction.vec3_normalize(direction);
        let raycastResult = this._raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams);

        let isOk = true;

        if (raycastResult.isColliding()) {
            let hitsToControl = checkAllHits ? raycastResult.myHits.length : 1;
            for (let i = 0; i < hitsToControl; i++) {
                let hit = raycastResult.myHits[i];
                if ((ignoreGroundAngleCallback == null || !ignoreGroundAngleCallback(hit, ignoreHitsInsideCollisionIfObjectToIgnore)) &&
                    (ignoreCeilingAngleCallback == null || !ignoreCeilingAngleCallback(hit, ignoreHitsInsideCollisionIfObjectToIgnore))) {
                    isOk = false;
                    break;
                }
            }
        }

        if (!isOk && fixHitOnCollision) {
            let hitPosition = raycastResult.myHits[0].myPosition;

            fixedFeedPosition = feetPosition.vec3_copyComponentAlongAxis(hitPosition, up, fixedFeedPosition);
            direction = hitPosition.vec3_sub(fixedFeedPosition, direction);
            direction.vec3_normalize(direction);
            fixedHitPosition = hitPosition.vec3_add(direction.vec3_scale(0.0001, fixedHitPosition), fixedHitPosition);

            let swapRaycastResult = this._myRaycastResult;
            this._myRaycastResult = this._myFixRaycastResult;

            isOk = this._horizontalCheckRaycast(fixedFeedPosition, fixedHitPosition, null, up,
                false, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                feetPosition, false,
                collisionCheckParams, collisionRuntimeParams);

            if (this._myRaycastResult.isColliding()) {
                this._myFixRaycastResult = swapRaycastResult;
            } else {
                isOk = false;
                this._myRaycastResult = swapRaycastResult;
            }
        }

        return isOk;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalCheckRaycast", { enumerable: false });

CollisionCheck.prototype._ignoreSurfaceAngle = function () {
    let objectsEqualCallback = (first, second) => first.pp_equals(second);
    return function _ignoreSurfaceAngle(objectsToIgnore, outIgnoredObjects, isGround, up, collisionCheckParams, hit, ignoreHitsInsideCollisionIfObjectToIgnore) {
        let isIgnorable = false;

        if (!hit.myIsInsideCollision) {
            let surfaceAngle = hit.myNormal.vec3_angle(up);

            if ((isGround && (collisionCheckParams.myGroundAngleToIgnore > 0 && surfaceAngle <= collisionCheckParams.myGroundAngleToIgnore + 0.0001)) ||
                (!isGround && (collisionCheckParams.myCeilingAngleToIgnore > 0 && (180 - surfaceAngle) <= collisionCheckParams.myCeilingAngleToIgnore + 0.0001))) {
                if (objectsToIgnore == null || objectsToIgnore.pp_hasEqual(hit.myObject, objectsEqualCallback)) {
                    isIgnorable = true;

                    if (outIgnoredObjects != null) {
                        outIgnoredObjects.push(hit.myObject);
                    }
                }
            }
        } else if (ignoreHitsInsideCollisionIfObjectToIgnore) {
            // #TODO when raycast pierce will work, if it gives the normal even when inside check if the angle is ok and only ignore if that's the case
            if (objectsToIgnore == null || objectsToIgnore.pp_hasEqual(hit.myObject, objectsEqualCallback)) {
                isIgnorable = true;
            }
        }

        return isIgnorable;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_ignoreSurfaceAngle", { enumerable: false });
