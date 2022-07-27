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
    }

    fixMovement(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        //return [0, 0, 0];
        let transformUp = transformQuat.quat2_getUp();
        let transformForward = transformQuat.quat2_getForward();
        let feetPosition = transformQuat.quat2_getPosition();
        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it
        if (height < 0.00001) {
            height = 0;
        }

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(transformUp);
        let verticalMovement = movement.vec3_componentAlongAxis(transformUp);
        //feetPosition = feetPosition.vec3_add(horizontalMovement.vec3_normalize().vec3_scale(0.5));
        //height = height / 2;
        //horizontalMovement.vec3_normalize(horizontalMovement).vec3_scale(0.3, horizontalMovement); movement = horizontalMovement.vec3_add(verticalMovement);

        let movementStepAmount = 1;
        let movementStep = movement.pp_clone();

        if (collisionCheckParams.mySplitMovementEnabled) {
            movementStepAmount = Math.max(1, Math.ceil(movement.vec3_length() / collisionCheckParams.mySplitMovementMaxLength));
            movement.vec3_scale(1 / movementStepAmount, movementStep);
        }

        let fixedMovement = [0, 0, 0];

        for (let i = 0; i < movementStepAmount; i++) {
            let newFeetPosition = feetPosition.vec3_add(fixedMovement);
            let fixedMovementStep = this._fixMovement(movementStep, newFeetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams);
            fixedMovement.vec3_add(fixedMovementStep, fixedMovement);
        }

        //fixedMovement.vec3_zero();

        collisionRuntimeParams.myOriginalPosition.vec3_copy(feetPosition);
        collisionRuntimeParams.myOriginalHeight = height;

        collisionRuntimeParams.myOriginalForward.vec3_copy(transformForward);
        collisionRuntimeParams.myOriginalUp.vec3_copy(transformUp);

        collisionRuntimeParams.myOriginalMovement.vec3_copy(movement);
        collisionRuntimeParams.myFixedMovement.vec3_copy(fixedMovement);

        return fixedMovement;
    }

    _fixMovement(movement, feetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams) {
        // #TODO refactor and split horizontal check and vertical check into: hMovement + vMovement + hPosition + vPosition?
        // Will make the sliding heavier, if I slide repeating all the 4 steps instead of 2 as now, but would be more correct

        //_myTotalRaycasts = 0;

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(transformUp);
        if (horizontalMovement.vec3_length() < 0.000001) {
            horizontalMovement.vec3_zero();
        }
        let verticalMovement = movement.vec3_componentAlongAxis(transformUp);
        if (verticalMovement.vec3_length() < 0.000001) {
            verticalMovement.vec3_zero();
        }

        if (horizontalMovement.vec3_isZero()) {
            //return [0, 0, 0];
        }

        //collisionCheckParams.myDebugActive = true;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        let fixedHorizontalMovement = [0, 0, 0];

        if (!horizontalMovement.vec3_isZero()) {
            let surfaceTooSteep = this._surfaceTooSteep(transformUp, horizontalMovement.vec3_normalize(), collisionCheckParams, this._myPrevCollisionRuntimeParams);

            if (!surfaceTooSteep) {
                fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams, false, fixedHorizontalMovement);
                //console.error(_myTotalRaycasts );
                //collisionRuntimeParams.myIsCollidingHorizontally = true;
                //collisionRuntimeParams.myHorizontalCollisionHit.myNormal = [0, 0, 1];
                if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingHorizontally) {
                    fixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams, fixedHorizontalMovement);
                }
            }
        }

        let forwardForVertical = [0, 0, 1];

        if (!collisionCheckParams.myCheckVerticalForwardFixed) {
            if (fixedHorizontalMovement.vec3_length() < 0.000001) {
                if (!horizontalMovement.vec3_isZero()) {
                    horizontalMovement.vec3_normalize(forwardForVertical);
                } else {
                    forwardForVertical.vec3_copy(transformForward);
                }
                fixedHorizontalMovement.vec3_zero();
            } else {
                fixedHorizontalMovement.vec3_normalize(forwardForVertical);
            }
        }

        if (!horizontalMovement.vec3_isZero() && fixedHorizontalMovement.vec3_isZero()) {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
        }

        let newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement);

        // collisionCheckParams.myDebugActive = false;
        let surfaceAdjustedVerticalMovement = verticalMovement.pp_clone();
        if (collisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle) {
            let extraSurfaceVerticalMovement = this._computeExtraSurfaceVerticalMovement(fixedHorizontalMovement, transformUp, collisionCheckParams, this._myPrevCollisionRuntimeParams);
            surfaceAdjustedVerticalMovement.vec3_add(extraSurfaceVerticalMovement, surfaceAdjustedVerticalMovement);
        }

        //console.error(_myTotalRaycasts );
        let originalMovementSign = Math.pp_sign(verticalMovement.vec3_lengthSigned(transformUp), 0);
        let fixedVerticalMovement = this._verticalCheck(surfaceAdjustedVerticalMovement, originalMovementSign, newFeetPosition, height, transformUp, forwardForVertical, collisionCheckParams, collisionRuntimeParams);

        //console.error(_myTotalRaycasts );
        let fixedMovement = [0, 0, 0];
        if (!collisionRuntimeParams.myIsCollidingVertically) {
            fixedHorizontalMovement.vec3_add(fixedVerticalMovement, fixedMovement);
        } else {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
            collisionRuntimeParams.myVerticalMovementCancelled = true;

            collisionRuntimeParams.myIsSliding = false;

            collisionRuntimeParams.myHasSnappedOnGround = false;
            collisionRuntimeParams.myHasSnappedOnCeiling = false;
            collisionRuntimeParams.myHasFixedPositionGround = false;
            collisionRuntimeParams.myHasFixedPositionCeiling = false;
        }

        feetPosition.vec3_add(fixedMovement, newFeetPosition);

        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, true, collisionCheckParams, collisionRuntimeParams);
        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, false, collisionCheckParams, collisionRuntimeParams);

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugMovementActive) {
            this._debugMovement(movement, fixedMovement, newFeetPosition, transformUp, collisionCheckParams);
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }

        //console.error(_myTotalRaycasts );

        _myTotalRaycastsMax = Math.max(_myTotalRaycasts, _myTotalRaycastsMax);
        //console.error(_myTotalRaycastsMax);

        //return fixedMovement.vec3_zero();
        return fixedMovement;
    }

    _surfaceTooSteep(up, direction, collisionCheckParams, collisionRuntimeParams) {
        let groundTooSteep = false;
        let ceilingTooSteep = false;

        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle > collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
            let groundPerceivedAngle = this._computeSurfacePerceivedAngle(
                collisionRuntimeParams.myGroundAngle,
                collisionRuntimeParams.myGroundNormal,
                up, direction, true);

            groundTooSteep = groundPerceivedAngle >= 0;
        }

        if (!groundTooSteep) {
            if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle > collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                let ceilingPerceivedAngle = this._computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingAngle,
                    collisionRuntimeParams.myCeilingNormal,
                    up, direction, false);

                ceilingTooSteep = ceilingPerceivedAngle >= 0;
            }
        }

        return groundTooSteep || ceilingTooSteep;
    }

    _computeExtraSurfaceVerticalMovement(horizontalMovement, up, collisionCheckParams, collisionRuntimeParams) {
        let extraSurfaceVerticalMovement = [0, 0, 0];

        if (!horizontalMovement.vec3_isZero()) {
            if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle != 0) {
                let direction = horizontalMovement.vec3_normalize();
                let groundPerceivedAngle = this._computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myGroundAngle,
                    collisionRuntimeParams.myGroundNormal,
                    up, direction, true);

                let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(groundPerceivedAngle)));
                extraVerticalLength *= Math.pp_sign(groundPerceivedAngle);

                if (Math.abs(extraVerticalLength) > 0.00001 && (collisionCheckParams.mySnapOnGroundEnabled || extraVerticalLength > 0)) {
                    extraSurfaceVerticalMovement.vec3_add(up.vec3_scale(extraVerticalLength), extraSurfaceVerticalMovement);
                }
            } else if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle != 0) {
                let direction = horizontalMovement.vec3_normalize();
                let ceilingPerceivedAngle = this._computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingAngle,
                    collisionRuntimeParams.myCeilingNormal,
                    up, direction, false);

                let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(ceilingPerceivedAngle)));
                extraVerticalLength *= Math.pp_sign(ceilingPerceivedAngle);
                extraVerticalLength *= -1;

                if (Math.abs(extraVerticalLength) > 0.00001 && (collisionCheckParams.mySnapOnCeilingEnabled || extraVerticalLength < 0)) {
                    extraSurfaceVerticalMovement.vec3_add(up.vec3_scale(extraVerticalLength), extraSurfaceVerticalMovement);
                }
            }
        }

        return extraSurfaceVerticalMovement;
    }

    _gatherSurfaceInfo(feetPosition, height, up, forward, isGround, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSurfaceInfoActive;

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        let verticalDirection = up.pp_clone();
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

        let startOffset = verticalDirection.vec3_scale(Math.max(verticalFixToBeOnSurface, verticalFixToComputeSurfaceInfo, 0.00001));
        let endOffset = verticalDirection.vec3_negate().vec3_scale(Math.max(distanceToBeOnSurface, distanceToComputeSurfaceInfo, 0.00001));

        let heightOffset = [0, 0, 0];
        if (!isGround) {
            heightOffset = up.vec3_scale(height);
        }

        let isOnSurface = false;
        let surfaceAngle = 0;
        let surfacePerceivedAngle = 0;
        let surfaceNormal = [0, 0, 0];

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            currentPosition.vec3_add(heightOffset, currentPosition);
            let startPosition = currentPosition.vec3_add(startOffset);
            let endPosition = currentPosition.vec3_add(endOffset);

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.myHits.length > 0) {
                let hitFromCurrentPosition = raycastResult.myHits[0].myPosition.vec3_sub(currentPosition);
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
                surfaceNormal.vec3_copy(verticalDirection.vec3_negate());
            }

            surfacePerceivedAngle = this._computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forward, isGround);
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
    }

    _computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forward, isGround) {
        let surfacePerceivedAngle = surfaceAngle;

        if (surfaceAngle > 0.0001 && surfaceAngle < 180 - 0.0001) {
            let forwardOnSurface = forward.vec3_projectOnPlaneAlongAxis(surfaceNormal, up);
            surfacePerceivedAngle = forwardOnSurface.vec3_angle(forward);
            if (Math.abs(surfacePerceivedAngle) < 0.0001) {
                surfacePerceivedAngle = 0;
            } else {
                let isFurtherOnUp = forwardOnSurface.vec3_isFurtherAlongDirection(forward, up);
                if ((!isFurtherOnUp && isGround) || (isFurtherOnUp && !isGround)) {
                    surfacePerceivedAngle *= -1;
                }
            }
        }

        return surfacePerceivedAngle;
    }

    _verticalCheck(verticalMovement, originalMovementSign, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        collisionRuntimeParams.myIsCollidingVertically = false;
        collisionRuntimeParams.myVerticalCollisionHit.reset();

        let movementSign = Math.pp_sign(verticalMovement.vec3_lengthSigned(up), -1);
        let isMovementDownward = movementSign < 0;
        let fixedMovement = this._verticalMovementFix(verticalMovement, isMovementDownward, originalMovementSign, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);

        if (fixedMovement.vec_equals(verticalMovement, 0.00001) || originalMovementSign == 0 || (movementSign != originalMovementSign)) {
            let newFeetPosition = feetPosition.vec3_add(fixedMovement);
            let isOppositeMovementDownward = !isMovementDownward;
            let additionalMovement = this._verticalMovementFix([0, 0, 0], isOppositeMovementDownward, originalMovementSign, newFeetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);

            fixedMovement.vec3_add(additionalMovement, fixedMovement);
            isMovementDownward = !isMovementDownward;
        }

        let newFeetPosition = feetPosition.vec3_add(fixedMovement);
        let canStay = this._verticalPositionCheck(newFeetPosition, isMovementDownward, height, up, forward, collisionCheckParams, collisionRuntimeParams);
        if (!canStay) {
            fixedMovement = null;

            collisionRuntimeParams.myHasSnappedOnGround = false;
            collisionRuntimeParams.myHasSnappedOnCeiling = false;
            collisionRuntimeParams.myHasFixedPositionGround = false;
            collisionRuntimeParams.myHasFixedPositionCeiling = false;
        }

        return fixedMovement;
    }

    _verticalMovementFix(verticalMovement, isMovementDownward, originalMovementSign, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugVerticalMovementActive;

        let fixedMovement = null;

        let startOffset = [0, 0, 0];
        let endOffset = [0, 0, 0];

        let fixPositionEnabled = false;
        let snapEnabled = false;

        if (isMovementDownward) {
            startOffset = [0, 0, 0];
            endOffset = verticalMovement.pp_clone();

            if (collisionCheckParams.myGroundFixDistanceFromFeet > 0) {
                startOffset.vec3_add(up.vec3_scale(collisionCheckParams.myGroundFixDistanceFromFeet + 0.00001), startOffset);
                fixPositionEnabled = true;
            }
        } else {
            startOffset = up.vec3_scale(height);
            endOffset = up.vec3_scale(height).vec3_add(verticalMovement);

            if (collisionCheckParams.myGroundFixDistanceFromHead > 0) {
                startOffset.vec3_add(up.vec3_scale(-collisionCheckParams.myGroundFixDistanceFromHead - 0.00001), startOffset);
                fixPositionEnabled = true;
            }
        }

        if (isMovementDownward && originalMovementSign <= 0 && this._myPrevCollisionRuntimeParams.myIsOnGround && collisionCheckParams.mySnapOnGroundEnabled && collisionCheckParams.mySnapOnGroundExtraDistance > 0) {
            endOffset.vec3_add(up.vec3_scale(-collisionCheckParams.mySnapOnGroundExtraDistance - 0.00001), endOffset);
            snapEnabled = true;
        } else if (!isMovementDownward && this._myPrevCollisionRuntimeParams.myIsOnCeiling && collisionCheckParams.mySnapOnCeilingEnabled && collisionCheckParams.mySnapOnCeilingExtraDistance > 0 &&
            (originalMovementSign > 0 || (originalMovementSign == 0 && (!this._myPrevCollisionRuntimeParams.myIsOnGround || !collisionCheckParams.mySnapOnGroundEnabled)))) {
            endOffset.vec3_add(up.vec3_scale(collisionCheckParams.mySnapOnCeilingExtraDistance + 0.00001), endOffset);
            snapEnabled = true;
        }

        if (startOffset.vec3_distance(endOffset) > 0.00001) {
            let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

            let furtherDirection = up;
            if (!isMovementDownward) {
                furtherDirection = furtherDirection.vec3_negate();
            }

            let furtherDirectionPosition = null;

            for (let i = 0; i < checkPositions.length; i++) {
                let currentPosition = checkPositions[i];

                let origin = currentPosition.vec3_add(startOffset);
                let direction = currentPosition.vec3_add(endOffset).vec3_sub(origin);
                let distance = direction.vec3_length();
                direction.vec3_normalize(direction);

                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                if (raycastResult.myHits.length > 0) {
                    if (furtherDirectionPosition != null) {
                        if (raycastResult.myHits[0].myPosition.vec3_isFurtherAlongDirection(furtherDirectionPosition, furtherDirection)) {
                            furtherDirectionPosition.vec3_copy(raycastResult.myHits[0].myPosition);
                        }
                    } else {
                        furtherDirectionPosition = raycastResult.myHits[0].myPosition.pp_clone();
                    }
                }
            }

            if (furtherDirectionPosition != null) {
                if (isMovementDownward) {
                    fixedMovement = furtherDirectionPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);

                    if (snapEnabled && fixedMovement.vec3_isFurtherAlongDirection(verticalMovement, up.vec3_negate())) {
                        collisionRuntimeParams.myHasSnappedOnGround = true;
                    } else if (fixPositionEnabled && fixedMovement.vec3_isFurtherAlongDirection(verticalMovement, up)) {
                        collisionRuntimeParams.myHasFixedPositionGround = true;
                    }
                } else {
                    fixedMovement = furtherDirectionPosition.vec3_sub(feetPosition.vec3_add(up.vec3_scale(height))).vec3_componentAlongAxis(up);

                    if (snapEnabled && fixedMovement.vec3_isFurtherAlongDirection(verticalMovement, up)) {
                        collisionRuntimeParams.myHasSnappedOnCeiling = true;
                    } else if (fixPositionEnabled && fixedMovement.vec3_isFurtherAlongDirection(verticalMovement, up.vec3_negate())) {
                        collisionRuntimeParams.myHasFixedPositionCeiling = true;
                    }
                }
            } else {
                fixedMovement = verticalMovement.pp_clone();
            }
        } else {
            fixedMovement = verticalMovement.pp_clone();
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _verticalPositionCheck(feetPosition, checkUpward, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugVerticalPositionActive;

        if (height < 0.00001) {
            return true;
        }

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        let isVerticalPositionOk = true;
        let atLeastOneIsOk = false;

        let adjustmentEpsilon = 0.00001;
        let smallHeightFixOffset = up.vec3_scale(adjustmentEpsilon);
        let heightOffset = up.vec3_scale(height - adjustmentEpsilon);
        if (height - adjustmentEpsilon < adjustmentEpsilon) {
            heightOffset = up.vec3_scale(adjustmentEpsilon * 2);
        }

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let startPosition = null;
            let endPosition = null;

            if (checkUpward) {
                startPosition = currentPosition.vec3_add(smallHeightFixOffset);
                endPosition = currentPosition.vec3_add(heightOffset);
            } else {
                startPosition = currentPosition.vec3_add(heightOffset);
                endPosition = currentPosition.vec3_add(smallHeightFixOffset);
            }

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, false, collisionCheckParams, collisionRuntimeParams);

            let hitsOutsideCollision = raycastResult.getHitsOutsideCollision();
            if (hitsOutsideCollision.length > 0) {
                isVerticalPositionOk = false;
                collisionRuntimeParams.myVerticalCollisionHit.copy(hitsOutsideCollision[0]);
                break;
            } else if (raycastResult.myHits.length == 0) {
                atLeastOneIsOk = true;
            } else if (!collisionRuntimeParams.myVerticalCollisionHit.isValid()) {
                collisionRuntimeParams.myVerticalCollisionHit.copy(raycastResult.myHits[0]);
            }
        }

        collisionRuntimeParams.myIsCollidingVertically = !isVerticalPositionOk || !atLeastOneIsOk;

        return !collisionRuntimeParams.myIsCollidingVertically;
    }

    _getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let checkPositions = [];
        checkPositions.push(feetPosition);

        let radiusStep = collisionCheckParams.myFeetRadius / collisionCheckParams.myGroundCircumferenceStepAmount;
        let sliceAngle = 360 / collisionCheckParams.myGroundCircumferenceSliceAmount;
        let currentStepRotation = 0;
        for (let i = 0; i < collisionCheckParams.myGroundCircumferenceStepAmount; i++) {
            let currentRadius = radiusStep * (i + 1);

            let currentDirection = forward.vec3_rotateAxis(currentStepRotation, up);
            for (let j = 0; j < collisionCheckParams.myGroundCircumferenceSliceAmount; j++) {
                let sliceDirection = currentDirection.vec3_rotateAxis(sliceAngle * j, up);
                checkPositions.push(feetPosition.vec3_add(sliceDirection.vec3_scale(currentRadius)));
            }

            currentStepRotation += collisionCheckParams.myGroundCircumferenceRotationPerStep;
        }

        return checkPositions;
    }

    _raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
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

CollisionCheck.prototype.test = function () {
    let basePosition = PP.vec3_create();
    return function (objectsToIgnore, outIgnoredObjects, isGround, up, collisionCheckParams, hit, ignoreHitsInsideCollisionIfObjectToIgnore) {
    };
}();
Object.defineProperty(CollisionCheck.prototype, "test", { enumerable: false });

