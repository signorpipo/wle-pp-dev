CollisionCheck.prototype._horizontalSlide = function () {
    let previousHorizontalMovement = PP.vec3_create();
    return function _horizontalSlide(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams, outSlideMovement) {
        if (movement.vec3_isZero(0.000001)) {
            return outSlideMovement.vec3_zero();
        }

        this._mySlidingCollisionRuntimeParams.copy(collisionRuntimeParams);

        previousHorizontalMovement = this._myPrevCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousHorizontalMovement);
        outSlideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, previousHorizontalMovement, collisionCheckParams, this._mySlidingCollisionRuntimeParams, false, outSlideMovement);

        if (collisionCheckParams.mySlidingCheckBothDirections) {
            this._horizontalSlideCheckOpposite(movement, feetPosition, height, up, previousHorizontalMovement, this._myPrevCollisionRuntimeParams.myIsSliding, collisionCheckParams, collisionRuntimeParams, this._mySlidingCollisionRuntimeParams, outSlideMovement);
        }

        if (this._mySlidingCollisionRuntimeParams.myIsSliding && collisionCheckParams.mySlidingFlickeringPreventionType > 0) {
            let isFlickering = this._horizontalSlideFlickerCheck(movement, outSlideMovement, feetPosition, height, up, collisionCheckParams, this._mySlidingCollisionRuntimeParams);
            this._mySlidingCollisionRuntimeParams.myIsSliding = !isFlickering;
        }

        if (this._mySlidingCollisionRuntimeParams.myIsSliding) {
            collisionRuntimeParams.copy(this._mySlidingCollisionRuntimeParams);
        } else {
            //console.error("slide cancel");
            outSlideMovement.vec3_zero();
        }

        return outSlideMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlide", { enumerable: false });

