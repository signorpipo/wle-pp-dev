CollisionCheck.prototype._surfaceTooSteep = function () {
    return function _surfaceTooSteep(up, direction, collisionCheckParams, collisionRuntimeParams) {
        let groundTooSteep = false;
        let ceilingTooSteep = false;

        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle > collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
            let groundPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                collisionRuntimeParams.myGroundAngle,
                collisionRuntimeParams.myGroundNormal,
                up, direction, true);

            groundTooSteep = groundPerceivedAngle >= 0;
        }

        if (!groundTooSteep) {
            if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle > collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                let ceilingPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingAngle,
                    collisionRuntimeParams.myCeilingNormal,
                    up, direction, false);

                ceilingTooSteep = ceilingPerceivedAngle >= 0;
            }
        }

        return groundTooSteep || ceilingTooSteep;
    };
}();

CollisionCheck.prototype._computeExtraSurfaceVerticalMovement = function () {
    let direction = PP.vec3_create();
    let tempVector = PP.vec3_create();
    return function _computeExtraSurfaceVerticalMovement(horizontalMovement, up, collisionCheckParams, collisionRuntimeParams, outExtraSurfaceVerticalMovement) {
        outExtraSurfaceVerticalMovement.vec3_zero();

        if (!horizontalMovement.vec3_isZero()) {
            if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle != 0) {
                direction = horizontalMovement.vec3_normalize(direction);
                let groundPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myGroundAngle,
                    collisionRuntimeParams.myGroundNormal,
                    up, direction, true);

                let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(groundPerceivedAngle)));
                extraVerticalLength *= Math.pp_sign(groundPerceivedAngle);

                if (Math.abs(extraVerticalLength) > 0.00001 && (collisionCheckParams.mySnapOnGroundEnabled || extraVerticalLength > 0)) {
                    outExtraSurfaceVerticalMovement.vec3_add(up.vec3_scale(extraVerticalLength, tempVector), outExtraSurfaceVerticalMovement);
                }
            } else if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle != 0) {
                direction = horizontalMovement.vec3_normalize(direction);
                let ceilingPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingAngle,
                    collisionRuntimeParams.myCeilingNormal,
                    up, direction, false);

                let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(ceilingPerceivedAngle)));
                extraVerticalLength *= Math.pp_sign(ceilingPerceivedAngle);
                extraVerticalLength *= -1;

                if (Math.abs(extraVerticalLength) > 0.00001 && (collisionCheckParams.mySnapOnCeilingEnabled || extraVerticalLength < 0)) {
                    outExtraSurfaceVerticalMovement.vec3_add(up.vec3_scale(extraVerticalLength, tempVector), outExtraSurfaceVerticalMovement);
                }
            }
        }

        return outExtraSurfaceVerticalMovement;
    };
}();

