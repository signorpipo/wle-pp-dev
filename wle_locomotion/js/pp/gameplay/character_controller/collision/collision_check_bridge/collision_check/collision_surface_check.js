CollisionCheck.prototype._updateSurfaceInfo = function () {
    let transformUp = PP.vec3_create();
    let transformForward = PP.vec3_create();
    let feetPosition = PP.vec3_create();

    let transformOffsetLocalQuat = PP.quat2_create();
    let offsetTransformQuat = PP.quat2_create();

    let forwardForPerceivedAngle = PP.vec3_create();
    let forwardForVertical = PP.vec3_create();

    let zAxis = PP.vec3_create(0, 0, 1);
    let xAxis = PP.vec3_create(1, 0, 0);
    return function _updateSurfaceInfo(transformQuat, collisionCheckParams, collisionRuntimeParams) {
        transformOffsetLocalQuat.quat2_setPositionRotationQuat(collisionCheckParams.myPositionOffsetLocal, collisionCheckParams.myRotationOffsetLocalQuat);
        offsetTransformQuat = transformOffsetLocalQuat.quat2_toWorld(transformQuat, offsetTransformQuat);
        if (transformQuat.vec_equals(offsetTransformQuat, 0.00001)) {
            offsetTransformQuat.quat2_copy(transformQuat);
        }

        transformUp = offsetTransformQuat.quat2_getUp(transformUp);
        transformForward = offsetTransformQuat.quat2_getForward(transformForward);
        feetPosition = offsetTransformQuat.quat2_getPosition(feetPosition);

        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it
        if (height < 0.00001) {
            height = 0;
        }

        forwardForPerceivedAngle.vec3_copy(transformForward);

        forwardForVertical.vec3_copy(collisionCheckParams.myCheckVerticalFixedForward);
        if (!collisionCheckParams.myCheckVerticalFixedForwardEnabled) {
            forwardForVertical.vec3_copy(transformForward);
        } else {
            if (collisionCheckParams.myCheckVerticalFixedForward.vec3_isOnAxis(transformUp)) {
                if (zAxis.vec3_isOnAxis(transformUp)) {
                    forwardForVertical.vec3_copy(xAxis);
                } else {
                    forwardForVertical.vec3_copy(zAxis);
                }
            }

            forwardForVertical = forwardForVertical.vec3_removeComponentAlongAxis(transformUp, forwardForVertical);
            forwardForVertical = forwardForVertical.vec3_normalize(forwardForVertical);

            if (forwardForVertical.vec_equals(collisionCheckParams.myCheckVerticalFixedForward, 0.00001)) {
                forwardForVertical.vec3_copy(collisionCheckParams.myCheckVerticalFixedForward);
            }
        }

        if (collisionCheckParams.myComputeGroundInfoEnabled) {
            this._gatherSurfaceInfo(feetPosition, height, transformUp, forwardForPerceivedAngle, forwardForVertical, true, collisionCheckParams, collisionRuntimeParams);
        }

        if (collisionCheckParams.myComputeCeilingInfoEnabled) {
            this._gatherSurfaceInfo(feetPosition, height, transformUp, forwardForPerceivedAngle, forwardForVertical, false, collisionCheckParams, collisionRuntimeParams);
        }
    };
}();

