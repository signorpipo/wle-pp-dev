CollisionCheck.prototype._teleport = function () {
    let transformUp = PP.vec3_create();
    let transformForward = PP.vec3_create();
    let feetPosition = PP.vec3_create();
    let zero = PP.vec3_create();
    let forwardForHorizontal = PP.vec3_create();
    let forwardForVertical = PP.vec3_create();
    let forwardForPerceivedAngle = PP.vec3_create();
    let fixedHorizontalMovement = PP.vec3_create();
    let fixedVerticalMovement = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    return function _teleport(teleportPosition, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        transformUp = transformQuat.quat2_getUp(transformUp);
        transformForward = transformQuat.quat2_getForward(transformForward);
        feetPosition = transformQuat.quat2_getPosition(feetPosition);

        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it
        if (height < 0.00001) {
            height = 0;
        }
        //height = 1.75;

        this._myPrevCollisionRuntimeParams.copy(collisionRuntimeParams);
        collisionRuntimeParams.reset();

        forwardForHorizontal.vec3_copy(collisionCheckParams.myCheckHorizontalFixedForward);
        if (!collisionCheckParams.myCheckHorizontalFixedForwardEnabled) {
            forwardForHorizontal.vec3_copy(transformForward);
        }

        fixedHorizontalMovement = this._horizontalCheck(zero, teleportPosition, height, transformUp, forwardForHorizontal, collisionCheckParams, collisionRuntimeParams, false, fixedHorizontalMovement);
        if (!collisionRuntimeParams.myIsCollidingHorizontally) {
            newFeetPosition = teleportPosition.vec3_add(fixedHorizontalMovement, newFeetPosition);

            forwardForVertical.vec3_copy(collisionCheckParams.myCheckVerticalFixedForward);
            if (!collisionCheckParams.myCheckVerticalFixedForwardEnabled) {
                forwardForVertical.vec3_copy(transformForward);
            }

            let downward = -1;
            fixedVerticalMovement = this._verticalCheck(zero, downward, newFeetPosition, height, transformUp, forwardForVertical, collisionCheckParams, collisionRuntimeParams, fixedVerticalMovement);
            if (!collisionRuntimeParams.myIsCollidingVertically) {
                newFeetPosition = newFeetPosition.vec3_add(fixedVerticalMovement, newFeetPosition);

                forwardForPerceivedAngle.vec3_copy(transformForward);

                if (collisionCheckParams.myComputeGroundInfoEnabled) {
                    this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForPerceivedAngle, forwardForVertical, true, collisionCheckParams, collisionRuntimeParams);
                }

                if (collisionCheckParams.myComputeCeilingInfoEnabled) {
                    this._gatherSurfaceInfo(newFeetPosition, height, transformUp, forwardForPerceivedAngle, forwardForVertical, false, collisionCheckParams, collisionRuntimeParams);
                }

                if (collisionRuntimeParams.myGroundAngle < collisionCheckParams.myGroundAngleToIgnore + 0.0001 &&
                    collisionRuntimeParams.myCeilingAngle < collisionCheckParams.myCeilingAngleToIgnore + 0.0001) {
                    collisionRuntimeParams.myFixedTeleportPosition.vec3_copy(newFeetPosition);
                } else {
                    collisionRuntimeParams.myTeleportCanceled = true;
                }
            } else {
                collisionRuntimeParams.myTeleportCanceled = true;
            }
        } else {
            collisionRuntimeParams.myTeleportCanceled = true;
        }

        collisionRuntimeParams.myOriginalPosition.vec3_copy(feetPosition);

        collisionRuntimeParams.myOriginalHeight = height;

        collisionRuntimeParams.myOriginalForward.vec3_copy(transformForward);
        collisionRuntimeParams.myOriginalUp.vec3_copy(transformUp);

        collisionRuntimeParams.myOriginalTeleportPosition.vec3_copy(teleportPosition);

        if (!collisionRuntimeParams.myTeleportCanceled) {
            collisionRuntimeParams.myNewPosition.vec3_copy(collisionRuntimeParams.myFixedTeleportPosition);
        } else {
            collisionRuntimeParams.myNewPosition.vec3_copy(collisionRuntimeParams.myOriginalPosition);
        }

        collisionRuntimeParams.myIsTeleport = true;

        if (collisionCheckParams.myDebugActive && collisionCheckParams.myDebugRuntimeParamsActive) {
            this._debugRuntimeParams(collisionRuntimeParams);
        }
    };
}();



Object.defineProperty(CollisionCheck.prototype, "_teleport", { enumerable: false });
