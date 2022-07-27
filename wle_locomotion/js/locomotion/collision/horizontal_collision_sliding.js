CollisionCheck.prototype._horizontalSlide = function () {
    let previousHorizontalMovement = PP.vec3_create();
    return function (movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, outSlideMovement) {
        if (movement.vec3_isZero(0.000001)) {
            return outSlideMovement.vec3_zero();
        }

        this._mySlidingCollisionRuntimeParams.copy(collisionRuntimeParams);

        outSlideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, this._mySlidingCollisionRuntimeParams, false, outSlideMovement);

        if (collisionCheckParams.mySlidingCheckBothDirections) {
            previousHorizontalMovement = this._myPrevCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousHorizontalMovement);
            this._horizontalSlideCheckOpposite(movement, feetPosition, height, up, previousHorizontalMovement, collisionCheckParams, collisionRuntimeParams, this._mySlidingCollisionRuntimeParams, outSlideMovement);
        }

        if (this._mySlidingCollisionRuntimeParams.myIsSliding && collisionCheckParams.mySlidingFlickeringPreventionType > 0) {
            let isFlickering = this._horizontalSlideFlickerCheck(movement, outSlideMovement, feetPosition, height, up, collisionCheckParams, this._mySlidingCollisionRuntimeParams);
            this._mySlidingCollisionRuntimeParams.myIsSliding = !isFlickering;
        }

        if (this._mySlidingCollisionRuntimeParams.myIsSliding) {
            collisionRuntimeParams.copy(this._mySlidingCollisionRuntimeParams);
        } else {
            outSlideMovement.vec3_zero();
        }

        return outSlideMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlide", { enumerable: false });