CollisionCheck.prototype._postSurfaceCheck = function () {
    let horizontalDirection = PP.vec3_create();
    return function _postSurfaceCheck(fixedHorizontalMovement, fixedVerticalMovement, transformUp, collisionCheckParams, collisionRuntimeParams, previousCollisionRuntimeParams) {

        let isVerticalMovementZero = fixedVerticalMovement.vec3_isZero(0.00001);
        let isVerticalMovemenDownward = Math.pp_sign(fixedVerticalMovement.vec3_lengthSigned(transformUp), -1) < 0;

        let mustRemainOnGroundOk = true;
        if (collisionCheckParams.myMustRemainOnGround) {
            if (previousCollisionRuntimeParams.myIsOnGround && !collisionRuntimeParams.myIsOnGround && (isVerticalMovementZero || isVerticalMovemenDownward)) {
                mustRemainOnGroundOk = false;
            }
        }

        let mustRemainOnCeilingOk = true;
        if (collisionCheckParams.myMustRemainOnCeiling) {
            if (previousCollisionRuntimeParams.myIsOnCeiling && !collisionRuntimeParams.myIsOnCeiling && (isVerticalMovementZero || isVerticalMovemenDownward)) {
                mustRemainOnCeilingOk = false;
            }
        }

        let isOnValidGroundAngleUphill = true;
        let isOnValidGroundAngleDownhill = true;
        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle > collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
            if (previousCollisionRuntimeParams.myIsOnGround && !fixedHorizontalMovement.vec3_isZero(0.00001)) {
                horizontalDirection = fixedHorizontalMovement.vec3_normalize(horizontalDirection);
                let perceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myGroundNormal,
                    horizontalDirection, transformUp, true);

                if (perceivedAngle > 0) {
                    isOnValidGroundAngleUphill = false;
                    if (!isOnValidGroundAngleUphill &&
                        collisionCheckParams.myGroundAngleToIgnoreWithPerceivedAngle > 0 &&
                        collisionRuntimeParams.myGroundAngle <= collisionCheckParams.myGroundAngleToIgnoreWithPerceivedAngle + 0.0001) {
                        isOnValidGroundAngleUphill = Math.abs(perceivedAngle) <= collisionCheckParams.myGroundAngleToIgnore + 0.0001;
                    }
                }

                if (previousCollisionRuntimeParams.myGroundAngle <= collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
                    if (collisionCheckParams.myMustRemainOnValidGroundAngleDownhill) {
                        isOnValidGroundAngleDownhill = false;
                    }
                }
            }
        }

        let isOnValidCeilingAngleUphill = true;
        let isOnValidCeilingAngleDownhill = true;
        if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle > collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
            if (previousCollisionRuntimeParams.myIsOnCeiling && !fixedHorizontalMovement.vec3_isZero(0.00001)) {
                horizontalDirection = fixedHorizontalMovement.vec3_normalize(horizontalDirection);
                let perceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingNormal,
                    horizontalDirection, transformUp, false);

                if (perceivedAngle > 0) {
                    isOnValidCeilingAngleUphill = false;
                    if (!isOnValidCeilingAngleUphill &&
                        collisionCheckParams.myCeilingAngleToIgnoreWithPerceivedAngle > 0 &&
                        collisionRuntimeParams.myCeilingAngle <= collisionCheckParams.myCeilingAngleToIgnoreWithPerceivedAngle + 0.0001) {
                        isOnValidCeilingAngleUphill = Math.abs(perceivedAngle) <= collisionCheckParams.myCeilingAngleToIgnore + 0.0001;
                    }
                }

                if (previousCollisionRuntimeParams.myCeilingAngle <= collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                    if (collisionCheckParams.myMustRemainOnValidCeilingAngleDownhill) {
                        isOnValidCeilingAngleDownhill = false;
                    }
                }
            }
        }

        return mustRemainOnGroundOk && mustRemainOnCeilingOk && isOnValidGroundAngleUphill && isOnValidGroundAngleDownhill && isOnValidCeilingAngleUphill && isOnValidCeilingAngleDownhill;
    };
}();

