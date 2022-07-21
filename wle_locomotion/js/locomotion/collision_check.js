CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.3;
        this.myDistanceFromFeetToIgnore = 0.3; // could be percentage of the height
        this.myDistanceFromHeadToIgnore = 0.1;

        this.myHorizontalMovementStepAmount = 1;
        this.myHorizontalMovementRadialStepAmount = 1;
        this.myHorizontalMovementCheckDiagonal = true;
        this.myHorizontalMovementCheckStraight = false;
        this.myHorizontalMovementCheckHorizontalBorder = false;
        this.myHorizontalMovementCheckVerticalStraight = false;
        this.myHorizontalMovementCheckVerticalDiagonal = true;
        this.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;

        this.myHalfConeAngle = 60;
        this.myHalfConeSliceAmount = 2;
        this.myCheckConeBorder = true;
        this.myCheckConeRay = true;

        this.myFeetRadius = 0.1;
        this.mySnapOnGroundExtraDistance = 0.3;
        this.myGroundCircumferenceSliceAmount = 8;
        this.myGroundCircumferenceStepAmount = 2;
        this.myGroundCircumferenceRotationPerStep = 22.5;
        this.myGroundFixDistanceFromFeet = 0.3;
        this.myGroundFixDistanceFromHead = 0.1;

        this.myCheckHeight = true;
        this.myHeightCheckStepAmount = 1;
        this.myCheckVerticalStraight = true;
        this.myCheckVerticalDiagonalRay = false;
        this.myCheckVerticalDiagonalBorder = false;
        this.myCheckVerticalDiagonalBorderRay = false;

        this.myGroundAngleToIgnore = 30;
        this.myCeilingAngleToIgnore = 30;

        this.myHeight = 1;

        this.myDistanceToBeOnGround = 0.001;
        this.myDistanceToComputeGroundInfo = 0.1;
        this.myDistanceToBeOnCeiling = 0.001;
        this.myDistanceToComputeCeilingInfo = 0.1;

        this.mySlidingEnabled = true;
        this.mySlidingHorizontalMovementCheckBetterNormal = true;
        this.mySlidingMaxAttempts = 4;
        this.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        // checking both directions let you find the better direction to slide to and can also make you slide when otherwise you would have got stuck

        this.mySlidingFlickeringPreventionType = 0;      // expensive, 2 times the check for the whole horizontal movement!
        // 0: no prevention
        // 1: use previous frame data to understand if the sliding could flicker, this avoid stopping the movement when the flicker would just last some frames, 
        //    but also allows a bit of flicker that stabilize after 2-3 frames
        // 2: check when sliding collision angle is more then 90 degrees, prevents most flicker apart those on almost flat surfaces
        // 3: check 2 + check when sliding movement angle is more then 85 degrees, prevents almost all flicker, even on almost flat surfaces
        // 4: check every time
        //
        // from 3 and above you could have that the flicker prevents the movement when u expect it, because it's a more aggressive prevention
        // in case a fluid movement is more important than a bit of flicker from time to time, 1 is a better choice (which is also less expensive than 3 and above)
        // 2 is just a less expensive version of 3 (check less times) but also less precise, allowing more flickering

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myObjectsToIgnore = [];

        this.myDebugActive = false;

        this.myDebugHorizontalMovementActive = true;
        this.myDebugHorizontalPositionActive = true;
        this.myDebugVerticalMovementActive = true;
        this.myDebugVerticalPositionActive = true;
        this.myDebugSlidingActive = true;
        this.myDebugSurfaceInfoActive = true;
        this.myDebugRuntimeParamsActive = true;
        this.myDebugMovementActive = true;
    }
};

CollisionRuntimeParams = class CollisionRuntimeParams {
    constructor() {
        this.myMovement = PP.vec3_create();

        this.myIsOnGround = false;
        this.myGroundAngle = 0;
        this.myGroundPerceivedAngle = 0;
        this.myGroundNormal = [0, 0, 0];

        this.myIsOnCeiling = false;
        this.myCeilingAngle = 0;
        this.myCeilingPerceivedAngle = 0;
        this.myCeilingNormal = [0, 0, 0];

        this.myHorizontalMovementCancelled = false; // could add HorizontalMovementCancelledReason
        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit = new PP.RaycastResultHit();

        this.myVerticalMovementCancelled = false;
        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit = new PP.RaycastResultHit();

        this.myIsSliding = false;
        this.myIsSlidingIntoOppositeDirection = false;
        this.myIsSlidingFlickerPrevented = false;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit = new PP.RaycastResultHit();
    }

    reset() {
        this.myMovement.vec3_zero();

        this.myIsOnGround = false;
        this.myGroundAngle = 0;
        this.myGroundPerceivedAngle = 0;
        this.myGroundNormal.vec3_zero();

        this.myIsOnCeiling = false;
        this.myCeilingAngle = 0;
        this.myCeilingPerceivedAngle = 0;
        this.myCeilingNormal.vec3_zero();

        this.myHorizontalMovementCancelled = false;
        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit.reset();

        this.myVerticalMovementCancelled = false;
        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit.reset();

        this.myIsSliding = false;
        this.myIsSlidingIntoOppositeDirection = false;
        this.myIsSlidingFlickerPrevented = false;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit.reset();
    }

    copy(other) {
        this.myMovement.pp_copy(other.myMovement);

        this.myIsOnGround = other.myIsOnGround;
        this.myGroundAngle = other.myGroundAngle;
        this.myGroundPerceivedAngle = other.myGroundPerceivedAngle;
        this.myGroundNormal.pp_copy(other.myGroundNormal);

        this.myIsOnCeiling = other.myIsOnCeiling;
        this.myCeilingAngle = other.myCeilingAngle;
        this.myCeilingPerceivedAngle = other.myCeilingPerceivedAngle;
        this.myCeilingNormal.pp_copy(other.myCeilingNormal);

        this.myHorizontalMovementCancelled = other.myHorizontalMovementCancelled;
        this.myIsCollidingHorizontally = other.myIsCollidingHorizontally;
        this.myHorizontalCollisionHit.copy(other.myHorizontalCollisionHit);

        this.myVerticalMovementCancelled = other.myVerticalMovementCancelled;
        this.myIsCollidingVertically = other.myIsCollidingVertically;
        this.myVerticalCollisionHit.copy(other.myVerticalCollisionHit);

        this.myIsSliding = other.myIsSliding;
        this.myIsSlidingIntoOppositeDirection = other.myIsSlidingIntoOppositeDirection;
        this.myIsSlidingFlickerPrevented = other.myIsSlidingFlickerPrevented;
        this.mySlidingMovementAngle = other.mySlidingMovementAngle;
        this.mySlidingCollisionAngle = other.mySlidingCollisionAngle;
        this.mySlidingCollisionHit.copy(other.mySlidingCollisionHit);
    }
};

