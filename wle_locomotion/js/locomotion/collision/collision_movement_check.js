CollisionCheck.prototype._move = function () {
    let transformUp = PP.vec3_create();
    let transformForward = PP.vec3_create();
    let feetPosition = PP.vec3_create();

    let horizontalMovement = PP.vec3_create();
    let verticalMovement = PP.vec3_create();

    let movementStep = PP.vec3_create();
    let fixedMovement = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let fixedMovementStep = PP.vec3_create();
    return function _move(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        //return [0, 0, 0];
        //movement = [0, 0, -1];

        transformUp = transformQuat.quat2_getUp(transformUp);
        transformForward = transformQuat.quat2_getForward(transformForward);
        feetPosition = transformQuat.quat2_getPosition(feetPosition);

        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it
        if (height < 0.00001) {
            height = 0;
        }
        //height = 1.75;

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
            fixedMovementStep = this._moveStep(movementStep, newFeetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams, fixedMovementStep);
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
Object.defineProperty(CollisionCheck.prototype, "_move", { enumerable: false });



CollisionCheck.prototype._moveStep = function () {
    let horizontalMovement = PP.vec3_create();
    let verticalMovement = PP.vec3_create();
    let fixedHorizontalMovement = PP.vec3_create();
    let fixedVerticalMovement = PP.vec3_create();
    let horizontalDirection = PP.vec3_create();
    let forwardForHorizontal = PP.vec3_create();
    let forwardForVertical = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    let surfaceAdjustedVerticalMovement = PP.vec3_create();
    let extraSurfaceVerticalMovement = PP.vec3_create();
    return function _moveStep(movement, feetPosition, transformUp, transformForward, height, collisionCheckParams, collisionRuntimeParams, outFixedMovement) {
        // #TODO refactor and split horizontal check and vertical check into: hMovement + vMovement + hPosition + vPosition?
        // Will make the sliding heavier, if I slide repeating all the 4 steps instead of 2 as now, but would be more correct

        // #TODO when on high slopes where u are not allowed to move the check does not manage to slide

        // #TODO when moving upward on the edge of a slope, the edge can be detected as a wall and prevent movement, while it should just keep moving

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

        //_myTotalRaycasts = 0;
        //collisionCheckParams.myDebugActive = true;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        this._syncCollisionRuntimeParamsWithPrevious(horizontalMovement, verticalMovement, transformUp, collisionCheckParams, collisionRuntimeParams, this._myPrevCollisionRuntimeParams);

        {
            forwardForHorizontal.vec3_copy(collisionCheckParams.myCheckHorizontalFixedForward);

            if (!collisionCheckParams.myCheckHorizontalFixedForwardEnabled) {
                if (!horizontalMovement.vec3_isZero()) {
                    forwardForHorizontal = horizontalMovement.vec3_normalize(forwardForHorizontal);
                } else {
                    forwardForHorizontal.vec3_copy(transformForward);
                }
            }

            fixedHorizontalMovement.vec3_zero();

            if (!horizontalMovement.vec3_isZero()) {
                horizontalDirection = horizontalMovement.vec3_normalize(horizontalDirection);
                let surfaceTooSteep = this._surfaceTooSteep(transformUp, horizontalDirection, collisionCheckParams, this._myPrevCollisionRuntimeParams);

                if (!surfaceTooSteep) {
                    fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, transformUp, forwardForHorizontal, collisionCheckParams, collisionRuntimeParams, false, fixedHorizontalMovement);
                    //console.error(_myTotalRaycasts );
                    //collisionRuntimeParams.myIsCollidingHorizontally = true;
                    //collisionRuntimeParams.myHorizontalCollisionHit.myNormal = [0, 0, 1];
                    if (collisionCheckParams.mySlidingEnabled && collisionRuntimeParams.myIsCollidingHorizontally && this._isSlidingNormalValid(horizontalMovement, transformUp, collisionRuntimeParams)) {
                        fixedHorizontalMovement = this._horizontalSlide(horizontalMovement, feetPosition, height, transformUp, forwardForHorizontal, collisionCheckParams, collisionRuntimeParams, fixedHorizontalMovement);
                    } else {
                        //console.error("no slide");
                    }
                }
            }

            if (fixedHorizontalMovement.vec3_isZero(0.000001)) {
                fixedHorizontalMovement.vec3_zero();
            }
        }

        {
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

            if (fixedVerticalMovement.vec3_isZero(0.000001)) {
                fixedVerticalMovement.vec3_zero();
            }
        }

        //console.error(_myTotalRaycasts );
        outFixedMovement.vec3_zero();
        if (!collisionRuntimeParams.myIsCollidingVertically) {
            outFixedMovement = fixedHorizontalMovement.vec3_add(fixedVerticalMovement, outFixedMovement);
        } else {
            collisionRuntimeParams.myHorizontalMovementCancelled = true;
            collisionRuntimeParams.myVerticalMovementCancelled = true;
            fixedHorizontalMovement.vec3_zero();
            fixedVerticalMovement.vec3_zero();
        }

        newFeetPosition = feetPosition.vec3_add(outFixedMovement, newFeetPosition);

        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, true, collisionCheckParams, collisionRuntimeParams);
        this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForVertical, false, collisionCheckParams, collisionRuntimeParams);

        //console.error(_myTotalRaycasts );

        _myTotalRaycastsMax = Math.max(_myTotalRaycasts, _myTotalRaycastsMax);
        //console.error(_myTotalRaycastsMax);

        //return outFixedMovement.vec3_zero();

        {
            if (collisionCheckParams.mySlidingAdjustSign90Degrees) {
                if (!collisionRuntimeParams.myHorizontalMovementCancelled && !collisionRuntimeParams.myIsSliding && !fixedHorizontalMovement.vec3_isZero()) {
                    /* let angleWithPreviousThreshold = 0.5;
                    if (!this._myPrevCollisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_isZero() && !horizontalMovement.vec3_isZero() &&
                        horizontalMovement.vec3_angle(this._myPrevCollisionRuntimeParams.myLastValidOriginalHorizontalMovement) > angleWithPreviousThreshold) {
                        collisionRuntimeParams.mySliding90DegreesSign = horizontalMovement.vec3_signTo(this._myPrevCollisionRuntimeParams.myLastValidOriginalHorizontalMovement, transformUp);
                        console.error("sp", collisionRuntimeParams.mySliding90DegreesSign, collisionRuntimeParams.myIsSliding);
                    } */
                    collisionRuntimeParams.mySlidingRecompute90DegreesSign = true;
                    //console.error("empty renew");
                }
            }

            if (!horizontalMovement.vec3_isZero()) {
                collisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_copy(horizontalMovement);
            }

            if (!verticalMovement.vec3_isZero()) {
                collisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(verticalMovement);
            }

            if (!fixedHorizontalMovement.vec3_isZero()) {
                collisionRuntimeParams.myLastValidIsSliding = collisionRuntimeParams.myIsSliding;
                collisionRuntimeParams.myIsSlidingFlickerPrevented = false;
                //fixedHorizontalMovement.vec3_error();

                if (!collisionRuntimeParams.myIsSliding) {
                    //console.error("not sliding");
                } else {
                    //console.error("sliding", collisionRuntimeParams.myIsSlidingFlickerPrevented, collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter);
                }
            } else {
                //console.error("still", collisionRuntimeParams.myIsSlidingFlickerPrevented, collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter);
            }
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugMovementActive) {
            this._debugMovement(movement, outFixedMovement, newFeetPosition, transformUp, collisionCheckParams);
        }

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }

        return outFixedMovement;
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_moveStep", { enumerable: false });