CollisionCheck.prototype._surfaceTooSteep = function () {
    return function _surfaceTooSteep(up, direction, collisionCheckParams, collisionRuntimeParams) {
        let groundTooSteep = false;
        let ceilingTooSteep = false;

        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle > collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
            let groundPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                collisionRuntimeParams.myGroundNormal,
                direction, up, true);

            groundTooSteep = groundPerceivedAngle > 0;
            if (groundTooSteep &&
                collisionCheckParams.myGroundAngleToIgnoreWithPerceivedAngle > 0 &&
                collisionRuntimeParams.myGroundAngle <= collisionCheckParams.myGroundAngleToIgnoreWithPerceivedAngle + 0.0001) {
                groundTooSteep = Math.abs(groundPerceivedAngle) > collisionCheckParams.myGroundAngleToIgnore + 0.0001;
            }
        }

        if (!groundTooSteep) {
            if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle > collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                let ceilingPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingNormal,
                    direction, up, false);

                ceilingTooSteep = ceilingPerceivedAngle > 0;
                if (ceilingTooSteep &&
                    collisionCheckParams.myCeilingAngleToIgnoreWithPerceivedAngle > 0 &&
                    collisionRuntimeParams.myCeilingAngle <= collisionCheckParams.myCeilingAngleToIgnoreWithPerceivedAngle + 0.0001) {
                    ceilingTooSteep = Math.abs(ceilingPerceivedAngle) > collisionCheckParams.myCeilingAngleToIgnore + 0.0001;
                }
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
                    collisionRuntimeParams.myGroundNormal,
                    direction, up, true);

                let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(groundPerceivedAngle)));
                extraVerticalLength *= Math.pp_sign(groundPerceivedAngle);

                if (Math.abs(extraVerticalLength) > 0.00001 && (collisionCheckParams.mySnapOnGroundEnabled || extraVerticalLength > 0)) {
                    outExtraSurfaceVerticalMovement.vec3_add(up.vec3_scale(extraVerticalLength, tempVector), outExtraSurfaceVerticalMovement);
                }
            } else if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle != 0) {
                direction = horizontalMovement.vec3_normalize(direction);
                let ceilingPerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingNormal,
                    direction, up, false);

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
        let isOnSurfaceIfInsideHit = collisionCheckParams.myIsOnGroundIfInsideHit;
        if (!isGround) {
            verticalDirection.vec3_negate(verticalDirection);
            distanceToBeOnSurface = collisionCheckParams.myDistanceToBeOnCeiling;
            distanceToComputeSurfaceInfo = collisionCheckParams.myDistanceToComputeCeilingInfo;
            verticalFixToBeOnSurface = collisionCheckParams.myVerticalFixToBeOnCeiling;
            verticalFixToComputeSurfaceInfo = collisionCheckParams.myVerticalFixToComputeCeilingInfo;
            isOnSurfaceIfInsideHit = collisionCheckParams.myIsOnCeilingIfInsideHit;
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

            let raycastResult = this._raycastAndDebug(origin, direction, distance, !isOnSurfaceIfInsideHit, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.isColliding()) {
                hitFromCurrentPosition = raycastResult.myHits[0].myPosition.vec3_sub(currentPosition, hitFromCurrentPosition);
                let hitFromCurrentPositionLength = hitFromCurrentPosition.vec3_lengthSigned(verticalDirection);
                let allHitsInsideCollision = !raycastResult.isColliding(true);

                if ((hitFromCurrentPositionLength >= 0 && hitFromCurrentPositionLength <= verticalFixToBeOnSurface + 0.00001) ||
                    (hitFromCurrentPositionLength < 0 && Math.abs(hitFromCurrentPositionLength) <= distanceToBeOnSurface + 0.00001)
                    || (allHitsInsideCollision && isOnSurfaceIfInsideHit)) {
                    isOnSurface = true;
                }

                if (!allHitsInsideCollision) {
                    if ((hitFromCurrentPositionLength >= 0 && hitFromCurrentPositionLength <= verticalFixToComputeSurfaceInfo + 0.00001) ||
                        (hitFromCurrentPositionLength < 0 && Math.abs(hitFromCurrentPositionLength) <= distanceToComputeSurfaceInfo + 0.00001)) {
                        let currentSurfaceNormal = raycastResult.myHits[0].myNormal;
                        surfaceNormal.vec3_add(currentSurfaceNormal, surfaceNormal);
                    }
                }
            }
        }

        if (!surfaceNormal.vec3_isZero()) {
            surfaceNormal.vec3_normalize(surfaceNormal);
            surfaceAngle = surfaceNormal.vec3_angle(verticalDirection);

            if (surfaceAngle <= 0.0001) {
                surfaceAngle = 0;
                surfaceNormal.vec3_copy(verticalDirection);
            } else if (surfaceAngle >= 180 - 0.0001) {
                surfaceAngle = 180;
                surfaceNormal = verticalDirection.vec3_negate(surfaceNormal);
            }

            surfacePerceivedAngle = LocomotionUtils.computeSurfacePerceivedAngle(surfaceNormal, forwardForPerceivedAngle, up, isGround);
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
Object.defineProperty(CollisionCheck.prototype, "_updateSurfaceInfo", { enumerable: false });