CollisionCheck.prototype._horizontalSlideCheckOpposite = function () {
    let oppositeSlideMovement = PP.vec3_create();
    let hitNormal = PP.vec3_create();
    return function (movement, feetPosition, height, up, previousHorizontalMovement, collisionCheckParams, preSlideCollisionRuntimeParams, postSlideCollisionRuntimeParams, outSlideMovement) {
        this._mySlidingOppositeDirectionCollisionRuntimeParams.copy(preSlideCollisionRuntimeParams);

        oppositeSlideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, collisionCheckParams, this._mySlidingOppositeDirectionCollisionRuntimeParams, true, oppositeSlideMovement);

        if (this._mySlidingOppositeDirectionCollisionRuntimeParams.myIsSliding) {

            let isOppositeBetter = false;
            if (postSlideCollisionRuntimeParams.myIsSliding) {
                if (Math.abs(movement.vec3_angle(oppositeSlideMovement) - movement.vec3_angle(outSlideMovement)) < 0.00001) {
                    if (previousHorizontalMovement.vec3_angle(oppositeSlideMovement) < previousHorizontalMovement.vec3_angle(outSlideMovement) - 0.00001) {
                        isOppositeBetter = true;
                    }
                } else if (movement.vec3_angle(oppositeSlideMovement) < movement.vec3_angle(outSlideMovement)) {
                    isOppositeBetter = true;
                }
            } else {
                isOppositeBetter = true;
            }

            if (isOppositeBetter) {
                /* {
                    hitNormal.vec3_copy(preSlideCollisionRuntimeParams.myHorizontalCollisionHit.myNormal);

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

                outSlideMovement.vec3_copy(oppositeSlideMovement);
                postSlideCollisionRuntimeParams.copy(this._mySlidingOppositeDirectionCollisionRuntimeParams);
            }
        }
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlideCheckOpposite", { enumerable: false });

CollisionCheck.prototype._horizontalSlideFlickerCheck = function () {
    let previousHorizontalMovement = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let fixedMovement = PP.vec3_create();
    let flickerFixSlideMovement = PP.vec3_create();
    return function (movement, slideMovement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        let isFlickering = false;

        let shouldCheckFlicker = false;

        shouldCheckFlicker = shouldCheckFlicker || this._myPrevCollisionRuntimeParams.myIsSlidingFlickerPrevented;

        let flickerCollisionAngle = 90;
        let flickerMovementAngle = 85;
        previousHorizontalMovement = this._myPrevCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousHorizontalMovement);
        switch (collisionCheckParams.mySlidingFlickeringPreventionType) {
            case 1:
                shouldCheckFlicker = shouldCheckFlicker || previousHorizontalMovement.vec3_isZero(0.00001);
                shouldCheckFlicker = shouldCheckFlicker ||
                    this._myPrevCollisionRuntimeParams.myIsSliding &&
                    previousHorizontalMovement.vec3_signTo(movement, up, 0) != slideMovement.vec3_signTo(movement, up, 0);
                break;
            case 2:
                shouldCheckFlicker = shouldCheckFlicker || collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                shouldCheckFlicker = shouldCheckFlicker || Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;
                break;
            case 3:
                shouldCheckFlicker = shouldCheckFlicker || collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                shouldCheckFlicker = shouldCheckFlicker || Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;

                shouldCheckFlicker = shouldCheckFlicker ||
                    Math.abs(Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) - flickerCollisionAngle) < 0.00001 &&
                    Math.abs(collisionRuntimeParams.mySlidingMovementAngle) > flickerMovementAngle + 0.00001;
                break;
            case 4:
                shouldCheckFlicker = shouldCheckFlicker || true;
                break;
        }

        if (shouldCheckFlicker) {
            if (collisionCheckParams.mySlidingFlickeringPreventionType != 1 &&
                this._myPrevCollisionRuntimeParams.myIsSliding && previousHorizontalMovement.vec3_signTo(movement, up, 0) != slideMovement.vec3_signTo(movement, up, 0)) {
                isFlickering = true;
            } else {
                this._mySlidingFlickeringFixCollisionRuntimeParams.reset();

                newFeetPosition = feetPosition.vec3_add(slideMovement, newFeetPosition);

                let backupDebugActive = collisionCheckParams.myDebugActive;
                collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;
                fixedMovement.vec3_zero();
                this._horizontalCheck(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams, false, fixedMovement);
                collisionCheckParams.myDebugActive = backupDebugActive;

                if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsCollidingHorizontally) {
                    this._mySlidingFlickeringFixSlidingCollisionRuntimeParams.copy(this._mySlidingFlickeringFixCollisionRuntimeParams);

                    flickerFixSlideMovement = this._internalHorizontalSlide(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixSlidingCollisionRuntimeParams, false, flickerFixSlideMovement);

                    if (collisionCheckParams.mySlidingCheckBothDirections) {
                        this._horizontalSlideCheckOpposite(movement, newFeetPosition, height, up, slideMovement, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams, this._mySlidingFlickeringFixSlidingCollisionRuntimeParams, flickerFixSlideMovement);
                    }

                    if (this._mySlidingFlickeringFixSlidingCollisionRuntimeParams.myIsSliding) {
                        if (slideMovement.vec3_signTo(movement, up, 0) != flickerFixSlideMovement.vec3_signTo(movement, up, 0)) {

                            /* {
                                hitNormal.vec3_copy(collisionRuntimeParams.mySlidingCollisionHit.myNormal);
    
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

                            isFlickering = true;
                        }
                    }
                }
            }
        }

        return isFlickering;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlideFlickerCheck", { enumerable: false });

CollisionCheck.prototype._internalHorizontalSlide = function () {
    let invertedNormal = PP.vec3_create();
    let slidingMovement = PP.vec3_create();
    let currentMovement = PP.vec3_create();
    return function (movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, checkOppositeDirection, outSlideMovement) {
        if (movement.vec3_isZero(0.000001)) {
            return outSlideMovement.vec3_zero();
        }

        invertedNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_negate(invertedNormal);
        invertedNormal.vec3_removeComponentAlongAxis(up, invertedNormal);
        invertedNormal.vec3_normalize(invertedNormal);

        collisionRuntimeParams.mySlidingCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);

        outSlideMovement.vec3_zero();

        slidingMovement.vec3_copy(invertedNormal);
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
            currentMovement.vec3_zero();

            let backupDebugActive = collisionCheckParams.myDebugActive;
            collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;

            for (let i = 0; i < collisionCheckParams.mySlidingMaxAttempts; i++) {
                this._myInternalSlidingCollisionRuntimeParams.copy(collisionRuntimeParams);

                slidingMovement.vec3_rotateAxis(currentAngle, up, currentMovement);
                let fixedMovement = [0, 0, 0];
                this._horizontalCheck(currentMovement, feetPosition, height, up, collisionCheckParams, this._myInternalSlidingCollisionRuntimeParams, true, fixedMovement);
                if (!this._myInternalSlidingCollisionRuntimeParams.myIsCollidingHorizontally) {
                    outSlideMovement.vec3_copy(currentMovement);
                    collisionRuntimeParams.copy(this._myInternalSlidingCollisionRuntimeParams);
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

        return outSlideMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_internalHorizontalSlide", { enumerable: false });


CollisionCheck.prototype._horizontalCheckBetterSlideNormal = function () {
    let movementDirection = PP.vec3_create();
    let hitDirection = PP.vec3_create();
    let projectAlongAxis = PP.vec3_create();
    let fixedMovement = PP.vec3_create();
    let newFixedFeetPosition = PP.vec3_create();
    return function (movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        //check for a better slide hit position and normal

        movementDirection = movement.vec3_normalize(movementDirection);

        let hitPosition = collisionRuntimeParams.myHorizontalCollisionHit.myPosition;
        let halfConeAngle = Math.min(collisionCheckParams.myHalfConeAngle, 90);
        hitDirection = hitPosition.vec3_sub(feetPosition, hitDirection);
        if (hitDirection.vec3_isToTheRight(movementDirection, up)) {
            projectAlongAxis = movementDirection.vec3_rotateAxis(-halfConeAngle, up, projectAlongAxis);
        } else {
            projectAlongAxis = movementDirection.vec3_rotateAxis(halfConeAngle, up, projectAlongAxis);
        }

        fixedMovement = hitDirection.vec3_projectOnAxisAlongAxis(movementDirection, projectAlongAxis, fixedMovement);
        /* if (fixedMovement.vec3_angle(movementDirection) >= 0.00001 || fixedMovement.vec3_length() > movement.vec3_length() + 0.00001) {
            console.error("ERROR, project function should return a smaller movement in the same direction",
                fixedMovement.vec3_angle(movementDirection), fixedMovement.vec3_length(), movement.vec3_length());
            //maybe epsilon could be 0.0001? is higher but still 10 times less then a millimiter
        } */

        if (fixedMovement.vec3_isConcordant(movementDirection)) {
            fixedMovement = movementDirection.vec3_scale(Math.min(fixedMovement.vec3_length(), movement.vec3_length()), fixedMovement);
        } else {
            fixedMovement.vec3_zero();
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugHorizontalMovementActive) {
            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart = feetPosition.vec3_add(up.vec3_scale(0.005));
            debugParams.myDirection = movementDirection;
            debugParams.myLength = fixedMovement.vec3_length();
            debugParams.myColor = [1, 0, 1, 1];
            PP.myDebugManager.draw(debugParams);
        }

        this._myCheckBetterSlidingNormalCollisionRuntimeParams.copy(collisionRuntimeParams);
        this._myCheckBetterSlidingNormalCollisionRuntimeParams.myIsCollidingHorizontally = false;
        this._myCheckBetterSlidingNormalCollisionRuntimeParams.myHorizontalCollisionHit.reset();

        newFixedFeetPosition = feetPosition.vec3_add(fixedMovement, newFixedFeetPosition);

        let backupDebugActive = collisionCheckParams.myDebugActive;
        collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;

        this._horizontalPositionCheck(newFixedFeetPosition, height, up, movementDirection, collisionCheckParams, this._myCheckBetterSlidingNormalCollisionRuntimeParams);

        collisionCheckParams.myDebugActive = backupDebugActive;

        if (this._myCheckBetterSlidingNormalCollisionRuntimeParams.myIsCollidingHorizontally &&
            !this._myCheckBetterSlidingNormalCollisionRuntimeParams.myHorizontalCollisionHit.myIsInsideCollision) {
            collisionRuntimeParams.copy(this._myCheckBetterSlidingNormalCollisionRuntimeParams);
        }
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalCheckBetterSlideNormal", { enumerable: false });