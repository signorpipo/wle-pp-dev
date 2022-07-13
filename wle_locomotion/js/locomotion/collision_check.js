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

        this.myHeight = 1;

        this.mySlidingEnabled = true;
        this.mySlidingHorizontalMovementCheckBetterNormal = true;
        this.mySlidingMaxAttempts = 4;
        this.mySlidingPreventFlickering = false; // expensive, 2 times the check for the whole horizontal movement!

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myPhysXComponentsToIgnore = [];

        this.myDebugActive = false;

        this.myDebugHorizontalMovementActive = true;
        this.myDebugHorizontalPositionActive = true;
        this.myDebugVerticalMovementActive = true;
        this.myDebugVerticalPositionActive = true;
        this.myDebugSlidingActive = true;
        this.myDebugGroundInfoActive = true;
        this.myDebugRuntimeParamsActive = true;
        this.myDebugMovementActive = true;
    }
};

CollisionRuntimeParams = class CollisionRuntimeParams {
    constructor() {
        this.myIsOnGround = false;

        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit = new PP.RaycastResultHit();

        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit = new PP.RaycastResultHit();

        this.myIsSliding = false;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit = new PP.RaycastResultHit();
    }

    reset() {
        this.myIsOnGround = false;

        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit.reset();

        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit.reset();

        this.myIsSliding = false;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit.reset();
    }

    copy(other) {
        this.myIsOnGround = other.myIsOnGround;

        this.myIsCollidingHorizontally = other.myIsCollidingHorizontally;
        this.myHorizontalCollisionHit.copy(other.myHorizontalCollisionHit);

        this.myIsCollidingVertically = other.myIsCollidingVertically;
        this.myVerticalCollisionHit.copy(other.myVerticalCollisionHit);

        this.myIsSliding = other.myIsSliding;
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
        //horizontalMovement.vec3_scale(5, horizontalMovement);

        //collisionCheckParams.myDebugActive = true;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        let slidingDone = true;

        let fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams);
        if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingHorizontally) {
            fixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, collisionRuntimeParams);
            slidingDone = true;
        }

        let newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement);

        let forward = [0, 0, 0];
        if (fixedHorizontalMovement.vec3_length() < 0.000001) {
            forward.vec3_copy(transformForward);
        } else {
            fixedHorizontalMovement.vec3_normalize(forward);
        }

        // collisionCheckParams.myDebugActive = false;

        let fixedVerticalMovement = this._verticalCheck(verticalMovement, newFeetPosition, height, transformUp, forward, collisionCheckParams, collisionRuntimeParams);
        if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingVertically) {
            if (!slidingDone && collisionRuntimeParams.myHorizontalCollisionHit.isValid()) {
                this._mySlidingOnVerticalCheckCollisionRuntimeParams.copy(collisionRuntimeParams);
                // #TODO horizontal check again with were slopes are blocking
                let slidingOnVerticalCheckFixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, collisionCheckParams, this._mySlidingOnVerticalCheckCollisionRuntimeParams);

                if (!this._mySlidingOnVerticalCheckCollisionRuntimeParams.myIsCollidingHorizontally) {

                    feetPosition.vec3_add(slidingOnVerticalCheckFixedHorizontalMovement, newFeetPosition);

                    if (slidingOnVerticalCheckFixedHorizontalMovement.vec3_length() < 0.000001) {
                        forward.vec3_copy(transformForward);
                    } else {
                        slidingOnVerticalCheckFixedHorizontalMovement.vec3_normalize(forward);
                    }

                    let slidingOnVerticalCheckFixedVerticalMovement = this._verticalCheck(verticalMovement, newFeetPosition, height, transformUp, forward, collisionCheckParams, this._mySlidingOnVerticalCheckCollisionRuntimeParams);
                    if (!this._mySlidingOnVerticalCheckCollisionRuntimeParams.myIsCollidingVertically) {
                        fixedHorizontalMovement = slidingOnVerticalCheckFixedHorizontalMovement;
                        fixedVerticalMovement = slidingOnVerticalCheckFixedVerticalMovement;
                        collisionRuntimeParams.copy(this._mySlidingOnVerticalCheckCollisionRuntimeParams);
                    }
                }
            }
        }

        let fixedMovement = [0, 0, 0];
        if (!collisionRuntimeParams.myIsCollidingVertically) {
            fixedHorizontalMovement.vec3_add(fixedVerticalMovement, fixedMovement);
        }

        feetPosition.vec3_add(fixedMovement, newFeetPosition);

        this._groundCheck(newFeetPosition, transformUp, forward, collisionCheckParams, collisionRuntimeParams);

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugMovementActive) {
            this._debugMovement(movement, fixedMovement, newFeetPosition, transformUp, collisionCheckParams);
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }

        //fixedMovement.vec3_zero();

        return fixedMovement;
    }

    _horizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let slideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams);
        if (collisionCheckParams.mySlidingPreventFlickering && collisionRuntimeParams.myIsSliding &&
            Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > 90 + 0.00001) {
            this._mySlidingFlickeringFixCollisionRuntimeParams.reset();

            let newFeetPosition = feetPosition.vec3_add(slideMovement);

            let backupDebugActive = collisionCheckParams.myDebugActive;
            collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;
            this._horizontalCheck(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams);
            collisionCheckParams.myDebugActive = backupDebugActive;

            if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsCollidingHorizontally) {
                let flickerFixSlideMovement = this._internalHorizontalSlide(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams);
                if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsSliding) {
                    if (slideMovement.vec3_signTo(movement, up, 0) != flickerFixSlideMovement.vec3_signTo(movement, up, 0)) {
                        slideMovement.vec3_zero();
                        collisionRuntimeParams.myIsSliding = false;
                        collisionRuntimeParams.mySlidingMovementAngle = 0;
                        collisionRuntimeParams.mySlidingCollisionAngle = 0;
                        collisionRuntimeParams.mySlidingCollisionHit.reset();
                    }
                }
            }
        }

        if (collisionRuntimeParams.myIsSliding) {
            collisionRuntimeParams.myIsCollidingHorizontally = false;
        }

        return slideMovement;
    }

    _internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let slidingSign = movement.vec3_signTo(collisionRuntimeParams.myHorizontalCollisionHit.myNormal, up);

        let invertedNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_negate();
        invertedNormal.vec3_removeComponentAlongAxis(up, invertedNormal);
        invertedNormal.vec3_normalize(invertedNormal);

        collisionRuntimeParams.mySlidingCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);

        let lastValidMovement = [0, 0, 0];

        let slidingMovement = invertedNormal.pp_clone();
        if (!slidingMovement.vec3_isZero()) {
            slidingMovement.vec3_scale(movement.vec3_length(), slidingMovement);

            let currentAngle = 90 * slidingSign;
            let maxAngle = Math.pp_angleClamp(slidingMovement.vec3_angleSigned(movement.vec3_rotateAxis(90 * slidingSign, up), up) * slidingSign, true) * slidingSign;

            if (Math.abs(maxAngle) < Math.abs(currentAngle)) {
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

    _groundCheck(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugGroundInfoActive;

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        collisionRuntimeParams.myIsOnGround = false;

        let startOffset = up.vec3_scale(0.0001);
        let endOffset = startOffset.vec3_negate();
        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let startPosition = currentPosition.vec3_add(startOffset);
            let endPosition = currentPosition.vec3_add(endOffset);

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.myHits.length > 0) {
                collisionRuntimeParams.myIsOnGround = true;
                break;
            }
        }
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

        let fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.00001));
        let fixedHeight = Math.max(0, height - collisionCheckParams.myDistanceFromFeetToIgnore - collisionCheckParams.myDistanceFromHeadToIgnore);

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
                projectDirectionAxis = movementDirection.vec3_rotateAxis(halfConeAngle, up);
            } else {
                projectDirectionAxis = movementDirection.vec3_rotateAxis(-halfConeAngle, up);
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

        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / collisionCheckParams.myHeightCheckStepAmount);
        }

        let movementStep = movement.vec3_scale(1 / collisionCheckParams.myHorizontalMovementStepAmount);

        // if result is inside a collision it's ignored, so that at least you can exit it before seeing if the new position works now
        for (let m = 0; m < collisionCheckParams.myHorizontalMovementStepAmount; m++) {
            for (let i = 0; i <= heightStepAmount; i++) {
                let currentHeightOffset = heightStep.vec3_scale(i);
                for (let j = 0; j < checkPositions.length; j++) {
                    let firstPosition = checkPositions[j].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                    if (j > 0) {
                        let secondIndex = Math.max(0, j - 2);
                        let secondPosition = checkPositions[secondIndex].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                        if (collisionCheckParams.myHorizontalMovementCheckDiagonal) {
                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);

                                let origin = secondPosition;
                                let direction = firstMovementPosition.vec3_sub(secondPosition);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstMovementPosition;
                                }

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }

                            }

                            {
                                let secondMovementPosition = secondPosition.vec3_add(movementStep);

                                let origin = firstPosition;
                                let direction = secondMovementPosition.vec3_sub(firstPosition);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = secondMovementPosition;
                                }

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (collisionCheckParams.myHorizontalMovementCheckHorizontalBorder) {
                            if (m == 0) {
                                let origin = secondPosition;
                                let direction = firstPosition.vec3_sub(origin);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstPosition;
                                }

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);

                                let origin = secondPosition.vec3_add(movementStep);
                                let direction = firstMovementPosition.vec3_sub(origin);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstMovementPosition;
                                }

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        // check height
                        if (i > 0) {
                            if (collisionCheckParams.myHorizontalMovementCheckVerticalDiagonal) {
                                {
                                    let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                    let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                                    let origin = secondHeightPosition;
                                    let direction = firstMovementPosition.vec3_sub(secondHeightPosition);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = firstMovementPosition;
                                    }

                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.isColliding()) {
                                        this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }

                                {
                                    let secondMovementPosition = secondPosition.vec3_add(movementStep);
                                    let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                    let origin = firstHeightPosition;
                                    let direction = secondMovementPosition.vec3_sub(firstHeightPosition);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = secondMovementPosition;
                                    }

                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.isColliding()) {
                                        this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }

                            if (collisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal) {
                                if (m == 0) {
                                    {
                                        let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                                        let origin = secondHeightPosition;
                                        let direction = firstPosition.vec3_sub(origin);

                                        if (!direction.vec3_isConcordant(movementDirection)) {
                                            direction.vec3_negate(direction);
                                            origin = firstPosition;
                                        }

                                        let distance = direction.vec3_length();
                                        direction.vec3_normalize(direction);
                                        let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                        if (raycastResult.isColliding()) {
                                            this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                            isHorizontalCheckOk = false;
                                            break;
                                        }
                                    }

                                    {
                                        let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                        let origin = firstHeightPosition;
                                        let direction = secondPosition.vec3_sub(origin);

                                        if (!direction.vec3_isConcordant(movementDirection)) {
                                            direction.vec3_negate(direction);
                                            origin = secondPosition;
                                        }

                                        let distance = direction.vec3_length();
                                        direction.vec3_normalize(direction);
                                        let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                        if (raycastResult.isColliding()) {
                                            this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                            isHorizontalCheckOk = false;
                                            break;
                                        }
                                    }
                                }

                                {
                                    let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                    let secondHeightMovementPosition = secondPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                    let origin = secondHeightMovementPosition;
                                    let direction = firstMovementPosition.vec3_sub(origin);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = firstMovementPosition;
                                    }

                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.isColliding()) {
                                        this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }

                                {
                                    let secondMovementPosition = secondPosition.vec3_add(movementStep);
                                    let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                    let origin = firstHeightMovementPosition;
                                    let direction = secondMovementPosition.vec3_sub(origin);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = secondMovementPosition;
                                    }

                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.isColliding()) {
                                        this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (collisionCheckParams.myHorizontalMovementCheckStraight || j == 0) {
                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);

                            let origin = firstPosition;
                            let direction = firstMovementPosition.vec3_sub(origin);
                            let distance = direction.vec3_length();
                            direction.vec3_normalize(direction);
                            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                            if (raycastResult.isColliding()) {
                                this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                isHorizontalCheckOk = false;
                                break;
                            }
                        }
                    }

                    // check height
                    if (i > 0) {
                        if (collisionCheckParams.myHorizontalMovementCheckVerticalStraight) {
                            if (m == 0) {
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                let firstHeightMovementPosition = firstMovementPosition.vec3_sub(heightStep);

                                let origin = firstHeightMovementPosition;
                                let direction = firstMovementPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (collisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal) {
                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstMovementPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                let origin = firstPosition;
                                let direction = firstHeightMovementPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.isColliding()) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!isHorizontalCheckOk) {
                    collisionRuntimeParams.myIsCollidingHorizontally = true;
                    collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
                    break;
                } else if (!collisionRuntimeParams.myHorizontalCollisionHit.isValid() && this._myRaycastResult.isColliding()) {
                    collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
                }
            }
        }

        return isHorizontalCheckOk;
    }

    _horizontalPositionCheck(feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        this._myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalPositionActive;

        let radialPositions = [];
        let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 180);
        let sliceAngle = halfConeAngle / collisionCheckParams.myHalfConeSliceAmount;
        radialPositions.push(feetPosition.vec3_add(forward.vec3_scale(collisionCheckParams.myRadius)));
        for (let i = 1; i <= collisionCheckParams.myHalfConeSliceAmount; i++) {
            let currentAngle = i * sliceAngle;

            let radialDirection = forward.vec3_rotateAxis(-currentAngle, up);
            radialPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius)));

            if (currentAngle != 180) {
                radialDirection = forward.vec3_rotateAxis(currentAngle, up);
                radialPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius)));
            }
        }

        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / collisionCheckParams.myHeightCheckStepAmount);
        }

        for (let i = 0; i <= heightStepAmount; i++) {
            let currentHeightOffset = heightStep.vec3_scale(i);
            let basePosition = feetPosition.vec3_add(currentHeightOffset);
            let previousBasePosition = basePosition.vec3_sub(heightStep);

            if (i != 0) {
                for (let j = 0; j <= radialPositions.length; j++) {
                    let currentRadialPosition = null;
                    let previousRadialPosition = null;
                    if (j == radialPositions.length) {
                        currentRadialPosition = basePosition;
                        previousRadialPosition = previousBasePosition;
                    } else {
                        currentRadialPosition = radialPositions[j].vec3_add(currentHeightOffset);
                        previousRadialPosition = currentRadialPosition.vec3_sub(heightStep);
                    }

                    if (collisionCheckParams.myCheckVerticalStraight) {
                        let origin = previousRadialPosition;
                        let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);

                        let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                        if (raycastResult.myHits.length > 0) {
                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    if (j < radialPositions.length) {
                        if (collisionCheckParams.myCheckVerticalDiagonalRay ||
                            (collisionCheckParams.myCheckVerticalDiagonalBorderRay && (j == 0 || j == radialPositions.length - 1))) {
                            {
                                let origin = previousBasePosition;
                                let direction = currentRadialPosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let origin = previousRadialPosition;
                                let direction = basePosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (j > 0) {
                            if (collisionCheckParams.myCheckVerticalDiagonalBorder) {
                                let previousIndex = Math.max(0, j - 2);
                                let previousCurrentRadialPosition = radialPositions[previousIndex].vec3_add(currentHeightOffset);
                                let previousPreviousRadialPosition = previousCurrentRadialPosition.vec3_sub(heightStep);

                                {
                                    let origin = previousPreviousRadialPosition;
                                    let direction = currentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }

                                {
                                    let origin = previousRadialPosition;
                                    let direction = previousCurrentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (!isHorizontalCheckOk) {
                    collisionRuntimeParams.myIsCollidingHorizontally = true;
                    collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);

                    // try a full radial horizontal check at this height
                    isHorizontalCheckOk = true;
                    basePosition = feetPosition.vec3_copyComponentAlongAxis(this._myRaycastResult.myHits[0].myPosition, up);
                    currentHeightOffset = basePosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);
                }
            }

            if (isHorizontalCheckOk) {
                let halfRadialPositions = Math.floor(radialPositions.length / 2) + 1;
                for (let j = 0; j < halfRadialPositions; j++) {

                    if (j > 0) {
                        let leftIndex = Math.max(0, j * 2);
                        let rightIndex = Math.max(0, (j * 2 - 1));

                        if (collisionCheckParams.myCheckConeBorder) {
                            for (let r = 0; r < 2; r++) {
                                let currentIndex = r == 0 ? leftIndex : rightIndex;
                                let currentRadialPosition = null;

                                currentRadialPosition = radialPositions[currentIndex].vec3_add(currentHeightOffset);

                                let previousIndex = Math.max(0, currentIndex - 2);
                                let previousRadialPosition = radialPositions[previousIndex].vec3_add(currentHeightOffset);
                                let origin = previousRadialPosition;
                                let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                                if (direction.vec3_isConcordant(forward)) {
                                    direction.vec3_negate(direction);
                                    origin = currentRadialPosition;
                                }
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    this._fixRaycastHitPositionFromFeet(raycastResult.myHits[0].myPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams);

                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (collisionCheckParams.myCheckConeRay && isHorizontalCheckOk) {
                            for (let r = 0; r < 2; r++) {
                                let currentIndex = r == 0 ? leftIndex : rightIndex;

                                let currentRadialPosition = radialPositions[currentIndex].vec3_add(currentHeightOffset);

                                let origin = basePosition;
                                let direction = currentRadialPosition.vec3_sub(basePosition);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, false, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }
                    } else {
                        let currentRadialPosition = radialPositions[j].vec3_add(currentHeightOffset);
                        if (collisionCheckParams.myCheckConeRay) {
                            let origin = basePosition;
                            let direction = currentRadialPosition.vec3_sub(basePosition);
                            let distance = direction.vec3_length();
                            direction.vec3_normalize(direction);

                            let raycastResult = this._raycastAndDebug(origin, direction, distance, false, collisionCheckParams, collisionRuntimeParams);

                            if (raycastResult.myHits.length > 0) {
                                isHorizontalCheckOk = false;
                                break;
                            }
                        }
                    }

                    if (!isHorizontalCheckOk) {
                        break;
                    }
                }
            }

            if (!isHorizontalCheckOk) {
                collisionRuntimeParams.myIsCollidingHorizontally = true;
                collisionRuntimeParams.myHorizontalCollisionHit.copy(this._myRaycastResult.myHits[0]);
                break;
            } else if (collisionRuntimeParams.myIsCollidingHorizontally) {
                break;
            }
        }

        return isHorizontalCheckOk;
    }

    _raycastAndDebug(origin, direction, distance, ignoreHitsInsideCollision, collisionCheckParams, collisionRuntimeParams) {
        this._myRaycastSetup.myOrigin.vec3_copy(origin);
        this._myRaycastSetup.myDirection.vec3_copy(direction);
        this._myRaycastSetup.myDistance = distance;

        this._myRaycastSetup.myBlockLayerFlags = collisionCheckParams.myBlockLayerFlags;

        this._myRaycastSetup.myPhysXComponentsToIgnore = collisionCheckParams.myPhysXComponentsToIgnore;
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

    _fixRaycastHitPositionFromFeet(hitPosition, feetPosition, up, collisionCheckParams, collisionRuntimeParams) {
        // check from feet to get the best hit position and normal

        let origin = feetPosition.vec3_copyComponentAlongAxis(hitPosition, up);
        let direction = hitPosition.vec3_sub(origin);
        let distance = direction.vec3_length() + 0.00001;
        direction.vec3_normalize(direction);

        let swapRaycastResult = this._myRaycastResult;
        this._myRaycastResult = this._myFixRaycastResult;
        let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

        // check from feet to get the best hit position and normal
        if (raycastResult.isColliding(true)) {
            this._myFixRaycastResult = swapRaycastResult;
        } else {
            this._myRaycastResult = swapRaycastResult;
        }
    }
};