CollisionCheck.prototype._gatherSurfaceInfo = function () {
    let verticalDirection = PP.vec3_create();
    let startOffset = PP.vec3_create();
    let endOffset = PP.vec3_create();
    let heightOffset = PP.vec3_create();
    let surfaceNormal = PP.vec3_create();
    let hitFromCurrentPosition = PP.vec3_create();
    let startPosition = PP.vec3_create();
    let endPosition = PP.vec3_create();
    let direction = PP.vec3_create();
    return function _gatherSurfaceInfo(feetPosition, height, up, forwardForPerceivedAngle, forwardForVertical, isGround, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSurfaceInfoActive;

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forwardForVertical, collisionCheckParams, collisionRuntimeParams);

        verticalDirection.vec3_copy(up);
        let distanceToBeOnSurface = collisionCheckParams.myDistanceToBeOnGround;
        let distanceToComputeSurfaceInfo = collisionCheckParams.myDistanceToComputeGroundInfo;
        let verticalFixToBeOnSurface = collisionCheckParams.myVerticalFixToBeOnGround;
        let verticalFixToComputeSurfaceInfo = collisionCheckParams.myVerticalFixToComputeGroundInfo;
        if (!isGround) {
            verticalDirection.vec3_negate(verticalDirection);
            distanceToBeOnSurface = collisionCheckParams.myDistanceToBeOnCeiling;
            distanceToComputeSurfaceInfo = collisionCheckParams.myDistanceToComputeCeilingInfo;
            verticalFixToBeOnSurface = collisionCheckParams.myVerticalFixToBeOnCeiling;
            verticalFixToComputeSurfaceInfo = collisionCheckParams.myVerticalFixToComputeCeilingInfo;
        }

        startOffset = verticalDirection.vec3_scale(Math.max(verticalFixToBeOnSurface, verticalFixToComputeSurfaceInfo, 0.00001), startOffset);
        endOffset = verticalDirection.vec3_negate(endOffset).vec3_scale(Math.max(distanceToBeOnSurface, distanceToComputeSurfaceInfo, 0.00001), endOffset);

        heightOffset.vec3_zero();
        if (!isGround) {
            heightOffset = up.vec3_scale(height, heightOffset);
        }

        let isOnSurface = false;
        let surfaceAngle = 0;
        let surfacePerceivedAngle = 0;
        surfaceNormal.vec3_zero();

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            currentPosition.vec3_add(heightOffset, currentPosition);
            startPosition = currentPosition.vec3_add(startOffset, startPosition);
            endPosition = currentPosition.vec3_add(endOffset, endPosition);

            let origin = startPosition;
            direction = endPosition.vec3_sub(origin, direction);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.isColliding()) {
                hitFromCurrentPosition = raycastResult.myHits[0].myPosition.vec3_sub(currentPosition, hitFromCurrentPosition);
                let hitFromCurrentPositionLength = hitFromCurrentPosition.vec3_lengthSigned(verticalDirection);

                if ((hitFromCurrentPositionLength >= 0 && hitFromCurrentPositionLength <= verticalFixToBeOnSurface + 0.00001) ||
                    (hitFromCurrentPositionLength < 0 && Math.abs(hitFromCurrentPositionLength) <= distanceToBeOnSurface + 0.00001)) {
                    isOnSurface = true;
                }

                if ((hitFromCurrentPositionLength >= 0 && hitFromCurrentPositionLength <= verticalFixToComputeSurfaceInfo + 0.00001) ||
                    (hitFromCurrentPositionLength < 0 && Math.abs(hitFromCurrentPositionLength) <= distanceToComputeSurfaceInfo + 0.00001)) {
                    let currentSurfaceNormal = raycastResult.myHits[0].myNormal;
                    surfaceNormal.vec3_add(currentSurfaceNormal, surfaceNormal);
                }
            }
        }

        if (!surfaceNormal.vec3_isZero()) {
            surfaceNormal.vec3_normalize(surfaceNormal);
            surfaceAngle = surfaceNormal.vec3_angle(verticalDirection);

            if (surfaceAngle < 0.0001) {
                surfaceAngle = 0;
                surfaceNormal.vec3_copy(verticalDirection);
            } else if (surfaceAngle > 180 - 0.0001) {
                surfaceAngle = 180;
                surfaceNormal = verticalDirection.vec3_negate(surfaceNormal);
            }

            surfacePerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forwardForPerceivedAngle, isGround);
        }

        if (isGround) {
            collisionRuntimeParams.myIsOnGround = isOnSurface;
            if (isOnSurface) {
                collisionRuntimeParams.myGroundAngle = surfaceAngle;
                collisionRuntimeParams.myGroundPerceivedAngle = surfacePerceivedAngle;
                collisionRuntimeParams.myGroundNormal.vec3_copy(surfaceNormal);
            }
        } else {
            collisionRuntimeParams.myIsOnCeiling = isOnSurface;
            if (isOnSurface) {
                collisionRuntimeParams.myCeilingAngle = surfaceAngle;
                collisionRuntimeParams.myCeilingPerceivedAngle = surfacePerceivedAngle;
                collisionRuntimeParams.myCeilingNormal.vec3_copy(surfaceNormal);
            }
        }
    };
}();



Object.defineProperty(CollisionCheck.prototype, "_surfaceTooSteep", { enumerable: false });
Object.defineProperty(CollisionCheck.prototype, "_computeExtraSurfaceVerticalMovement", { enumerable: false });
Object.defineProperty(CollisionCheck.prototype, "_gatherSurfaceInfo", { enumerable: false });