CollisionCheck.prototype._horizontalSlideCheckOpposite = function () {
    let horizontalCollisionNormal = PP.vec3_create();
    let oppositeSlideMovement = PP.vec3_create();
    let hitNormal = PP.vec3_create();
    return function _horizontalSlideCheckOpposite(movement, feetPosition, height, up, previousHorizontalMovement, previousIsSliding, collisionCheckParams, preSlideCollisionRuntimeParams, postSlideCollisionRuntimeParams, outSlideMovement) {
        horizontalCollisionNormal = preSlideCollisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_removeComponentAlongAxis(up, horizontalCollisionNormal);
        horizontalCollisionNormal.vec3_normalize(horizontalCollisionNormal);

        let angleNormalWithMovementThreshold = 20;
        if (horizontalCollisionNormal.vec3_angle(movement) > 180 - angleNormalWithMovementThreshold) {
            //console.error("opposite normal ok");
            return;
        } else if (previousIsSliding && postSlideCollisionRuntimeParams.myIsSliding && outSlideMovement.vec3_isConcordant(previousHorizontalMovement)) {
            //console.error(postSlideCollisionRuntimeParams.myIsSliding, outSlideMovement.vec3_isConcordant(previousHorizontalMovement), outSlideMovement.vec_toString(), previousHorizontalMovement.vec_toString());
            return;
        } else {
            //console.error("no fast exit");
        }

        //console.error(horizontalCollisionNormal.vec3_angle(movement));

        this._mySlidingOppositeDirectionCollisionRuntimeParams.copy(preSlideCollisionRuntimeParams);

        oppositeSlideMovement = this._internalHorizontalSlide(movement, feetPosition, height, up, previousHorizontalMovement, collisionCheckParams, this._mySlidingOppositeDirectionCollisionRuntimeParams, true, oppositeSlideMovement);

        if (this._mySlidingOppositeDirectionCollisionRuntimeParams.myIsSliding) {

            let isOppositeBetter = false;
            if (postSlideCollisionRuntimeParams.myIsSliding) {
                if (movement.vec3_angle(oppositeSlideMovement) < movement.vec3_angle(outSlideMovement) - 0.0001) {
                    //console.error("oppo minor");
                    isOppositeBetter = true;
                } else {
                    if (Math.abs(movement.vec3_angle(oppositeSlideMovement) - movement.vec3_angle(outSlideMovement)) <= 0.0001) {
                        if (previousHorizontalMovement.vec3_angle(oppositeSlideMovement) < previousHorizontalMovement.vec3_angle(outSlideMovement) - 0.0001) {
                            let angleNormalWithMovementThreshold = 5;
                            if (horizontalCollisionNormal.vec3_angle(movement) < 90 + angleNormalWithMovementThreshold) {
                                //console.error("oppo equal");
                                isOppositeBetter = true;
                            }
                        }
                    }
                }
                //console.error(movement.vec3_angle(outSlideMovement), movement.vec3_angle(oppositeSlideMovement));

            } else {
                //console.error("oppo not");
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
            } else {
                //console.error("normal", previousHorizontalMovement.vec_toString(), outSlideMovement.vec_toString(), oppositeSlideMovement.vec_toString());
            }
        } else {
            //console.error("oppo not sliding");
        }
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlideCheckOpposite", { enumerable: false });

CollisionCheck.prototype._horizontalSlideFlickerCheck = function () {
    let previousHorizontalMovement = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let fixedMovement = PP.vec3_create();
    let flickerFixSlideMovement = PP.vec3_create();
    return function _horizontalSlideFlickerCheck(movement, slideMovement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        let isFlickering = false;

        previousHorizontalMovement = this._myPrevCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousHorizontalMovement);
        let shouldCheckFlicker =
            this._myPrevCollisionRuntimeParams.myIsSlidingFlickerPrevented ||
            previousHorizontalMovement.vec3_isZero(0.00001);

        if (!shouldCheckFlicker) {
            if (this._myPrevCollisionRuntimeParams.myIsSliding || !collisionCheckParams.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding) {
                let flickerCollisionAngle = 90;
                let flickerMovementAngle = 85;
                switch (collisionCheckParams.mySlidingFlickeringPreventionType) {
                    case 1:
                        shouldCheckFlicker = previousHorizontalMovement.vec3_signTo(movement, up, 0) != slideMovement.vec3_signTo(movement, up, 0);
                        break;
                    case 2:
                        shouldCheckFlicker = collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                        shouldCheckFlicker = shouldCheckFlicker || Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;
                        break;
                    case 3:
                        shouldCheckFlicker = collisionCheckParams.mySlidingCheckBothDirections && collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
                        shouldCheckFlicker = shouldCheckFlicker || Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) > flickerCollisionAngle + 0.00001;

                        shouldCheckFlicker = shouldCheckFlicker || (
                            Math.abs(Math.abs(collisionRuntimeParams.mySlidingCollisionAngle) - flickerCollisionAngle) < 0.00001 &&
                            Math.abs(collisionRuntimeParams.mySlidingMovementAngle) > flickerMovementAngle + 0.00001);
                        break;
                    case 4:
                        shouldCheckFlicker = true;
                        break;
                }
            }
        }

        if (shouldCheckFlicker || this._myPrevCollisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter > 0) {
            if (shouldCheckFlicker) {
                collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter = collisionCheckParams.mySlidingFlickerPreventionCheckAnywayCounter;
            } else {
                collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter = Math.max(0, this._myPrevCollisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter - 1);
            }

            if (collisionCheckParams.mySlidingFlickeringPreventionType != 1 &&
                this._myPrevCollisionRuntimeParams.myIsSliding && previousHorizontalMovement.vec3_signTo(movement, up, 0) != slideMovement.vec3_signTo(movement, up, 0)) {
                isFlickering = true;
            } else {
                this._mySlidingFlickeringFixCollisionRuntimeParams.reset();
                this._mySlidingFlickeringFixCollisionRuntimeParams.mySliding90DegreesSign = collisionRuntimeParams.mySliding90DegreesSign;
                this._mySlidingFlickeringFixCollisionRuntimeParams.mySlidingRecompute90DegreesSign = false;

                newFeetPosition = feetPosition.vec3_add(slideMovement, newFeetPosition);

                let backupDebugActive = collisionCheckParams.myDebugActive;
                collisionCheckParams.myDebugActive = collisionCheckParams.myDebugActive && collisionCheckParams.myDebugSlidingActive;
                fixedMovement.vec3_zero();
                this._horizontalCheck(movement, newFeetPosition, height, up, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams, false, fixedMovement);
                collisionCheckParams.myDebugActive = backupDebugActive;

                if (this._mySlidingFlickeringFixCollisionRuntimeParams.myIsCollidingHorizontally) {
                    this._mySlidingFlickeringFixSlidingCollisionRuntimeParams.copy(this._mySlidingFlickeringFixCollisionRuntimeParams);

                    flickerFixSlideMovement = this._internalHorizontalSlide(movement, newFeetPosition, height, up, slideMovement, collisionCheckParams, this._mySlidingFlickeringFixSlidingCollisionRuntimeParams, false, flickerFixSlideMovement);

                    if (collisionCheckParams.mySlidingCheckBothDirections) {
                        this._horizontalSlideCheckOpposite(movement, newFeetPosition, height, up, slideMovement, true, collisionCheckParams, this._mySlidingFlickeringFixCollisionRuntimeParams, this._mySlidingFlickeringFixSlidingCollisionRuntimeParams, flickerFixSlideMovement);
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

        if (isFlickering) {
            //console.error("flicker", shouldCheckFlicker);
        } else {
            //console.error("no flicker", shouldCheckFlicker);
        }

        return isFlickering;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_horizontalSlideFlickerCheck", { enumerable: false });

CollisionCheck.prototype._internalHorizontalSlide = function () {
    let invertedNormal = PP.vec3_create();
    let slidingMovement = PP.vec3_create();
    let movement90 = PP.vec3_create();
    let currentMovement = PP.vec3_create();
    return function _internalHorizontalSlide(movement, feetPosition, height, up, previousHorizontalMovement, collisionCheckParams, collisionRuntimeParams, checkOppositeDirection, outSlideMovement) {
        if (movement.vec3_isZero(0.000001)) {
            return outSlideMovement.vec3_zero();
        }

        //let copiedNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.pp_clone();
        invertedNormal = collisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_negate(invertedNormal);
        invertedNormal.vec3_removeComponentAlongAxis(up, invertedNormal);
        invertedNormal[0] = Math.abs(invertedNormal[0]) < 0.01 ? 0 : invertedNormal[0];
        invertedNormal[2] = Math.abs(invertedNormal[2]) < 0.01 ? 0 : invertedNormal[2];
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

            if (collisionCheckParams.mySlidingAdjustSign90Degrees) {
                let angleThreshold = 0.1;
                let angleSigned = invertedNormal.vec3_angleSigned(movement, up);
                if (Math.abs(angleSigned) < angleThreshold && collisionRuntimeParams.mySliding90DegreesSign != 0) {
                    //console.error(slidingSign, collisionRuntimeParams.mySliding90DegreesSign);
                    slidingSign = collisionRuntimeParams.mySliding90DegreesSign;
                } else if (collisionRuntimeParams.mySliding90DegreesSign == 0 || collisionRuntimeParams.mySlidingRecompute90DegreesSign) {
                    collisionRuntimeParams.mySliding90DegreesSign = slidingSign;
                } else {
                    //console.error("no fix");
                }

                collisionRuntimeParams.mySlidingRecompute90DegreesSign = false;
            }

            if (checkOppositeDirection) {
                slidingSign *= -1;
            }

            let currentAngle = 90 * slidingSign;
            let maxAngle = Math.pp_angleClamp(slidingMovement.vec3_angleSigned(movement.vec3_rotateAxis(90 * slidingSign, up, movement90), up) * slidingSign, true) * slidingSign;

            if (Math.abs(maxAngle) < Math.abs(currentAngle) || checkOppositeDirection) {
                maxAngle = currentAngle;
            }

            if (checkOppositeDirection && !previousHorizontalMovement.vec3_isZero(0.000001)) {
                let angleWithPrevious = movement.vec3_angleSigned(previousHorizontalMovement, up);
                if (Math.pp_sign(angleWithPrevious) == Math.pp_sign(maxAngle) && Math.abs(maxAngle) > Math.abs(angleWithPrevious)) {
                    currentAngle = angleWithPrevious;
                    //console.error("better angle", currentAngle, previousHorizontalMovement.vec_toString(10), movement.vec_toString(10));
                }
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
        } else {
            //console.error("slide angle", movement.vec3_angleSigned(invertedNormal, up), invertedNormal.vec_toString(), copiedNormal.vec_toString());
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
    return function _horizontalCheckBetterSlideNormal(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
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