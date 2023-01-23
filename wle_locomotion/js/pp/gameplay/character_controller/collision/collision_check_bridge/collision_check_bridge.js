PP.CollisionCheckBridge = {
    _myCollisionCheck: new CollisionCheck(),

    checkMovement: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkMovement(movement, currentTransformQuat, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.move(movement, currentTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
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
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    checkTransform: function () {
        let collisionCheckParams = new CollisionCheckParams();
        let collisionRuntimeParams = new CollisionRuntimeParams();
        return function checkTransform(checkTransformQuat, allowAdjustments, characterColliderSetup, prevCharacterCollisionResults, outCharacterCollisionResults = new PP.CharacterCollisionResults()) {
            this.convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, collisionCheckParams);
            this.convertCharacterCollisionResultsToCollisionRuntimeParams(prevCharacterCollisionResults, collisionRuntimeParams);
            this._myCollisionCheck.positionCheck(allowAdjustments, checkTransformQuat, collisionCheckParams, collisionRuntimeParams);
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
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
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
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
            this.convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults);
        }
    }(),
    convertCharacterCollisionResultsToCollisionRuntimeParams: function (characterCollisionResults, outCollisionRuntimeParams) {
        outCollisionRuntimeParams.reset();

        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPosition);
        characterCollisionResults.myTransformResults.myEndTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myNewPosition);

        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getForward(outCollisionRuntimeParams.myOriginalForward);
        characterCollisionResults.myTransformResults.myStartTransformQuat.quat2_getUp(outCollisionRuntimeParams.myOriginalUp);

        //outCollisionRuntimeParams.myOriginalHeight = characterCollisionResults.myOriginalHeight;

        outCollisionRuntimeParams.myOriginalMovement.vec3_copy(characterCollisionResults.myMovementResults.myStartMovement);
        outCollisionRuntimeParams.myFixedMovement.vec3_copy(characterCollisionResults.myMovementResults.myEndMovement);

        outCollisionRuntimeParams.myLastRelevantOriginalHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastRelevantStartHorizontalMovement);
        outCollisionRuntimeParams.myLastRelevantOriginalVerticalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastRelevantStartVerticalMovement);

        outCollisionRuntimeParams.myIsOnGround = characterCollisionResults.myGroundInfo.myIsOnSurface;
        outCollisionRuntimeParams.myGroundAngle = characterCollisionResults.myGroundInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myGroundPerceivedAngle = characterCollisionResults.myGroundInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myGroundNormal.vec3_copy(characterCollisionResults.myGroundInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myIsOnCeiling = characterCollisionResults.myCeilingInfo.myIsOnSurface;
        outCollisionRuntimeParams.myCeilingAngle = characterCollisionResults.myCeilingInfo.mySurfaceAngle;
        outCollisionRuntimeParams.myCeilingPerceivedAngle = characterCollisionResults.myCeilingInfo.mySurfacePerceivedAngle;
        outCollisionRuntimeParams.myCeilingNormal.vec3_copy(characterCollisionResults.myCeilingInfo.mySurfaceNormal);

        outCollisionRuntimeParams.myHorizontalMovementCanceled = characterCollisionResults.myHorizontalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingHorizontally = characterCollisionResults.myHorizontalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myHorizontalCollisionHit.copy(characterCollisionResults.myHorizontalMovementResults.myReferenceCollisionHit);

        outCollisionRuntimeParams.myVerticalMovementCanceled = characterCollisionResults.myVerticalMovementResults.myMovementFailed;
        outCollisionRuntimeParams.myIsCollidingVertically = characterCollisionResults.myVerticalMovementResults.myIsColliding;
        outCollisionRuntimeParams.myVerticalCollisionHit.copy(characterCollisionResults.myVerticalMovementResults.myReferenceCollisionHit);

        outCollisionRuntimeParams.myHasSnappedOnGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnGround;
        outCollisionRuntimeParams.myHasSnappedOnCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnCeiling;
        outCollisionRuntimeParams.myHasPoppedOutGround = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutGround;
        outCollisionRuntimeParams.myHasPoppedOutCeiling = characterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutCeiling;
        outCollisionRuntimeParams.myHasReducedVerticalMovement = characterCollisionResults.myVerticalAdjustmentsResults.myHasReducedVerticalMovement;
        outCollisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle = characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle || characterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle;

        outCollisionRuntimeParams.myIsSliding = characterCollisionResults.mySlideResults.myHasSlid;
        outCollisionRuntimeParams.mySlidingMovementAngle = characterCollisionResults.mySlideResults.mySlideMovementAngle;
        outCollisionRuntimeParams.mySlidingCollisionAngle = characterCollisionResults.mySlideResults.mySlideSurfaceAngle;
        //outCollisionRuntimeParams.mySlidingCollisionHit.copy(characterCollisionResults.mySlideResults.mySlideSurfaceNormal);

        outCollisionRuntimeParams.myIsSlidingIntoOppositeDirection = characterCollisionResults.myInternalResults.myHasSlidTowardOppositeDirection;
        outCollisionRuntimeParams.myIsSlidingFlickerPrevented = characterCollisionResults.myInternalResults.myLastRelevantSlideFlickerPrevented;
        outCollisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter = characterCollisionResults.myInternalResults.mySlideFlickerPreventionForceCheckCounter;
        outCollisionRuntimeParams.mySliding90DegreesSign = characterCollisionResults.myInternalResults.mySlide90DegreesDirectionSign;
        outCollisionRuntimeParams.mySlidingRecompute90DegreesSign = characterCollisionResults.myInternalResults.mySlide90DegreesRecomputeDirectionSign;
        outCollisionRuntimeParams.myLastRelevantIsSliding = characterCollisionResults.myInternalResults.myLastRelevantHasSlid;
        outCollisionRuntimeParams.mySlidingPreviousHorizontalMovement.vec3_copy(characterCollisionResults.myInternalResults.myLastRelevantEndHorizontalMovement);

        outCollisionRuntimeParams.myOriginalTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myStartTeleportTransformQuat);
        outCollisionRuntimeParams.myFixedTeleportPosition.vec3_copy(characterCollisionResults.myTeleportResults.myEndTeleportTransformQuat);
        outCollisionRuntimeParams.myTeleportCanceled = characterCollisionResults.myTeleportResults.myTeleportFailed;

        outCollisionRuntimeParams.myIsPositionOk = characterCollisionResults.myCheckTransformResults.myCheckTransformFailed;
        characterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myOriginalPositionCheckPosition);
        characterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_getPosition(outCollisionRuntimeParams.myFixedPositionCheckPosition);

        outCollisionRuntimeParams.myIsTeleport = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TELEPORT;
        outCollisionRuntimeParams.myIsMove = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_MOVEMENT;
        outCollisionRuntimeParams.myIsPositionCheck = characterCollisionResults.myCheckType == PP.CharacterCollisionCheckType.CHECK_TRANSFORM;

        outCollisionRuntimeParams.mySplitMovementSteps = characterCollisionResults.mySplitMovementResults.mySplitMovementSteps;
        outCollisionRuntimeParams.mySplitMovementStepsPerformed = characterCollisionResults.mySplitMovementResults.mySplitMovementStepsPerformed;
        outCollisionRuntimeParams.mySplitMovementStop = characterCollisionResults.mySplitMovementResults.mySplitMovementInterrupted;
        outCollisionRuntimeParams.mySplitMovementMovementChecked.vec3_copy(characterCollisionResults.mySplitMovementResults.mySplitMovementMovementChecked);
    },
    convertCollisionRuntimeParamsToCharacterCollisionResults: function () {
        let rotationQuat = PP.quat_create();
        return function convertCollisionRuntimeParamsToCharacterCollisionResults(collisionRuntimeParams, currentTransformQuat, outCharacterCollisionResults) {
            outCharacterCollisionResults.reset();

            if (collisionRuntimeParams.myIsMove) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_MOVEMENT;
            } else if (collisionRuntimeParams.myIsTeleport) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_TELEPORT;
            } else if (collisionRuntimeParams.myIsPositionCheck) {
                outCharacterCollisionResults.myCheckType = PP.CharacterCollisionCheckType.CHECK_TRANSFORM;
            }

            rotationQuat.quat_setForward(collisionRuntimeParams.myOriginalForward, collisionRuntimeParams.myOriginalUp);
            outCharacterCollisionResults.myTransformResults.myStartTransformQuat.quat2_setPositionRotationQuat(collisionRuntimeParams.myOriginalPosition, rotationQuat);
            outCharacterCollisionResults.myTransformResults.myEndTransformQuat.quat2_setPositionRotationQuat(collisionRuntimeParams.myNewPosition, rotationQuat);

            outCharacterCollisionResults.myMovementResults.myStartMovement.vec3_copy(collisionRuntimeParams.myOriginalMovement);
            outCharacterCollisionResults.myMovementResults.myEndMovement.vec3_copy(collisionRuntimeParams.myFixedMovement);
            outCharacterCollisionResults.myMovementResults.myMovementFailed = collisionRuntimeParams.myHorizontalMovementCanceled && collisionRuntimeParams.myVerticalMovementCanceled;
            outCharacterCollisionResults.myMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingHorizontally || collisionRuntimeParams.myIsCollidingVertically;
            if (collisionRuntimeParams.myIsCollidingHorizontally) {
                outCharacterCollisionResults.myMovementResults.myReferenceCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);
            } else if (collisionRuntimeParams.myIsCollidingVertically) {
                outCharacterCollisionResults.myMovementResults.myReferenceCollisionHit.copy(collisionRuntimeParams.myVerticalCollisionHit);
            }

            outCharacterCollisionResults.myHorizontalMovementResults.myMovementFailed = collisionRuntimeParams.myHorizontalMovementCanceled;
            outCharacterCollisionResults.myHorizontalMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingHorizontally;
            outCharacterCollisionResults.myHorizontalMovementResults.myReferenceCollisionHit.copy(collisionRuntimeParams.myHorizontalCollisionHit);

            outCharacterCollisionResults.myVerticalMovementResults.myMovementFailed = collisionRuntimeParams.myVerticalMovementCanceled;
            outCharacterCollisionResults.myVerticalMovementResults.myIsColliding = collisionRuntimeParams.myIsCollidingVertically;
            outCharacterCollisionResults.myVerticalMovementResults.myReferenceCollisionHit.copy(collisionRuntimeParams.myVerticalCollisionHit);

            outCharacterCollisionResults.myTeleportResults.myStartTeleportTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myStartTransformQuat);
            outCharacterCollisionResults.myTeleportResults.myStartTeleportTransformQuat.quat2_setPosition(collisionRuntimeParams.myOriginalTeleportPosition);
            outCharacterCollisionResults.myTeleportResults.myEndTeleportTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myEndTransformQuat);
            outCharacterCollisionResults.myTeleportResults.myEndTeleportTransformQuat.quat2_setPosition(collisionRuntimeParams.myFixedTeleportPosition);
            outCharacterCollisionResults.myTeleportResults.myTeleportFailed = collisionRuntimeParams.myTeleportCanceled;

            outCharacterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myStartTransformQuat);
            outCharacterCollisionResults.myCheckTransformResults.myStartCheckTransformQuat.quat2_setPosition(collisionRuntimeParams.myOriginalPositionCheckPosition);
            outCharacterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_copy(outCharacterCollisionResults.myTransformResults.myEndTransformQuat);
            outCharacterCollisionResults.myCheckTransformResults.myEndCheckTransformQuat.quat2_setPosition(collisionRuntimeParams.myFixedPositionCheckPosition);
            outCharacterCollisionResults.myCheckTransformResults.myCheckTransformFailed = !collisionRuntimeParams.myIsPositionOk;

            outCharacterCollisionResults.mySlideResults.myHasSlid = collisionRuntimeParams.myIsSliding;
            outCharacterCollisionResults.mySlideResults.mySlideMovementAngle = collisionRuntimeParams.mySlidingMovementAngle;
            outCharacterCollisionResults.mySlideResults.mySlideSurfaceAngle = collisionRuntimeParams.mySlidingCollisionAngle;
            //outCharacterCollisionResults.mySlideResults.mySlideSurfaceNormal = collisionRuntimeParams.mySlidingCollisionHit;

            outCharacterCollisionResults.myGroundInfo.myIsOnSurface = collisionRuntimeParams.myIsOnGround;
            outCharacterCollisionResults.myGroundInfo.mySurfaceAngle = collisionRuntimeParams.myGroundAngle;
            outCharacterCollisionResults.myGroundInfo.mySurfacePerceivedAngle = collisionRuntimeParams.myGroundPerceivedAngle;
            outCharacterCollisionResults.myGroundInfo.mySurfaceNormal.vec3_copy(collisionRuntimeParams.myGroundNormal);

            outCharacterCollisionResults.myCeilingInfo.myIsOnSurface = collisionRuntimeParams.myIsOnCeiling;
            outCharacterCollisionResults.myCeilingInfo.mySurfaceAngle = collisionRuntimeParams.myCeilingAngle;
            outCharacterCollisionResults.myCeilingInfo.mySurfacePerceivedAngle = collisionRuntimeParams.myCeilingPerceivedAngle;
            outCharacterCollisionResults.myCeilingInfo.mySurfaceNormal.vec3_copy(collisionRuntimeParams.myCeilingNormal);

            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnGround = collisionRuntimeParams.myHasSnappedOnGround;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutGround = collisionRuntimeParams.myHasPoppedOutGround;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasSnappedOnCeiling = collisionRuntimeParams.myHasSnappedOnCeiling;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasPoppedOutCeiling = collisionRuntimeParams.myHasPoppedOutCeiling;
            outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasReducedVerticalMovement = collisionRuntimeParams.myHasReducedVerticalMovement;
            //outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle = collisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle;
            //outCharacterCollisionResults.myVerticalAdjustmentsResults.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle = collisionRuntimeParams.myHasAdjustedVerticalMovementWithSurfaceAngle;

            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementSteps = collisionRuntimeParams.mySplitMovementSteps;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementStepsPerformed = collisionRuntimeParams.mySplitMovementStepsPerformed;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementInterrupted = collisionRuntimeParams.mySplitMovementStop;
            outCharacterCollisionResults.mySplitMovementResults.mySplitMovementMovementChecked.vec3_copy(collisionRuntimeParams.mySplitMovementMovementChecked);

            outCharacterCollisionResults.myInternalResults.myLastRelevantStartHorizontalMovement.vec3_copy(collisionRuntimeParams.myLastRelevantOriginalHorizontalMovement);
            outCharacterCollisionResults.myInternalResults.myLastRelevantEndHorizontalMovement.vec3_copy(collisionRuntimeParams.mySlidingPreviousHorizontalMovement);
            outCharacterCollisionResults.myInternalResults.myLastRelevantStartVerticalMovement.vec3_copy(collisionRuntimeParams.myLastRelevantOriginalVerticalMovement);
            //outCharacterCollisionResults.myInternalResults.myLastRelevantEndVerticalMovement.vec3_copy(collisionRuntimeParams.mySplitMovementMovementChecked);

            outCharacterCollisionResults.myInternalResults.myLastRelevantHasSlid = collisionRuntimeParams.myLastRelevantIsSliding;
            outCharacterCollisionResults.myInternalResults.myHasSlidTowardOppositeDirection = collisionRuntimeParams.myIsSlidingIntoOppositeDirection;
            outCharacterCollisionResults.myInternalResults.myLastRelevantSlideFlickerPrevented = collisionRuntimeParams.myIsSlidingFlickerPrevented;
            outCharacterCollisionResults.myInternalResults.mySlideFlickerPreventionForceCheckCounter = collisionRuntimeParams.mySlidingFlickerPreventionCheckAnywayCounter;
            outCharacterCollisionResults.myInternalResults.mySlide90DegreesDirectionSign = collisionRuntimeParams.mySliding90DegreesSign;
            outCharacterCollisionResults.myInternalResults.mySlide90DegreesRecomputeDirectionSign = collisionRuntimeParams.mySlidingRecompute90DegreesSign;

            outCharacterCollisionResults.myTransformResults.myStartTransformQuat.quat2_copy(currentTransformQuat);
        }
    }(),

    convertCharacterColliderSetupToCollisionCheckParams: function () {
        let objectsEqualCallback = (first, second) => first.pp_equals(second);
        return function convertCharacterColliderSetupToCollisionCheckParams(characterColliderSetup, outCollisionCheckParams) {
            outCollisionCheckParams.myHeight = characterColliderSetup.myHeight;

            outCollisionCheckParams.myPositionOffsetLocal.vec3_copy(characterColliderSetup.myPositionOffsetLocal);
            outCollisionCheckParams.myRotationOffsetLocalQuat.quat_copy(characterColliderSetup.myRotationOffsetLocalQuat);

            outCollisionCheckParams.myRadius = characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeRadius;
            outCollisionCheckParams.myDistanceFromFeetToIgnore = characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFeetDistanceToIgnore;
            outCollisionCheckParams.myDistanceFromHeadToIgnore = characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckHeadDistanceToIgnore;

            outCollisionCheckParams.myHorizontalMovementCheckEnabled = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementCheckEnabled;

            outCollisionCheckParams.myHorizontalMovementStepEnabled = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementCheckSplitMovementEnabled;
            outCollisionCheckParams.myHorizontalMovementStepMaxLength = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementCheckSplitMovementMaxStepLength;

            outCollisionCheckParams.myHorizontalMovementRadialStepAmount = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementCheckRadialSteps;
            outCollisionCheckParams.myHorizontalMovementCheckDiagonal = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementHorizontalDiagonalOutwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementHorizontalDiagonalInwardCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckStraight = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementHorizontalStraightCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckHorizontalBorder = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementHorizontalRadialCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckVerticalStraight = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonalUpward = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalDiagonalOutwardUpwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalDiagonalInwardUpwardCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonalDownward = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalDiagonalOutwardDownwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalDiagonalInwardDownwardCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightDiagonalUpwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightDiagonalDownwardCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalRadialDiagonalOutwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalRadialDiagonalInwardCheckEnabled;
            outCollisionCheckParams.myHorizontalMovementCheckStraightOnlyForCenter =
                characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementHorizontalStraightCentralCheckEnabled ||
                characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightCentralCheckEnabled ||
                characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightDiagonalUpwardCentralCheckEnabled ||
                characterColliderSetup.myHorizontalCheckSetup.myHorizontalMovementVerticalStraightDiagonalDownwardCentralCheckEnabled;

            outCollisionCheckParams.myHorizontalPositionCheckEnabled = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionCheckEnabled;

            outCollisionCheckParams.myHalfConeAngle = characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeHalfAngle;
            outCollisionCheckParams.myHalfConeSliceAmount = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionCheckConeHalfSlices;
            outCollisionCheckParams.myCheckConeBorder = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionHorizontalBorderCheckEnabled;
            outCollisionCheckParams.myCheckConeRay = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionHorizontalRadialCheckEnabled;
            outCollisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalCheckIgnoreHitsInsideCollision;
            outCollisionCheckParams.myHorizontalPositionCheckVerticalDirectionType = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalCheckDirection;

            outCollisionCheckParams.myCheckHeight = characterColliderSetup.myHorizontalCheckSetup.myHorizontalHeightCheckEnabled;
            outCollisionCheckParams.myCheckHeightTop = characterColliderSetup.myHorizontalCheckSetup.myHorizontalHeightHorizontalCheckEnabled;
            outCollisionCheckParams.myCheckHeightConeOnCollision = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHit;
            outCollisionCheckParams.myCheckHeightConeOnCollisionKeepHit = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHitKeepVerticalHitIfNoHorizontalHit;

            outCollisionCheckParams.myHeightCheckStepAmount = characterColliderSetup.myHorizontalCheckSetup.myHorizontalHeightCheckSteps;
            outCollisionCheckParams.myCheckVerticalStraight = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalStraightCheckEnabled;
            outCollisionCheckParams.myCheckVerticalDiagonalRay = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalRadialDiagonalOutwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalRadialDiagonalInwardCheckEnabled;
            outCollisionCheckParams.myCheckVerticalDiagonalBorder = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalBorderDiagonalOutwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalBorderDiagonalInwardCheckEnabled;
            outCollisionCheckParams.myCheckVerticalDiagonalBorderRay = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalRadialBorderDiagonalUpwardCheckEnabled || characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalRadialBorderDiagonalDownwardCheckEnabled;
            outCollisionCheckParams.myCheckVerticalSearchFartherVerticalHit = characterColliderSetup.myHorizontalCheckSetup.myHorizontalPositionVerticalCheckGetFarthestHit;

            outCollisionCheckParams.myCheckHorizontalFixedForwardEnabled = characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFixedForwardEnabled;
            outCollisionCheckParams.myCheckHorizontalFixedForward.vec3_copy(characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFixedForward);

            outCollisionCheckParams.myVerticalMovementCheckEnabled = characterColliderSetup.myVerticalCheckSetup.myVerticalMovementCheckEnabled;
            outCollisionCheckParams.myVerticalPositionCheckEnabled = characterColliderSetup.myVerticalCheckSetup.myVerticalPositionCheckEnabled;
            outCollisionCheckParams.myFeetRadius = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceRadius;
            outCollisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle = characterColliderSetup.myGroundSetup.myAddVerticalMovementBasedOnSurfacePerceivedAngle || characterColliderSetup.myCeilingSetup.myAddVerticalMovementBasedOnSurfacePerceivedAngle;
            outCollisionCheckParams.myCheckVerticalFixedForwardEnabled = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckFixedForwardEnabled;
            outCollisionCheckParams.myCheckVerticalFixedForward.vec3_copy(characterColliderSetup.myVerticalCheckSetup.myVerticalCheckFixedForward);
            outCollisionCheckParams.myCheckVerticalBothDirection = characterColliderSetup.myVerticalCheckSetup.myVerticalMovementCheckPerformCheckTowardBothDirections;

            outCollisionCheckParams.myVerticalMovementReduceEnabled = characterColliderSetup.myVerticalCheckSetup.myVerticalMovementCheckReductionEnabled;

            outCollisionCheckParams.myGroundCircumferenceAddCenter = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceCentralCheckEnabled;
            outCollisionCheckParams.myGroundCircumferenceSliceAmount = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceSlices;
            outCollisionCheckParams.myGroundCircumferenceStepAmount = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceRadialSteps;
            outCollisionCheckParams.myGroundCircumferenceRotationPerStep = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceRotationPerRadialStepDegrees;
            outCollisionCheckParams.myVerticalAllowHitInsideCollisionIfOneOk = characterColliderSetup.myVerticalCheckSetup.myVerticalCheckAllowHitsInsideCollisionIfOneValid;

            outCollisionCheckParams.myBlockLayerFlags.copy(characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckBlockLayerFlags);
            outCollisionCheckParams.myBlockLayerFlags.addFlags(characterColliderSetup.myHorizontalCheckSetup.myVerticalCheckBlockLayerFlags);
            outCollisionCheckParams.myObjectsToIgnore.pp_copy(characterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckObjectsToIgnore);
            for (let objectToIgnore of characterColliderSetup.myVerticalCheckSetup.myVerticalCheckObjectsToIgnore) {
                outCollisionCheckParams.myObjectsToIgnore.pp_pushUnique(objectToIgnore, objectsEqualCallback);
            }

            outCollisionCheckParams.mySnapOnGroundEnabled = characterColliderSetup.myGroundSetup.mySurfaceSnapEnabled;
            outCollisionCheckParams.mySnapOnGroundExtraDistance = characterColliderSetup.myGroundSetup.mySurfaceSnapMaxDistance;
            outCollisionCheckParams.mySnapOnCeilingEnabled = characterColliderSetup.myCeilingSetup.mySurfaceSnapEnabled;
            outCollisionCheckParams.mySnapOnCeilingExtraDistance = characterColliderSetup.myCeilingSetup.mySurfaceSnapMaxDistance;

            outCollisionCheckParams.myGroundPopOutEnabled = characterColliderSetup.myGroundSetup.mySurfacePopOutEnabled;
            outCollisionCheckParams.myGroundPopOutExtraDistance = characterColliderSetup.myGroundSetup.mySurfacePopOutMaxDistance;
            outCollisionCheckParams.myCeilingPopOutEnabled = characterColliderSetup.myCeilingSetup.mySurfacePopOutEnabled;
            outCollisionCheckParams.myCeilingPopOutExtraDistance = characterColliderSetup.myCeilingSetup.mySurfacePopOutMaxDistance;

            outCollisionCheckParams.myGroundAngleToIgnore = characterColliderSetup.myGroundSetup.mySurfaceAngleToIgnore;
            outCollisionCheckParams.myGroundAngleToIgnoreWithPerceivedAngle = characterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreWithSurfacePerceivedAngle;
            outCollisionCheckParams.myCeilingAngleToIgnore = characterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnore;
            outCollisionCheckParams.myCeilingAngleToIgnoreWithPerceivedAngle = characterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnoreWithSurfacePerceivedAngle;

            outCollisionCheckParams.myHorizontalMovementGroundAngleIgnoreHeight = characterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalMovement;
            outCollisionCheckParams.myHorizontalMovementCeilingAngleIgnoreHeight = characterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalMovement;
            outCollisionCheckParams.myHorizontalPositionGroundAngleIgnoreHeight = characterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalPosition;
            outCollisionCheckParams.myHorizontalPositionCeilingAngleIgnoreHeight = characterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalPosition;

            outCollisionCheckParams.myHorizontalMovementGroundAngleIgnoreMaxMovementLeft = characterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft;
            outCollisionCheckParams.myHorizontalMovementCeilingAngleIgnoreMaxMovementLeft = characterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft;

            outCollisionCheckParams.myComputeGroundInfoEnabled = characterColliderSetup.myGroundSetup.myGatherSurfaceInfo;
            outCollisionCheckParams.myComputeCeilingInfoEnabled = characterColliderSetup.myCeilingSetup.myGatherSurfaceInfo;
            outCollisionCheckParams.myDistanceToBeOnGround = characterColliderSetup.myGroundSetup.myIsOnSurfaceMaxOutsideDistance;
            outCollisionCheckParams.myDistanceToComputeGroundInfo = characterColliderSetup.myGroundSetup.myGatherSurfaceNormalMaxOutsideDistance;
            outCollisionCheckParams.myDistanceToBeOnCeiling = characterColliderSetup.myCeilingSetup.myIsOnSurfaceMaxOutsideDistance;
            outCollisionCheckParams.myDistanceToComputeCeilingInfo = characterColliderSetup.myCeilingSetup.myGatherSurfaceNormalMaxOutsideDistance;
            outCollisionCheckParams.myVerticalFixToBeOnGround = characterColliderSetup.myGroundSetup.myIsOnSurfaceMaxInsideDistance;
            outCollisionCheckParams.myVerticalFixToComputeGroundInfo = characterColliderSetup.myGroundSetup.myGatherSurfaceNormalMaxInsideDistance;
            outCollisionCheckParams.myVerticalFixToBeOnCeiling = characterColliderSetup.myCeilingSetup.myIsOnSurfaceMaxInsideDistance;
            outCollisionCheckParams.myVerticalFixToComputeCeilingInfo = characterColliderSetup.myCeilingSetup.myGatherSurfaceNormalMaxInsideDistance;
            outCollisionCheckParams.myIsOnGroundIfInsideHit = characterColliderSetup.myGroundSetup.myIsOnSurfaceIfInsideSurface;
            outCollisionCheckParams.myIsOnCeilingIfInsideHit = characterColliderSetup.myCeilingSetup.myIsOnSurfaceIfInsideSurface;

            outCollisionCheckParams.myAllowSurfaceSteepFix = characterColliderSetup.myGroundSetup.myAllowExitAttemptWhenOnInvalidSurfacePerceivedAngle || characterColliderSetup.myCeilingSetup.myAllowExitAttemptWhenOnInvalidSurfacePerceivedAngle;
            outCollisionCheckParams.myMustRemainOnGround = characterColliderSetup.myGroundSetup.myMustRemainOnSurface;
            outCollisionCheckParams.myMustRemainOnCeiling = characterColliderSetup.myCeilingSetup.myMustRemainOnSurface;
            outCollisionCheckParams.myMustRemainOnValidGroundAngleDownhill = characterColliderSetup.myGroundSetup.myMustRemainOnValidSurfaceAngleDownhill;
            outCollisionCheckParams.myMustRemainOnValidCeilingAngleDownhill = characterColliderSetup.myCeilingSetup.myMustRemainOnValidSurfaceAngleDownhill;
            outCollisionCheckParams.myRegatherGroundInfoOnSurfaceCheckFail = characterColliderSetup.myGroundSetup.myRegatherSurfaceInfoOnSurfaceCheckFailed;
            outCollisionCheckParams.myRegatherCeilingInfoOnSurfaceCheckFail = characterColliderSetup.myCeilingSetup.myRegatherSurfaceInfoOnSurfaceCheckFailed;

            outCollisionCheckParams.mySlidingEnabled = characterColliderSetup.mySlideSetup.mySlideEnabled;
            outCollisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal = characterColliderSetup.mySlideSetup.mySlideHorizontalMovementCheckGetBetterReferenceHit;
            outCollisionCheckParams.mySlidingMaxAttempts = characterColliderSetup.mySlideSetup.mySlideMaxAttempts;
            outCollisionCheckParams.mySlidingCheckBothDirections = characterColliderSetup.mySlideSetup.mySlideCheckBothDirections;
            outCollisionCheckParams.mySlidingFlickeringPreventionType = characterColliderSetup.mySlideSetup.mySlideFlickerPreventionMode;
            outCollisionCheckParams.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding = characterColliderSetup.mySlideSetup.mySlideFlickerPreventionCheckOnlyIfAlreadySliding;
            outCollisionCheckParams.mySlidingFlickerPreventionCheckAnywayCounter = characterColliderSetup.mySlideSetup.mySlideFlickerPreventionForceCheckCounter;
            outCollisionCheckParams.mySlidingAdjustSign90Degrees = characterColliderSetup.mySlideSetup.mySlide90DegreesAdjustDirectionSign;

            outCollisionCheckParams.mySplitMovementEnabled = characterColliderSetup.mySplitMovementSetup.mySplitMovementEnabled;
            outCollisionCheckParams.mySplitMovementMaxLength = characterColliderSetup.mySplitMovementSetup.mySplitMovementMaxStepLength;
            outCollisionCheckParams.mySplitMovementMaxStepsEnabled = characterColliderSetup.mySplitMovementSetup.mySplitMovementMaxSteps != null;
            outCollisionCheckParams.mySplitMovementMaxSteps = characterColliderSetup.mySplitMovementSetup.mySplitMovementMaxSteps;
            outCollisionCheckParams.mySplitMovementStepEqualLength = characterColliderSetup.mySplitMovementSetup.mySplitMovementMaxStepLength == null;
            outCollisionCheckParams.mySplitMovementStepEqualLengthMinLength = characterColliderSetup.mySplitMovementSetup.mySplitMovementMinStepLength;
            outCollisionCheckParams.mySplitMovementStopWhenHorizontalMovementCanceled = characterColliderSetup.mySplitMovementSetup.mySplitMovementStopOnHorizontalMovementFailed;
            outCollisionCheckParams.mySplitMovementStopWhenVerticalMovementCanceled = characterColliderSetup.mySplitMovementSetup.mySplitMovementStopOnVerticalMovementFailed;
            outCollisionCheckParams.mySplitMovementStopCallback = characterColliderSetup.mySplitMovementSetup.mySplitMovementStopOnCallback;
            outCollisionCheckParams.mySplitMovementStopReturnPrevious = characterColliderSetup.mySplitMovementSetup.mySplitMovementStopReturnPreviousResults;

            outCollisionCheckParams.myDebugActive = characterColliderSetup.myDebugSetup.myDebugActive;

            outCollisionCheckParams.myDebugHorizontalMovementActive = characterColliderSetup.myDebugSetup.myDebugHorizontalMovementCheckActive;
            outCollisionCheckParams.myDebugHorizontalPositionActive = characterColliderSetup.myDebugSetup.myDebugHorizontalPositionCheckActive;
            outCollisionCheckParams.myDebugVerticalMovementActive = characterColliderSetup.myDebugSetup.myDebugVerticalMovementCheckActive;
            outCollisionCheckParams.myDebugVerticalPositionActive = characterColliderSetup.myDebugSetup.myDebugVerticalPositionCheckActive;
            outCollisionCheckParams.myDebugSlidingActive = characterColliderSetup.myDebugSetup.myDebugSlideActive;
            outCollisionCheckParams.myDebugSurfaceInfoActive = characterColliderSetup.myDebugSetup.myDebugGroundInfoActive || characterColliderSetup.myDebugSetup.myDebugCeilingInfoActive;
            outCollisionCheckParams.myDebugRuntimeParamsActive = characterColliderSetup.myDebugSetup.myDebugResultsActive;
            outCollisionCheckParams.myDebugMovementActive = characterColliderSetup.myDebugSetup.myDebugMovementActive;
        }
    }()
};