CollisionCheck.prototype._syncCollisionRuntimeParamsWithPrevious = function () {
    let previousFixedHorizontalMovement = PP.vec3_create();
    return function _syncCollisionRuntimeParamsWithPrevious(horizontalMovement, verticalMovement, up, collisionCheckParams, collisionRuntimeParams, previousCollisionRuntimeParams) {
        collisionRuntimeParams.myIsSlidingFlickerPrevented = previousCollisionRuntimeParams.myIsSlidingFlickerPrevented;
        //console.error("prevented", collisionRuntimeParams.myIsSlidingFlickerPrevented);

        collisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_copy(previousCollisionRuntimeParams.myLastValidOriginalHorizontalMovement);
        collisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(previousCollisionRuntimeParams.myLastValidOriginalVerticalMovement);
        collisionRuntimeParams.myLastValidIsSliding = previousCollisionRuntimeParams.myLastValidIsSliding;

        if (!verticalMovement.vec3_isZero()) {
            collisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(verticalMovement);
        } else {
            collisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(previousCollisionRuntimeParams.myLastValidOriginalVerticalMovement);
        }

        collisionRuntimeParams.mySliding90DegreesSign = previousCollisionRuntimeParams.mySliding90DegreesSign;
        collisionRuntimeParams.mySlidingRecompute90DegreesSign = previousCollisionRuntimeParams.mySlidingRecompute90DegreesSign;
        if (collisionCheckParams.mySlidingAdjustSign90Degrees) {
            let angleWithPreviousThreshold = 0.5;
            if (!previousCollisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_isZero() && !horizontalMovement.vec3_isZero() &&
                horizontalMovement.vec3_angle(previousCollisionRuntimeParams.myLastValidOriginalHorizontalMovement) > angleWithPreviousThreshold) {
                //previousFixedHorizontalMovement = previousCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousFixedHorizontalMovement);
                if (!previousCollisionRuntimeParams.myLastValidIsSliding) {
                    let angleSigned = horizontalMovement.vec3_angleSigned(previousCollisionRuntimeParams.myLastValidOriginalHorizontalMovement, up);
                    let angleSignedThreshold = 10;
                    if (Math.abs(angleSigned) < 180 - angleSignedThreshold) {
                        collisionRuntimeParams.mySliding90DegreesSign = Math.pp_sign(angleSigned);
                        //console.error("special sign");
                    }
                }
                collisionRuntimeParams.mySlidingRecompute90DegreesSign = true;
                //console.error("direction new");
            }
        }

        previousFixedHorizontalMovement = previousCollisionRuntimeParams.myFixedMovement.vec3_removeComponentAlongAxis(up, previousFixedHorizontalMovement);
        if (previousFixedHorizontalMovement.vec3_isZero(0.000001)) {
            collisionRuntimeParams.mySlidingPreviousHorizontalMovement.vec3_copy(previousCollisionRuntimeParams.mySlidingPreviousHorizontalMovement);
        } else {
            collisionRuntimeParams.mySlidingPreviousHorizontalMovement.vec3_copy(previousFixedHorizontalMovement);
        }
    };
}();
Object.defineProperty(CollisionCheck.prototype, "_syncCollisionRuntimeParamsWithPrevious", { enumerable: false });