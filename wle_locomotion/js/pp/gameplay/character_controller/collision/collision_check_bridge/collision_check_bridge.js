PP.CollisionCheckBridge = {
    _myCollisionCheck: new CollisionCheck(),

    checkMovement: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.move(movement, currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    checkTeleportToTransform: function () {
        let teleportPosition = PP.vec3_create();
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTeleportToTransform(teleportTransformQuat, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            teleportPosition = teleportTransformQuat.quat2_getPosition(teleportPosition);
            this._myCollisionCheck.teleport(teleportPosition, teleportTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    checkTransform: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.positionCheck(allowAdjustments, checkTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    updateGroundInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateGroundInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeCeilingInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    updateCeilingInfo: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function updateCeilingInfo(currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            collisionCheckParams.myComputeGroundInfoEnabled = false;
            this._myCollisionCheck.updateSurfaceInfo(currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(collisionRuntimeParams, outCharacterCollisionResults);
        }
    }(),
    convertCharacterColliderSetupToCollisionCheckParams: function (characterColliderSetup, outCollisionCheckParams) {

    },
    convertCharacterCollisionResultsToCollisionRuntimeParams: function (characterCollisionResults, outCollisionRuntimeParams) {
        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPosition);
        characterCollisionResults.myTransformResults.myEndTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myNewPosition);

        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getForward(outCollisionRuntimeParams.myOriginalForward);
        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getUp(outCollisionRuntimeParams.myOriginalUp);

        //outCollisionRuntimeParams.myOriginalHeight = characterCollisionResults.myOriginalHeight;

        outCollisionRuntimeParams.myOriginalMovement.vec3_copy(characterCollisionResults.myMovementResults.myStartMovement);
        outCollisionRuntimeParams.myFixedMovement.vec3_copy(characterCollisionResults.myMovementResults.myEndMovement);

        outCollisionRuntimeParams.myLastValidOriginalHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidStartHorizontalMovement);
        outCollisionRuntimeParams.myLastValidOriginalVerticalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidStartVerticalMovement);

        outCollisionRuntimeParams.myIsOnGround = characterCollisionResults.myGroundSurfaceInfo.myIsOnSurface;
        outCollisionRuntimeParams.myGroundAngle = characterCollisionResults.myGroundSurfaceInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myGroundPerceivedAngle = characterCollisionResults.myGroundSurfaceInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myGroundNormal.vec3_copy(characterCollisionResults.myGroundSurfaceInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myIsOnCeiling = characterCollisionResults.myCeilingSurfaceInfo.myIsOnSurface;
        outCollisionRuntimeParams.myCeilingAngle = characterCollisionResults.myCeilingSurfaceInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myCeilingPerceivedAngle = characterCollisionResults.myCeilingSurfaceInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myCeilingNormal.vec3_copy(characterCollisionResults.myCeilingSurfaceInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myHorizontalMovementCanceled = characterCollisionResults.myHorizontalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingHorizontally = characterCollisionResults.myHorizontalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myHorizontalCollisionHit.copy(characterCollisionResults.myHorizontalMovementResults.myMainCollisionHit);

        outCollisionRuntimeParams.myVerticalMovementCanceled = characterCollisionResults.myVerticalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingVertically = characterCollisionResults.myVerticalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myVerticalCollisionHit.copy(characterCollisionResults.myVerticalMovementResults.myMainCollisionHit);

        outCollisionRuntimeParams.myHasSnappedOnGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnGround;
        outCollisionRuntimeParams.myHasSnappedOnCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnCeiling;
        outCollisionRuntimeParams.myHasPoppedOutGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutGround;
        outCollisionRuntimeParams.myHasPoppedOutCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutCeiling;
        outCollisionRuntimeParams.myHasReducedVerticalMovement = characterCollisionResults.myVerticalAdjustmentsResults.myHasReducedVerticalMovement;
        outCollisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle = characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnGroundAngle || characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnCeilingAngle;

        outCollisionRuntimeParams.myIsSliding = characterCollisionResults.mySlideResults.myHasSlid;
        outCollisionRuntimeParams.mySlidingMovementAngle = characterCollisionResults.mySlideResults.mySlideMovementAngle;
        outCollisionRuntimeParams.mySlidingCollisionAngle = characterCollisionResults.mySlideResults.mySlideSurfaceAngle;
        //outCollisionRuntimeParams.mySlidingCollisionHit.copy(characterCollisionResults.mySlideResults.mySlideSurfaceNormal);

        outCollisionRuntimeParams.myIsSlidingIntoOppositeDirection = characterCollisionResults.myInternalResults.myHasSlidTowardsOppositeDirection;
        outCollisionRuntimeParams.myIsSlidingFlickerPrevented = characterCollisionResults.myInternalResults.mySlideFlickerPrevented;
        outCollisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter = characterCollisionResults.myInternalResults.mySlideFlickerPreventionForceCheckCounter;
        outCollisionRuntimeParams.mySliding90DegreesSign = characterCollisionResults.myInternalResults.mySlide90DegreesSign;
        outCollisionRuntimeParams.mySlidingRecompute90DegreesSign = characterCollisionResults.myInternalResults.mySlideRecompute90DegreesSign;
        outCollisionRuntimeParams.myLastValidIsSliding = characterCollisionResults.myInternalResults.myLastValidHasSlid;
        outCollisionRuntimeParams.mySlidingPreviousHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastValidEndHorizontalMovement);

        outCollisionRuntimeParams.myOriginalTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myStartTeleportTransformQuat);
        outCollisionRuntimeParams.myFixedTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myEndTeleportTransformQuat);
        outCollisionRuntimeParams.myTeleportCanceled = characterCollisionResults.myTeleportResults.myTeleportFailed;

        outCollisionRuntimeParams.myIsPositionOk = characterCollisionResults.myCheckTransformResults.myCheckTransformFailed;
        characterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPositionCheckPosition);
        characterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myFixedPositionCheckPosition);
        outCollisionRuntimeParams.myIsPositionCheckAllowAdjustments = characterCollisionResults.myCheckTransformResults.myCheckTransformAllowAdjustments;

        outCollisionRuntimeParams.myIsTeleport = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TELEPORT;
        outCollisionRuntimeParams.myIsMove = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_MOVEMENT;
        outCollisionRuntimeParams.myIsPositionCheck = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TRANSFORM;

        outCollisionRuntimeParams.mySplitMovementSteps = characterCollisionResults.mySplitMovementResults.mySplitMovementSteps;
        outCollisionRuntimeParams.mySplitMovementStepsPerformed = characterCollisionResults.mySplitMovementResults.mySplitMovementStepsPerformed;
        outCollisionRuntimeParams.mySplitMovementStop = characterCollisionResults.mySplitMovementResults.mySplitMovementInterrupted;
        outCollisionRuntimeParams.mySplitMovementMovementChecked.vec3_copy(characterCollisionResults.mySplitMovementResults.mySplitMovementMovementChecked);

    },
    convertCollisionRuntimeParamsToCharacterCollisionResults: function (collisionRuntimeParams, outCharacterCollisionResults) {

    }
};