CollisionCheck = class CollisionCheck {
    constructor() {
        this._myRaycastSetup = new PP.RaycastSetup();
        this._myRaycastResult = new PP.RaycastResult();
        this._myFixRaycastResult = new PP.RaycastResult();

        this._myBackupRaycastHit = new PP.RaycastResultHit();

        this._myPrevCollisionRuntimeParams = new CollisionRuntimeParams();

        this._mySlidingCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingFlickeringFixCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingOppositeDirectionCollisionRuntimeParams = new CollisionRuntimeParams();
        this._mySlidingOnVerticalCheckCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myDebugActive = false;
    }

    fixMovement(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        let transformUp = transformQuat.quat2_getUp();
        let transformForward = transformQuat.quat2_getForward();
        let feetPosition = transformQuat.quat2_getPosition();
        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it

        // if height is negative swap feet with head position

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(transformUp);
        if (horizontalMovement.vec3_length() < 0.000001) {
            horizontalMovement.vec3_zero();
        }
        let verticalMovement = movement.vec3_componentAlongAxis(transformUp);
        if (verticalMovement.vec3_length() < 0.000001) {
            verticalMovement.vec3_zero();
        }

        //feetPosition = feetPosition.vec3_add(horizontalMovement.vec3_normalize().vec3_scale(0.5));
        //height = height / 2;
        //horizontalMovement.vec3_normalize(horizontalMovement).vec3_scale(0.3, horizontalMovement);

        //collisionCheckParams.myDebugActive = true;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        let fixedHorizontalMovement = [0, 0, 0];

        if (!horizontalMovement.vec3_isZero()) {
            let surfaceTooSteep = this._surfaceTooSteep(transformUp, horizontalMovement.vec3_normalize(), collisionCheckParams, this._myPrevCollisionRuntimeParams);

            if (!surfaceTooSteep) {
                fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams);
                if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingHorizontally) {
                    fixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams);
                }
            }
        }

        let forward = [0, 0, 0];
        if (fixedHorizontalMovement.vec3_length() < 0.000001) {
            if (!horizontalMovement.vec3_isZero()) {
                horizontalMovement.vec3_normalize(forward);
            } else {
                forward.vec3_copy(transformForward);
            }
            fixedHorizontalMovement.vec3_zero();
        } else {
            fixedHorizontalMovement.vec3_normalize(forward);
        }

        if (!horizontalMovement.vec3_isZero() && fixedHorizontalMovement.vec3_isZero()) {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
        }

        let newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement);

        // collisionCheckParams.myDebugActive = false;

        let extraSurfaceVerticalMovement = this._computeExtraSurfaceVerticalMovement(fixedHorizontalMovement, transformUp, this._myPrevCollisionRuntimeParams);
        let surfaceAdjustedVerticalMovement = verticalMovement.vec3_add(extraSurfaceVerticalMovement);
        let fixedVerticalMovement = this._verticalCheck(surfaceAdjustedVerticalMovement, newFeetPosition, height, transformUp, forward, collisionCheckParams, collisionRuntimeParams);

        let fixedMovement = [0, 0, 0];
        if (!collisionRuntimeParams.myIsCollidingVertically) {
            fixedHorizontalMovement.vec3_add(fixedVerticalMovement, fixedMovement);
        } else {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
            collisionRuntimeParams.myVerticalMovementCancelled = true;
        }

        feetPosition.vec3_add(fixedMovement, newFeetPosition);

        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forward, true, collisionCheckParams, collisionRuntimeParams);
        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forward, false, collisionCheckParams, collisionRuntimeParams);

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugMovementActive) {
            this._debugMovement(movement, fixedMovement, newFeetPosition, transformUp, collisionCheckParams);
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }

        //fixedMovement.vec3_zero();

        collisionRuntimeParams.myMovement.vec3_copy(fixedMovement);

        return fixedMovement;
    }

    _surfaceTooSteep(up, direction, collisionCheckParams, collisionRuntimeParams) {
        let groundTooSteep = false;
        let ceilingTooSteep = false;

        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle > collisionCheckParams.myGroundAngleToIgnore + 0.0001) {
            let groundPerceivedAngle = this._computeSurfacePerceivedAngle(
                collisionRuntimeParams.myGroundAngle,
                collisionRuntimeParams.myGroundNormal,
                up, direction);

            groundTooSteep = groundPerceivedAngle >= 0;
        }

        if (!groundTooSteep) {
            if (collisionRuntimeParams.myIsOnCeiling && collisionRuntimeParams.myCeilingAngle > collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                let ceilingPerceivedAngle = this._computeSurfacePerceivedAngle(
                    collisionRuntimeParams.myCeilingAngle,
                    collisionRuntimeParams.myCeilingNormal,
                    up, direction);

                ceilingTooSteep = ceilingPerceivedAngle >= 0;
            }
        }

        return groundTooSteep || ceilingTooSteep;
    }

    _computeExtraSurfaceVerticalMovement(horizontalMovement, up, collisionRuntimeParams) {
        let extraSurfaceVerticalMovement = [0, 0, 0];

        if (collisionRuntimeParams.myIsOnGround && collisionRuntimeParams.myGroundAngle != 0 && !horizontalMovement.vec3_isZero()) {
            let direction = horizontalMovement.vec3_normalize();
            let groundPerceivedAngle = this._computeSurfacePerceivedAngle(
                collisionRuntimeParams.myGroundAngle,
                collisionRuntimeParams.myGroundNormal,
                up, direction);

            let extraVerticalLength = horizontalMovement.vec3_length() * Math.tan(Math.pp_toRadians(Math.abs(groundPerceivedAngle)));
            extraVerticalLength *= Math.pp_sign(groundPerceivedAngle);

            if (Math.abs(extraVerticalLength) > 0.00001) {
                up.vec3_scale(extraVerticalLength, extraSurfaceVerticalMovement);
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
        if (!isGround) {
            verticalDirection.vec3_negate(verticalDirection);
            distanceToBeOnSurface = collisionCheckParams.myDistanceToBeOnCeiling;
            distanceToComputeSurfaceInfo = collisionCheckParams.myDistanceToComputeCeilingInfo;
        }

        let startOffset = verticalDirection.vec3_scale(0.0001);
        let endOffset = verticalDirection.vec3_negate().vec3_scale(Math.max(distanceToBeOnSurface, distanceToComputeSurfaceInfo));
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
                if (raycastResult.myHits[0].myDistance <= distanceToBeOnSurface + 0.00001) {
                    isOnSurface = true;
                }

                if (raycastResult.myHits[0].myDistance <= distanceToComputeSurfaceInfo + 0.00001) {
                    let currentSurfaceNormal = raycastResult.myHits[0].myNormal;
                    surfaceNormal.vec3_add(currentSurfaceNormal, surfaceNormal);
                }
            }
        }

        if (!surfaceNormal.vec3_isZero()) {
            surfaceNormal.vec3_normalize(surfaceNormal);
            surfaceAngle = surfaceNormal.vec3_angle(verticalDirection);

            if (surfaceAngle < 0.00001) {
                surfaceAngle = 0;
                surfaceNormal.vec3_copy(verticalDirection);
            } else if (surfaceAngle > 180 - 0.00001) {
                surfaceAngle = 180;
                surfaceNormal.vec3_copy(verticalDirection.vec3_negate());
            }

            surfacePerceivedAngle = this._computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forward);
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

    _computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forward) {
        let surfacePerceivedAngle = surfaceAngle;

        if (surfaceAngle > 0.00001 && surfaceAngle < 180 - 0.00001) {
            let flatSurfaceNormal = surfaceNormal.vec3_removeComponentAlongAxis(up);
            flatSurfaceNormal.vec3_normalize(flatSurfaceNormal);

            if (!flatSurfaceNormal.vec3_isZero(0.00001)) {
                let surfaceForwardAngle = forward.vec3_angle(flatSurfaceNormal);
                let perceivedAngleFactor = Math.pp_mapToRange(surfaceForwardAngle, 0.00001, 180 - 0.00001, -1, 1);
                surfacePerceivedAngle = surfaceAngle * perceivedAngleFactor;
                if (Math.abs(surfacePerceivedAngle) < 0.0001) {
                    surfacePerceivedAngle = 0;
                }
            }
        }

        return surfacePerceivedAngle;
    }

    _horizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        if (collisionCheckParams.mySlidingCheckBothDirections) {
            this._mySlidingOppositeDirectionCollisionRuntimeParams.copy(collisionRuntimeParams);
        }

        let previousHorizontalMovement = this._myPrevCollisionRuntimeParams.myMovement.vec3_removeComponentAlongAxis(up);

        let hitNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.pp_clone();

        let slideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams);

        if (collisionCheckParams.mySlidingCheckBothDirections) {
            let oppositeSlideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, this._mySlidingOppositeDirectionCollisionRuntimeParams, true);

            if (this._mySlidingOppositeDirectionCollisionRuntimeParams.myIsSliding) {

                let isOppositeBetter = false;
                if (collisionRuntimeParams.myIsSliding) {
                    if (Math.abs(movement.vec3_angle(oppositeSlideMovement) - movement.vec3_angle(slideMovement)) < 0.00001) {
                        if (previousHorizontalMovement.vec3_angle(oppositeSlideMovement) < previousHorizontalMovement.vec3_angle(slideMovement) - 0.00001) {
                            isOppositeBetter = true;
                        }
                    } else if (movement.vec3_angle(oppositeSlideMovement) < movement.vec3_angle(slideMovement)) {
                        isOppositeBetter = true;
                    }
                } else {
                    isOppositeBetter = true;
                }

                if (isOppositeBetter) {
                    /* {
                        let debugParams = new PP.DebugArrowParams();
                        debugParams.myStart = feetPosition;
                        debugParams.myDirection = slideMovement.vec3_normalize();
                        debugParams.myLength = 0.2;
                        debugParams.myColor = [0, 0, 1, 1];
                        PP.myDebugManager.draw(debugParams, 1);
                    }

                    {
                        let debugParams = new PP.DebugArrowParams();
                        debugParams.myStart = feetPosition;
                        debugParams.myDirection = oppositeSlideMovement.vec3_normalize();
                        debugParams.myLength = 0.2;
                        debugParams.myColor = [1, 0, 1, 1];
                        PP.myDebugManager.draw(debugParams, 1);
                    }

                    {
                        let debugParams = new PP.DebugArrowParams();
                        debugParams.myStart = feetPosition;
                        debugParams.myDirection = hitNormal.vec3_normalize();
                        debugParams.myLength = 0.2;
                        debugParams.myColor = [1, 1, 1, 1];
                        PP.myDebugManager.draw(debugParams, 1);
                    } */

                    slideMovement.vec3_copy(oppositeSlideMovement);
                    collisionRuntimeParams.copy(this._mySlidingOppositeDirectionCollisionRuntimeParams);
                }
            }
        }

        if (collisionRuntimeParams.myIsSliding && collisionCheckParams.mySlidingFlickeringPreventionType > 0) {
            let shouldCheckFlicker = false;

            shouldCheckFlicker |= this._myPrevCollisionRuntimeParams.myIsSlidingFlickerPrevented;

            let flickerCollisionAngle = 90;
            let flickerMovementAngle = 85;
            switch (collisionCheckParams.mySlidingFlickeringPreventionType) {
                case 1:
                    shouldCheckFlicker |= previousHorizontalMovement.vec3_isZero(0.00001);
                    shouldCheckFlicker |=
                        this._myPrevCollisionRuntimeParams.myIsSliding &&
                        previousHorizontalMovement.vec3_signTo(movement, up, 0) != slideMovement.vec3_signTo(movement, up, 0);
                    break;
                case 2:
                    shouldCheckFlicker |= collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                    shouldCheckFlicker |= Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;
                    break;
                case 3:
                    shouldCheckFlicker |= collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                    shouldCheckFlicker |= Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;

                    shouldCheckFlicker |=
                        Math.abs(Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) - flickerCollisionAngle) < 0.00001 &&
                        Math.abs(collisionRuntimeParams.mySlidingMovementAngle) > flickerMovementAngle + 0.00001;
                    break;
                case 4:
                    shouldCheckFlicker |= true;
                    break;
            }

            if (shouldCheckFlicker) {
                this._mySlidingFlickeringFixCollisionRuntimeParams.reset();

                let newFeetPosition = feetPosition.vec3_add(slideMovement);

                let backupDebugActive = collisionCheckParams.myDebugActive;
                collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;
                this._horizontalCheck(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams);
                collisionCheckParams.myDebugActive = backupDebugActive;

                if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsCollidingHorizontally) {
                    if (collisionCheckParams.mySlidingCheckBothDirections) {
                        this._mySlidingOppositeDirectionCollisionRuntimeParams.copy(this._mySlidingFlickeringFixCollisionRuntimeParams);
                    }

                    let flickerFixSlideMovement = this._internalHorizontalSlide(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams);

                    if (collisionCheckParams.mySlidingCheckBothDirections) {
                        let flickerFixOppositeSlideMovement = this._internalHorizontalSlide(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingOppositeDirectionCollisionRuntimeParams, true);

                        if (this._mySlidingOppositeDirectionCollisionRuntimeParams.myIsSliding) {
                            let isOppositeBetter = false;

                            if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsSliding) {
                                if (Math.abs(movement.vec3_angle(flickerFixOppositeSlideMovement) - movement.vec3_angle(flickerFixSlideMovement)) < 0.00001) {
                                    if (previousHorizontalMovement.vec3_angle(flickerFixOppositeSlideMovement) < previousHorizontalMovement.vec3_angle(flickerFixSlideMovement) - 0.00001) {
                                        isOppositeBetter = true;
                                    }
                                } else if (movement.vec3_angle(flickerFixOppositeSlideMovement) < movement.vec3_angle(flickerFixSlideMovement)) {
                                    isOppositeBetter = true;
                                }
                            } else {
                                isOppositeBetter = true;
                            }

                            if (isOppositeBetter) {
                                flickerFixSlideMovement.vec3_copy(flickerFixOppositeSlideMovement);
                                this._mySlidingFlickeringFixCollisionRuntimeParams.copy(this._mySlidingOppositeDirectionCollisionRuntimeParams);
                            }
                        }
                    }

                    if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsSliding) {
                        if (slideMovement.vec3_signTo(movement, up, 0) != flickerFixSlideMovement.vec3_signTo(movement, up, 0)) {

                            /* {
                                let debugParams = new PP.DebugArrowParams();
                                debugParams.myStart = feetPosition;
                                debugParams.myDirection = slideMovement.vec3_normalize();
                                debugParams.myLength = 0.2;
                                debugParams.myColor = [0.5, 0.5, 0.5, 1];
                                PP.myDebugManager.draw(debugParams, 2);
                            }

                            {
                                let debugParams = new PP.DebugArrowParams();
                                debugParams.myStart = feetPosition;
                                debugParams.myDirection = flickerFixSlideMovement.vec3_normalize();
                                debugParams.myLength = 0.2;
                                debugParams.myColor = [1, 1, 1, 1];
                                PP.myDebugManager.draw(debugParams, 2);
                            }

                            {
                                let debugParams = new PP.DebugArrowParams();
                                debugParams.myStart = feetPosition;
                                debugParams.myDirection = hitNormal.vec3_normalize();
                                debugParams.myLength = 0.2;
                                debugParams.myColor = [1, 0, 0.5, 1];
                                PP.myDebugManager.draw(debugParams, 2);
                            } */

                            slideMovement.vec3_zero();

                            collisionRuntimeParams.myIsSliding = false;
                            collisionRuntimeParams.myIsSlidingIntoOppositeDirection = false;
                            collisionRuntimeParams.mySlidingMovementAngle = 0;
                            collisionRuntimeParams.mySlidingCollisionAngle = 0;
                            collisionRuntimeParams.mySlidingCollisionHit.reset();

                            collisionRuntimeParams.myIsSlidingFlickerPrevented = true;
                        }
                    }
                }
            }
        }

        if (collisionRuntimeParams.myIsSliding) {
            collisionRuntimeParams.myIsCollidingHorizontally = false;
        }

        return slideMovement;
    }

    _internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, checkOppositeDirection = false) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let invertedNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_negate();
        invertedNormal.vec3_removeComponentAlongAxis(up, invertedNormal);
        invertedNormal.vec3_normalize(invertedNormal);

        collisionRuntimeParams.mySlidingCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);

        let lastValidMovement = [0, 0, 0];

        let slidingMovement = invertedNormal.pp_clone();
        if (checkOppositeDirection) {
            slidingMovement.vec3_copy(movement);
            slidingMovement.vec3_normalize(slidingMovement);
        }

        if (!slidingMovement.vec3_isZero(0.00001)) {
            slidingMovement.vec3_scale(movement.vec3_length(), slidingMovement);

            let slidingSign = invertedNormal.vec3_signTo(movement, up);
            if (checkOppositeDirection) {
                slidingSign *= -1;
            }

            let currentAngle = 90 * slidingSign;
            let maxAngle = Math.pp_angleClamp(slidingMovement.vec3_angleSigned(movement.vec3_rotateAxis(90 * slidingSign, up), up) * slidingSign, true) * slidingSign;

            if (Math.abs(maxAngle) < Math.abs(currentAngle) || checkOppositeDirection) {
                maxAngle = currentAngle;
            }

            let minAngle = 0;
            let currentMovement = [0, 0, 0];

            let backupDebugActive = collisionCheckParams.myDebugActive;
            collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;

            for (let i = 0; i < collisionCheckParams.mySlidingMaxAttempts; i++) {
                this._mySlidingCollisionRuntimeParams.copy(collisionRuntimeParams);

                slidingMovement.vec3_rotateAxis(currentAngle, up, currentMovement);
                this._horizontalCheck(currentMovement, feetPosition, height, up, collisionCheckParams, this._mySlidingCollisionRuntimeParams, true);
                if (!this._mySlidingCollisionRuntimeParams.myIsCollidingHorizontally) {
                    lastValidMovement.vec3_copy(currentMovement);
                    collisionRuntimeParams.copy(this._mySlidingCollisionRuntimeParams);
                    collisionRuntimeParams.myIsSliding = true;
                    collisionRuntimeParams.myIsSlidingIntoOppositeDirection = checkOppositeDirection;
                    collisionRuntimeParams.mySlidingMovementAngle = movement.vec3_angleSigned(currentMovement, up);
                    collisionRuntimeParams.mySlidingCollisionAngle = invertedNormal.vec3_angleSigned(currentMovement, up);

                    maxAngle = currentAngle;
                    currentAngle = (maxAngle + minAngle) / 2;
                } else {
                    if (currentAngle != maxAngle) {
                        minAngle = currentAngle;
                    }

                    if (i == 0 && currentAngle != maxAngle) {
                        currentAngle = maxAngle;
                    } else {
                        currentAngle = (minAngle + maxAngle) / 2;
                    }
                }
            }

            collisionCheckParams.myDebugActive = backupDebugActive;
        }

        if (!collisionRuntimeParams.myIsSliding) {
            collisionRuntimeParams.mySlidingCollisionHit.reset();
        }

        return lastValidMovement;
    }

    _verticalCheck(verticalMovement, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        collisionRuntimeParams.myIsCollidingVertically = false;
        collisionRuntimeParams.myVerticalCollisionHit.reset();

        let verticalDirection = verticalMovement.vec3_normalize();
        if (verticalMovement.vec3_length() < 0.00001) {
            verticalDirection = up.vec3_negate();
        }

        let fixedMovement = this._verticalMovementFix(verticalMovement, verticalDirection, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);
        if (fixedMovement.pp_equals(verticalMovement)) {
            let oppositeDirection = verticalDirection.vec3_negate();
            let newFeetPosition = feetPosition.vec3_add(fixedMovement);
            let additionalMovement = this._verticalMovementFix([0, 0, 0], oppositeDirection, newFeetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);
            if (additionalMovement.vec3_isConcordant(verticalDirection)) {
                fixedMovement.vec3_add(additionalMovement, fixedMovement);
            }
        }

        let newFeetPosition = feetPosition.vec3_add(fixedMovement);

        let isMovementDownward = !verticalMovement.vec3_isConcordant(up) || Math.abs(verticalMovement.vec3_length() < 0.000001);
        let canStay = this._verticalPositionCheck(newFeetPosition, isMovementDownward, height, up, forward, collisionCheckParams, collisionRuntimeParams);
        if (!canStay) {
            fixedMovement = null;
        }

        return fixedMovement;
    }

    _verticalMovementFix(verticalMovement, verticalDirection, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugVerticalMovementActive;

        let fixedMovement = null;

        let isMovementDownward = !verticalDirection.vec3_isConcordant(up);

        let startOffset = null;
        let endOffset = null;
        if (isMovementDownward) {
            startOffset = up.vec3_scale(collisionCheckParams.myGroundFixDistanceFromFeet + 0.00001);
            endOffset = verticalMovement.pp_clone();
        } else {
            startOffset = up.vec3_scale(height).vec3_add(up.vec3_scale(-collisionCheckParams.myGroundFixDistanceFromHead - 0.00001));
            endOffset = up.vec3_scale(height).vec3_add(verticalMovement);
        }

        if (isMovementDownward && this._myPrevCollisionRuntimeParams.myIsOnGround) {
            endOffset.vec3_add(up.vec3_scale(-collisionCheckParams.mySnapOnGroundExtraDistance), endOffset);
        }

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
                    if (raycastResult.myHits[0].myPosition.vec3_isFurtherAlongAxis(furtherDirectionPosition, furtherDirection)) {
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
            } else {
                fixedMovement = furtherDirectionPosition.vec3_sub(feetPosition.vec3_add(up.vec3_scale(height))).vec3_componentAlongAxis(up);
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

    _horizontalCheck(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, avoidSlidingExtraCheck = false) {
        collisionRuntimeParams.myIsCollidingHorizontally = false;
        collisionRuntimeParams.myHorizontalCollisionHit.reset();

        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let movementDirection = movement.vec3_normalize();

        let fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.0001));
        let fixedHeight = Math.max(0, height - collisionCheckParams.myDistanceFromFeetToIgnore - collisionCheckParams.myDistanceFromHeadToIgnore - 0.0001 * 2);

        let canMove = this._horizontalMovementCheck(movement, fixedFeetPosition, fixedHeight, up, collisionCheckParams, collisionRuntimeParams);

        let fixedMovement = [0, 0, 0];
        let newFixedFeetPosition = fixedFeetPosition.vec3_add(movement);
        if (canMove) {
            let canStay = this._horizontalPositionCheck(newFixedFeetPosition, fixedHeight, up, movementDirection, collisionCheckParams, collisionRuntimeParams);
            if (canStay) {
                fixedMovement = movement;
            }
        } else if (!avoidSlidingExtraCheck && collisionCheckParams.mySlidingEnabled && collisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal) {
            //check for a better slide hit position and normal

            let projectDirectionAxis = null;
            let hitPosition = collisionRuntimeParams.myHorizontalCollisionHit.myPosition;
            let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 90);
            let hitDirection = hitPosition.vec3_sub(feetPosition);
            if (hitDirection.vec3_isToTheRight(movementDirection, up)) {
                projectDirectionAxis = movementDirection.vec3_rotateAxis(-halfConeAngle, up);
            } else {
                projectDirectionAxis = movementDirection.vec3_rotateAxis(halfConeAngle, up);
            }

            let fixedMovement = hitDirection.vec3_projectTowardDirection(movementDirection, projectDirectionAxis);
            if (fixedMovement.vec3_angle(movementDirection) >= 0.00001 || fixedMovement.vec3_length() > movement.vec3_length() + 0.00001) {
                console.error("ERROR, project function should return a smaller movement in the same direction",
                    fixedMovement.vec3_angle(movementDirection), fixedMovement.vec3_length(), movement.vec3_length());
                //maybe epsilon could be 0.0001? is higher but still 10 times less then a millimiter
            }

            if (fixedMovement.vec3_isConcordant(movementDirection)) {
                fixedMovement = movementDirection.vec3_scale(Math.min(fixedMovement.vec3_length(), movement.vec3_length()));
            } else {
                fixedMovement.vec3_zero();
            }

            if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalMovementActive) {
                {
                    let debugParams = new PP.DebugArrowParams();
                    debugParams.myStart = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.005));
                    debugParams.myDirection = movementDirection;
                    debugParams.myLength = fixedMovement.vec3_length();
                    debugParams.myColor = [1, 0, 1, 1];
                    PP.myDebugManager.draw(debugParams);
                }
            }

            this._myBackupRaycastHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);
            collisionRuntimeParams.myIsCollidingHorizontally = false;
            collisionRuntimeParams.myHorizontalCollisionHit.reset();

            let newFixedFeetPosition = fixedFeetPosition.vec3_add(fixedMovement);

            let backupDebugActive = collisionCheckParams.myDebugActive;
            collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;

            this._horizontalPositionCheck(newFixedFeetPosition, fixedHeight, up, movementDirection, collisionCheckParams, collisionRuntimeParams);

            collisionCheckParams.myDebugActive = backupDebugActive;

            if (!collisionRuntimeParams.myIsCollidingHorizontally || collisionRuntimeParams.myHorizontalCollisionHit.myIsInsideCollision) {
                // just restore the movement check hit, the extra check wasn't helpful
                collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myBackupRaycastHit);
            }

            collisionRuntimeParams.myIsCollidingHorizontally = true;
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _horizontalMovementCheck(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalMovementActive;

        let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 90);
        let movementDirection = movement.vec3_normalize();

        let checkPositions = [];

        let steplength = collisionCheckParams.myRadius / collisionCheckParams.myHorizontalMovementRadialStepAmount;

        checkPositions.push(feetPosition);

        {
            let leftRadialDirection = movementDirection.vec3_rotateAxis(halfConeAngle, up);
            let rightRadialDirection = movementDirection.vec3_rotateAxis(-halfConeAngle, up);
            for (let i = 1; i <= collisionCheckParams.myHorizontalMovementRadialStepAmount; i++) {
                // left
                {
                    let currentStep = i * steplength;
                    let currentRadialPosition = leftRadialDirection.vec3_scale(currentStep);
                    let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                    checkPositions.push(currentCheckPosition);
                }

                // right
                {
                    let currentStep = i * steplength;
                    let currentRadialPosition = rightRadialDirection.vec3_scale(currentStep);
                    let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                    checkPositions.push(currentCheckPosition);
                }
            }
        }

        // if result is inside a collision it's ignored, so that at least you can exit it before seeing if the new position works now

        let groundObjectsToIgnore = null;
        let ceilingObjectsToIgnore = null;
        let groundCeilingObjectsToIgnore = null;

        if (collisionCheckParams.myGroundAngleToIgnore > 0) {
            // gather ground objects to ignore
            groundObjectsToIgnore = [];
            groundCeilingObjectsToIgnore = [];

            let ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundObjectsToIgnore, true, up, collisionCheckParams);

            let ignoreCeilingAngleCallback = null;
            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundCeilingObjectsToIgnore, false, up, collisionCheckParams);
            }

            let heightOffset = [0, 0, 0];
            this._horizontalMovementHorizontalCheck(movement, feetPosition, checkPositions, heightOffset, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
        }

        if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
            // gather ceiling objects to ignore
            if (!collisionRuntimeParams.myIsCollidingHorizontally && collisionCheckParams.myCheckHeight) {
                ceilingObjectsToIgnore = [];

                let ignoreGroundAngleCallback = null;
                if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                    ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, groundObjectsToIgnore, null, true, up, collisionCheckParams);
                }

                let ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, ceilingObjectsToIgnore, false, up, collisionCheckParams);

                let heightOffset = up.vec3_scale(height);
                this._horizontalMovementHorizontalCheck(movement, feetPosition, checkPositions, heightOffset, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
            }
        }

        if (!collisionRuntimeParams.myIsCollidingHorizontally) {

            let groundCeilingCheckIsFine = true;

            if (groundCeilingObjectsToIgnore != null) {
                // check that the ceiling objects ignored by the ground are the correct ones, that is the one ignored by the upper check
                for (let object of groundCeilingObjectsToIgnore) {
                    if (!ceilingObjectsToIgnore.pp_has(element => object.pp_equals(element))) {
                        groundCeilingCheckIsFine = false;
                        break;
                    }
                }
            }

            let ignoreGroundAngleCallback = null;
            let ignoreCeilingAngleCallback = null;

            if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, ceilingObjectsToIgnore, null, false, up, collisionCheckParams);
            }

            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, ceilingObjectsToIgnore, null, false, up, collisionCheckParams);
            }

            let heightStepAmount = 0;
            let heightStep = [0, 0, 0];
            if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
                heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
                heightStep = up.vec3_scale(height / heightStepAmount);
            }

            for (let i = 0; i <= heightStepAmount; i++) {
                let currentHeightOffset = heightStep.vec3_scale(i);

                // we can skip the ground check since we have already done that, but if there was an error do it again with the proper set of objects to ignore
                // the ceiling check can always be ignored, it used the proper ground objects already
                if ((i != 0 && i != heightStepAmount) ||
                    (i == 0 && !groundCeilingCheckIsFine) ||
                    (i == 0 && collisionCheckParams.myGroundAngleToIgnore == 0) ||
                    (i == heightStepAmount && collisionCheckParams.myCeilingAngleToIgnore == 0)) {
                    this._horizontalMovementHorizontalCheck(movement, feetPosition, checkPositions, currentHeightOffset, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                    if (collisionRuntimeParams.myIsCollidingHorizontally) {
                        break;
                    }
                }

                if (i > 0) {
                    this._horizontalMovementVerticalCheck(movement, feetPosition, checkPositions, currentHeightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                    if (collisionRuntimeParams.myIsCollidingHorizontally) {
                        break;
                    }
                }
            }
        }

        return !collisionRuntimeParams.myIsCollidingHorizontally;
    }

    _horizontalMovementVerticalCheck(movement, feetPosition, checkPositions, heightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        let movementStep = movement.vec3_scale(1 / collisionCheckParams.myHorizontalMovementStepAmount);
        let movementDirection = movement.vec3_normalize();

        for (let m = 0; m < collisionCheckParams.myHorizontalMovementStepAmount; m++) {
            for (let j = 0; j < checkPositions.length; j++) {
                let firstPosition = checkPositions[j].vec3_add(movementStep.vec3_scale(m)).vec3_add(heightOffset);

                if (j > 0) {
                    let secondIndex = Math.max(0, j - 2);
                    let secondPosition = checkPositions[secondIndex].vec3_add(movementStep.vec3_scale(m)).vec3_add(heightOffset);

                    if (collisionCheckParams.myHorizontalMovementCheckVerticalDiagonal) {
                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);
                            let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(secondHeightPosition, firstMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            let secondMovementPosition = secondPosition.vec3_add(movementStep);
                            let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightPosition, secondMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }
                    }

                    if (collisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal) {
                        if (m == 0) {
                            {
                                let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                                isHorizontalCheckOk = this._horizontalCheckRaycast(secondHeightPosition, firstPosition, movementDirection, up,
                                    true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                    feetPosition, true,
                                    collisionCheckParams, collisionRuntimeParams);

                                if (!isHorizontalCheckOk) break;
                            }

                            {
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightPosition, secondPosition, movementDirection, up,
                                    true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                    feetPosition, true,
                                    collisionCheckParams, collisionRuntimeParams);

                                if (!isHorizontalCheckOk) break;
                            }
                        }

                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);
                            let secondHeightMovementPosition = secondPosition.vec3_sub(heightStep).vec3_add(movementStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(secondHeightMovementPosition, firstMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            let secondMovementPosition = secondPosition.vec3_add(movementStep);
                            let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightMovementPosition, secondMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }
                    }
                }

                if (collisionCheckParams.myHorizontalMovementCheckVerticalStraight) {
                    if (m == 0) {
                        let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightPosition, firstPosition, movementDirection, up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }

                    {
                        let firstMovementPosition = firstPosition.vec3_add(movementStep);
                        let firstHeightMovementPosition = firstMovementPosition.vec3_sub(heightStep);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightMovementPosition, firstMovementPosition, movementDirection, up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (collisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal) {
                    {
                        let firstMovementPosition = firstPosition.vec3_add(movementStep);
                        let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(firstHeightPosition, firstMovementPosition, movementDirection, up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }

                    {
                        let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(firstPosition, firstHeightMovementPosition, movementDirection, up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (!isHorizontalCheckOk) {
                    collisionRuntimeParams.myIsCollidingHorizontally = true;
                    collisionRuntimeParams.myHorizontalCollisionHit.copy(raycastResult.myHits[0]);
                    break;
                }
            }
        }

        return isHorizontalCheckOk;
    }

    _horizontalMovementHorizontalCheck(movement, feetPosition, checkPositions, heightOffset, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        let movementStep = movement.vec3_scale(1 / collisionCheckParams.myHorizontalMovementStepAmount);
        let movementDirection = movement.vec3_normalize();

        for (let m = 0; m < collisionCheckParams.myHorizontalMovementStepAmount; m++) {
            for (let j = 0; j < checkPositions.length; j++) {
                let firstPosition = checkPositions[j].vec3_add(movementStep.vec3_scale(m)).vec3_add(heightOffset);

                if (j > 0) {
                    let secondIndex = Math.max(0, j - 2);
                    let secondPosition = checkPositions[secondIndex].vec3_add(movementStep.vec3_scale(m)).vec3_add(heightOffset);

                    if (collisionCheckParams.myHorizontalMovementCheckDiagonal) {
                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(secondPosition, firstMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            let secondMovementPosition = secondPosition.vec3_add(movementStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(firstPosition, secondMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }
                    }

                    if (collisionCheckParams.myHorizontalMovementCheckHorizontalBorder) {
                        if (m == 0) {
                            isHorizontalCheckOk = this._horizontalCheckRaycast(secondPosition, firstPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);
                            let secondMovementPosition = secondPosition.vec3_add(movementStep);

                            isHorizontalCheckOk = this._horizontalCheckRaycast(secondMovementPosition, firstMovementPosition, movementDirection, up,
                                true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, true,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }
                    }
                }

                if (collisionCheckParams.myHorizontalMovementCheckStraight || j == 0) {
                    let firstMovementPosition = firstPosition.vec3_add(movementStep);

                    isHorizontalCheckOk = this._horizontalCheckRaycast(firstPosition, firstMovementPosition, null, up,
                        true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                        feetPosition, true,
                        collisionCheckParams, collisionRuntimeParams);

                    if (!isHorizontalCheckOk) break;
                }
            }

            if (!isHorizontalCheckOk) {
                collisionRuntimeParams.myIsCollidingHorizontally = true;
                collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
                break;
            }
        }

        return isHorizontalCheckOk;
    }

    _horizontalPositionCheck(feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalPositionActive;

        let checkPositions = [];
        let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 180);
        let sliceAngle = halfConeAngle / collisionCheckParams.myHalfConeSliceAmount;
        checkPositions.push(feetPosition.vec3_add(forward.vec3_scale(collisionCheckParams.myRadius)));
        for (let i = 1; i <= collisionCheckParams.myHalfConeSliceAmount; i++) {
            let currentAngle = i * sliceAngle;

            let radialDirection = forward.vec3_rotateAxis(-currentAngle, up);
            checkPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius)));

            if (currentAngle != 180) {
                radialDirection = forward.vec3_rotateAxis(currentAngle, up);
                checkPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius)));
            }
        }

        let groundObjectsToIgnore = null;
        let ceilingObjectsToIgnore = null;
        let groundCeilingObjectsToIgnore = null;

        if (collisionCheckParams.myGroundAngleToIgnore > 0) {
            // gather ground objects to ignore
            groundObjectsToIgnore = [];
            groundCeilingObjectsToIgnore = [];

            let ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundObjectsToIgnore, true, up, collisionCheckParams);

            let ignoreCeilingAngleCallback = null;
            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, groundCeilingObjectsToIgnore, false, up, collisionCheckParams);
            }

            let heightOffset = [0, 0, 0];
            this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
        }

        if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
            // gather ceiling objects to ignore
            if (!collisionRuntimeParams.myIsCollidingHorizontally && collisionCheckParams.myCheckHeight) {
                ceilingObjectsToIgnore = [];

                let ignoreGroundAngleCallback = null;
                if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                    ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, groundObjectsToIgnore, null, true, up, collisionCheckParams);
                }

                let ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, null, ceilingObjectsToIgnore, false, up, collisionCheckParams);

                let heightOffset = up.vec3_scale(height);
                this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);
            }
        }

        if (!collisionRuntimeParams.myIsCollidingHorizontally) {

            let groundCeilingCheckIsFine = true;

            if (groundCeilingObjectsToIgnore != null) {
                // check that the ceiling objects ignored by the ground are the correct ones, that is the one ignored by the upper check
                for (let object of groundCeilingObjectsToIgnore) {
                    if (!ceilingObjectsToIgnore.pp_has(element => object.pp_equals(element))) {
                        groundCeilingCheckIsFine = false;
                        break;
                    }
                }
            }

            let ignoreGroundAngleCallback = null;
            let ignoreCeilingAngleCallback = null;

            if (collisionCheckParams.myGroundAngleToIgnore > 0) {
                ignoreGroundAngleCallback = this._ignoreSurfaceAngle.bind(this, ceilingObjectsToIgnore, null, false, up, collisionCheckParams);
            }

            if (collisionCheckParams.myCeilingAngleToIgnore > 0) {
                ignoreCeilingAngleCallback = this._ignoreSurfaceAngle.bind(this, ceilingObjectsToIgnore, null, false, up, collisionCheckParams);
            }

            let heightStepAmount = 0;
            let heightStep = [0, 0, 0];
            if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
                heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
                heightStep = up.vec3_scale(height / heightStepAmount);
            }

            for (let i = 0; i <= heightStepAmount; i++) {
                let currentHeightOffset = heightStep.vec3_scale(i);

                // we can skip the ground check since we have already done that, but if there was an error do it again with the proper set of objects to ignore
                // the ceiling check can always be ignored, it used the proper ground objects already
                if ((i != 0 && i != heightStepAmount) ||
                    (i == 0 && !groundCeilingCheckIsFine) ||
                    (i == 0 && collisionCheckParams.myGroundAngleToIgnore == 0) ||
                    (i == heightStepAmount && collisionCheckParams.myCeilingAngleToIgnore == 0)) {
                    this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, currentHeightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                    if (collisionRuntimeParams.myIsCollidingHorizontally) {
                        break;
                    }
                }

                if (i > 0) {
                    this._horizontalPositionVerticalCheck(feetPosition, checkPositions, currentHeightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                    if (collisionRuntimeParams.myIsCollidingHorizontally) {
                        let hitHeightOffset = collisionRuntimeParams.myHorizontalCollisionHit.myPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);

                        collisionRuntimeParams.myIsCollidingHorizontally = false;
                        collisionRuntimeParams.myHorizontalCollisionHit.reset();
                        this._horizontalPositionHorizontalCheck(feetPosition, checkPositions, hitHeightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams);

                        if (collisionRuntimeParams.myIsCollidingHorizontally) {
                            break;
                        }
                    }
                }
            }
        }

        return !collisionRuntimeParams.myIsCollidingHorizontally;
    }

    _horizontalPositionHorizontalCheck(feetPosition, checkPositions, heightOffset, up, forward, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        let basePosition = feetPosition.vec3_add(heightOffset);

        let halfRadialPositions = Math.floor(checkPositions.length / 2) + 1;
        for (let j = 0; j < halfRadialPositions; j++) {
            if (j > 0) {
                let leftIndex = Math.max(0, j * 2);
                let rightIndex = Math.max(0, (j * 2 - 1));

                if (collisionCheckParams.myCheckConeBorder) {
                    for (let r = 0; r < 2; r++) {
                        let currentIndex = r == 0 ? leftIndex : rightIndex;
                        let currentRadialPosition = null;

                        currentRadialPosition = checkPositions[currentIndex].vec3_add(heightOffset);

                        let previousIndex = Math.max(0, currentIndex - 2);
                        let previousRadialPosition = checkPositions[previousIndex].vec3_add(heightOffset);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, currentRadialPosition, forward.vec3_negate(), up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, true,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (collisionCheckParams.myCheckConeRay && isHorizontalCheckOk) {
                    for (let r = 0; r < 2; r++) {
                        let currentIndex = r == 0 ? leftIndex : rightIndex;

                        let currentRadialPosition = checkPositions[currentIndex].vec3_add(heightOffset);

                        isHorizontalCheckOk = this._horizontalCheckRaycast(basePosition, currentRadialPosition, null, up,
                            false, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }
            } else {
                if (collisionCheckParams.myCheckConeRay) {
                    let currentRadialPosition = checkPositions[j].vec3_add(heightOffset);

                    isHorizontalCheckOk = this._horizontalCheckRaycast(basePosition, currentRadialPosition, null, up,
                        false, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                        feetPosition, false,
                        collisionCheckParams, collisionRuntimeParams);

                    if (!isHorizontalCheckOk) break;
                }
            }

            if (!isHorizontalCheckOk) {
                break;
            }
        }

        if (!isHorizontalCheckOk) {
            collisionRuntimeParams.myIsCollidingHorizontally = true;
            collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
        }

        return isHorizontalCheckOk;
    }

    _horizontalPositionVerticalCheck(feetPosition, checkPositions, heightOffset, heightStep, up, ignoreGroundAngleCallback, ignoreCeilingAngleCallback, collisionCheckParams, collisionRuntimeParams) {
        let isHorizontalCheckOk = true;

        let basePosition = feetPosition.vec3_add(heightOffset);
        let previousBasePosition = basePosition.vec3_sub(heightStep);

        for (let j = 0; j <= checkPositions.length; j++) {
            let currentRadialPosition = null;
            let previousRadialPosition = null;
            if (j == checkPositions.length) {
                currentRadialPosition = basePosition;
                previousRadialPosition = previousBasePosition;
            } else {
                currentRadialPosition = checkPositions[j].vec3_add(heightOffset);
                previousRadialPosition = currentRadialPosition.vec3_sub(heightStep);
            }

            if (collisionCheckParams.myCheckVerticalStraight) {
                isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, currentRadialPosition, null, up,
                    true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                    feetPosition, false,
                    collisionCheckParams, collisionRuntimeParams);

                if (!isHorizontalCheckOk) break;
            }

            if (j < checkPositions.length) {
                if (collisionCheckParams.myCheckVerticalDiagonalRay ||
                    (collisionCheckParams.myCheckVerticalDiagonalBorderRay && (j == 0 || j == checkPositions.length - 1))) {
                    {
                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousBasePosition, currentRadialPosition, null, up,
                            true, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }

                    {
                        isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, basePosition, null, up,
                            falstruee, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                            feetPosition, false,
                            collisionCheckParams, collisionRuntimeParams);

                        if (!isHorizontalCheckOk) break;
                    }
                }

                if (j > 0) {
                    if (collisionCheckParams.myCheckVerticalDiagonalBorder) {
                        let previousIndex = Math.max(0, j - 2);
                        let previousCurrentRadialPosition = checkPositions[previousIndex].vec3_add(heightOffset);
                        let previousPreviousRadialPosition = previousCurrentRadialPosition.vec3_sub(heightStep);

                        {
                            isHorizontalCheckOk = this._horizontalCheckRaycast(previousPreviousRadialPosition, currentRadialPosition, null, up,
                                falstruee, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, false,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }

                        {
                            isHorizontalCheckOk = this._horizontalCheckRaycast(previousRadialPosition, previousCurrentRadialPosition, null, up,
                                falstruee, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
                                feetPosition, false,
                                collisionCheckParams, collisionRuntimeParams);

                            if (!isHorizontalCheckOk) break;
                        }
                    }
                }
            }
        }

        if (!isHorizontalCheckOk) {
            collisionRuntimeParams.myIsCollidingHorizontally = true;
            collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
        }

        return isHorizontalCheckOk;
    }

    _horizontalCheckRaycast(startPosition, endPosition, movementDirection, up,
        ignoreHitsInsideCollision, ignoreGroundAngleCallback, ignoreCeilingAngleCallback,
        feetPosition, fixHitOnCollision,
        collisionCheckParams, collisionRuntimeParams) {

        let origin = startPosition;
        let direction = endPosition.vec3_sub(origin);

        if (movementDirection != null && !direction.vec3_isConcordant(movementDirection)) {
            direction.vec3_negate(direction);
            origin = endPosition;
        }

        let distance = direction.vec3_length();
        direction.vec3_normalize(direction);
        let raycastResult = this._raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams);

        let isOk = true;

        if (raycastResult.isColliding()) {
            for (let hit of raycastResult.myHits) {
                if ((ignoreGroundAngleCallback == null || !ignoreGroundAngleCallback(hit, up)) &&
                    (ignoreCeilingAngleCallback == null || !ignoreCeilingAngleCallback(hit, up))) {
                    isOk = false;
                    break;
                }
            }
        }

        if (!isOk && fixHitOnCollision) {
            let hitPosition = raycastResult.myHits[0].myPosition;

            let fixedFeedPosition = feetPosition.vec3_copyComponentAlongAxis(hitPosition, up);
            let direction = hitPosition.vec3_sub(fixedFeedPosition);
            direction.vec3_normalize(direction);
            let fixedHitPosition = hitPosition.vec3_add(direction.vec3_scale(0.0001));

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
    }

    _raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
        this._myRaycastSetup.myOrigin.vec3_copy(origin);
        this._myRaycastSetup.myDirection.vec3_copy(direction);
        this._myRaycastSetup.myDistance = distance;

        this._myRaycastSetup.myBlockLayerFlags = collisionCheckParams.myBlockLayerFlags;

        this._myRaycastSetup.myObjectsToIgnore = collisionCheckParams.myObjectsToIgnore;
        this._myRaycastSetup.myIgnoreHitsInsideCollision = ignoreHitsInsideCollision;

        let raycastResult = PP.PhysicsUtils.raycast(this._myRaycastSetup, this._myRaycastResult);

        if (this._myDebugActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }

        return raycastResult;
    }

    _ignoreSurfaceAngle(objectsToIgnore, outIgnoredObjects, isGround, up, collisionCheckParams, hit) {
        let isIgnorable = false;

        if (!hit.myIsInsideCollision) {
            let surfaceAngle = hit.myNormal.vec3_angle(up);

            if ((isGround && (collisionCheckParams.myGroundAngleToIgnore > 0 && surfaceAngle <= collisionCheckParams.myGroundAngleToIgnore + 0.0001)) ||
                (!isGround && (collisionCheckParams.myCeilingAngleToIgnore > 0 && (180 - surfaceAngle) <= collisionCheckParams.myCeilingAngleToIgnore + 0.0001))) {
                if (objectsToIgnore == null || objectsToIgnore.pp_has(object => hit.myObject.pp_equals(object))) {
                    isIgnorable = true;

                    if (outIgnoredObjects != null) {
                        outIgnoredObjects.push(hit.myObject);
                    }
                }
            }
        }

        return isIgnorable;
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