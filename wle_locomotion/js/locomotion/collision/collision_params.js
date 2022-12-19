
CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.mySplitMovementEnabled = false;
        this.mySplitMovementMaxLength = 0;

        this.myRadius = 0.3;
        this.myDistanceFromFeetToIgnore = 0.1;
        this.myDistanceFromHeadToIgnore = 0.1;

        this.myHorizontalMovementCheckEnabled = false;
        // usually the horizontal movement is very small and it could be simply skipped has a check, the horizontal position check will be enough
        // with small I mean that it's very unlikely that in 10 cm of movement in a frame u are going to hit something in between but not in the final position
        // if u feel like the movement is bigger or want to be sure u can always enabled this
        // if the movement is really that big it's probably better to use the mySplitMovementEnabled flag and split the movement check into smaller movements
        this.myHorizontalMovementStepEnabled = false;
        this.myHorizontalMovementStepMaxLength = 0;
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
        this.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = true; // true gives less issues(tm), but may also collide a bit more, resulting in less sliding
        this.myHorizontalPositionCheckVerticalDirectionType = 0; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!
        // 0: check upward, gives less issues(tm) (hitting a very small step at the end of a slope) with a grounded movement (not fly or snapped to ceiling), but may also collide a bit more, resulting in less sliding
        // 1: check downard, gives less issues(tm) with a ceiling-ed movement (not fly or snapped to ground), but may also collide a bit more, resulting in less sliding and more stuck in front of a wall
        // 2: check both directions, more expensive and better prevent collision, sliding more, but is more expensive and gives more issues            
        //                                                                                                                                                      ___
        // the issues(tm) means that a small step at the end of a slope, maybe due to 2 rectangles, one for the floor and the other for the slope like this -> /   
        // can create a small step if the floor rectangle is a bit above the end of the slope, this will make the character get stuck thinking it's a wall
        // 0 avoid this issue for a grounded movement, 2 instead do a more "aggressive" vertical check that makes the character get less stuck in other situations, but can get stuck in this one
        // the better solution is to properly create the level, and if possible combine the 2 rectangles by having the floor a little below the end of the slope
        // the step that is created "on the other side" in fact can easily be ignored thanks to the myDistanceFromFeetToIgnore field
        // if the level is properly created the best solution should be myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = false and myHorizontalPositionCheckVerticalDirectionType = 0

        this.myCheckHorizontalFixedForwardEnabled = false; // this is basically only useful if the cone angle is 180 degrees
        this.myCheckHorizontalFixedForward = [0, 0, 1];

        this.myFeetRadius = 0.1;
        this.myAdjustVerticalMovementWithSurfaceAngle = true;
        this.myCheckVerticalFixedForwardEnabled = true;
        this.myCheckVerticalFixedForward = [0, 0, 1];
        this.myCheckVerticalBothDirection = true;

        this.mySnapOnGroundEnabled = true;
        this.mySnapOnGroundExtraDistance = 0.1;
        this.mySnapOnCeilingEnabled = false;
        this.mySnapOnCeilingExtraDistance = 0.1;

        this.myGroundCircumferenceSliceAmount = 8;
        this.myGroundCircumferenceStepAmount = 2;
        this.myGroundCircumferenceRotationPerStep = 22.5;
        this.myGroundFixDistanceFromFeet = 0.1;
        this.myGroundFixDistanceFromHead = 0.1;

        this.myCheckHeight = true;
        this.myCheckHeightTop = true;
        this.myCheckHeightConeOnCollision = true;
        this.myCheckHeightConeOnCollisionKeepHit = false; // if true and myCheckHeightConeOnCollision is true, if the cone does not hit the height hit will be restored
        // the fact that the cone does not hit could be due to the fact that it thinks that the collision can be ignored though, sop restoring can be a bit safer but also collide more
        this.myHeightCheckStepAmount = 1;
        this.myCheckVerticalStraight = true;
        this.myCheckVerticalDiagonalRay = false;
        this.myCheckVerticalDiagonalBorder = false;
        this.myCheckVerticalDiagonalBorderRay = false;
        this.myCheckVerticalSearchFurtherVerticalHit = false; //somewhat expensive, but can help fix sime sliding issues

        this.myGroundAngleToIgnore = 30;
        this.myCeilingAngleToIgnore = 30;

        this.myHeight = 1;

        this.myDistanceToBeOnGround = 0.001;
        this.myDistanceToComputeGroundInfo = 0.1;
        this.myDistanceToBeOnCeiling = 0.001;
        this.myDistanceToComputeCeilingInfo = 0.1;
        this.myVerticalFixToBeOnGround = 0;
        this.myVerticalFixToComputeGroundInfo = 0;
        this.myVerticalFixToBeOnCeiling = 0;
        this.myVerticalFixToComputeCeilingInfo = 0;

        this.mySlidingEnabled = true;
        this.mySlidingHorizontalMovementCheckBetterNormal = true;
        this.mySlidingMaxAttempts = 4;
        this.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        // this can fix some edge cases in which u can get stuck instead of sliding
        // it basically require that u also add flicker prevention

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

        this.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding = false;
        // this flag make it so the prevention is done only if it was already sliding, this can lead to a few frames of flicker if u go towards a corner directly
        // but allow the movement to be more fluid, avoiding getting stuck

        this.mySlidingFlickerPreventionCheckAnywayCounter = 0;
        // if the collision think it needs to check for flicker, it will keep checking for the next X frames based on this value even if the condition are not met anymore
        // this help in catching the flicker when the direction is not changing every frame but every 2-3 for example
        // it's especially useful if combo-ed with mySlidingFlickeringPreventionType #1, making it a bit less fluid but also less flickering

        this.mySlidingAdjustSign90Degrees = true;

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

    copy(params) {
        this.mySplitMovementEnabled = params.mySplitMovementEnabled;
        this.mySplitMovementMaxLength = params.mySplitMovementMaxLength;

        this.myRadius = params.myRadius;
        this.myDistanceFromFeetToIgnore = params.myDistanceFromFeetToIgnore;
        this.myDistanceFromHeadToIgnore = params.myDistanceFromHeadToIgnore;

        this.myHorizontalMovementCheckEnabled = params.myHorizontalMovementCheckEnabled;
        this.myHorizontalMovementStepEnabled = params.myHorizontalMovementStepEnabled;
        this.myHorizontalMovementStepMaxLength = params.myHorizontalMovementStepMaxLength;
        this.myHorizontalMovementRadialStepAmount = params.myHorizontalMovementRadialStepAmount;
        this.myHorizontalMovementCheckDiagonal = params.myHorizontalMovementCheckDiagonal;
        this.myHorizontalMovementCheckStraight = params.myHorizontalMovementCheckStraight;
        this.myHorizontalMovementCheckHorizontalBorder = params.myHorizontalMovementCheckHorizontalBorder;
        this.myHorizontalMovementCheckVerticalStraight = params.myHorizontalMovementCheckVerticalStraight;
        this.myHorizontalMovementCheckVerticalDiagonal = params.myHorizontalMovementCheckVerticalDiagonal;
        this.myHorizontalMovementCheckVerticalStraightDiagonal = params.myHorizontalMovementCheckVerticalStraightDiagonal;
        this.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = params.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal;

        this.myHalfConeAngle = params.myHalfConeAngle;
        this.myHalfConeSliceAmount = params.myHalfConeSliceAmount;
        this.myCheckConeBorder = params.myCheckConeBorder;
        this.myCheckConeRay = params.myCheckConeRay;
        this.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = params.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision;
        this.myHorizontalPositionCheckVerticalDirectionType = params.myHorizontalPositionCheckVerticalDirectionType;
        this.myFeetRadius = params.myFeetRadius;
        this.myAdjustVerticalMovementWithSurfaceAngle = params.myAdjustVerticalMovementWithSurfaceAngle;
        this.myCheckVerticalFixedForwardEnabled = params.myCheckVerticalFixedForwardEnabled;
        this.myCheckVerticalFixedForward.vec3_copy(params.myCheckVerticalFixedForward);

        this.mySnapOnGroundEnabled = params.mySnapOnGroundEnabled;
        this.mySnapOnGroundExtraDistance = params.mySnapOnGroundExtraDistance;
        this.mySnapOnCeilingEnabled = params.mySnapOnCeilingEnabled;
        this.mySnapOnCeilingExtraDistance = params.mySnapOnCeilingExtraDistance;

        this.myGroundCircumferenceSliceAmount = params.myGroundCircumferenceSliceAmount;
        this.myGroundCircumferenceStepAmount = params.myGroundCircumferenceStepAmount;
        this.myGroundCircumferenceRotationPerStep = params.myGroundCircumferenceRotationPerStep;
        this.myGroundFixDistanceFromFeet = params.myGroundFixDistanceFromFeet;
        this.myGroundFixDistanceFromHead = params.myGroundFixDistanceFromHead;

        this.myCheckHeight = params.myCheckHeight;
        this.myCheckHeightTop = params.myCheckHeightTop;
        this.myCheckHeightConeOnCollision = params.myCheckHeightConeOnCollision;
        this.myCheckHeightConeOnCollisionKeepHit = params.myCheckHeightConeOnCollisionKeepHit;
        this.myHeightCheckStepAmount = params.myHeightCheckStepAmount;
        this.myCheckVerticalStraight = params.myCheckVerticalStraight;
        this.myCheckVerticalDiagonalRay = params.myCheckVerticalDiagonalRay;
        this.myCheckVerticalDiagonalBorder = params.myCheckVerticalDiagonalBorder;
        this.myCheckVerticalDiagonalBorderRay = params.myCheckVerticalDiagonalBorderRay;
        this.myCheckVerticalSearchFurtherVerticalHit = params.myCheckVerticalSearchFurtherVerticalHit;

        this.myGroundAngleToIgnore = params.myGroundAngleToIgnore;
        this.myCeilingAngleToIgnore = params.myCeilingAngleToIgnore;

        this.myHeight = params.myHeight;

        this.myDistanceToBeOnGround = params.myDistanceToBeOnGround;
        this.myDistanceToComputeGroundInfo = params.myDistanceToComputeGroundInfo;
        this.myDistanceToBeOnCeiling = params.myDistanceToBeOnCeiling;
        this.myDistanceToComputeCeilingInfo = params.myDistanceToComputeCeilingInfo;
        this.myVerticalFixToBeOnGround = params.myVerticalFixToBeOnGround;
        this.myVerticalFixToComputeGroundInfo = params.myVerticalFixToComputeGroundInfo;
        this.myVerticalFixToBeOnCeiling = params.myVerticalFixToBeOnCeiling;
        this.myVerticalFixToComputeCeilingInfo = params.myVerticalFixToComputeCeilingInfo;

        this.mySlidingEnabled = params.mySlidingEnabled;
        this.mySlidingHorizontalMovementCheckBetterNormal = params.mySlidingHorizontalMovementCheckBetterNormal;
        this.mySlidingMaxAttempts = params.mySlidingMaxAttempts;
        this.mySlidingCheckBothDirections = params.mySlidingCheckBothDirections;
        this.mySlidingFlickeringPreventionType = params.mySlidingFlickeringPreventionType;
        this.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding = params.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding;
        this.mySlidingFlickerPreventionCheckAnywayCounter = params.mySlidingFlickerPreventionCheckAnywayCounter;

        this.mySlidingAdjustSign90Degrees = params.mySlidingAdjustSign90Degrees;

        this.myBlockLayerFlags.setMask(params.myBlockLayerFlags.getMask());
        this.myObjectsToIgnore.pp_copy(params.myObjectsToIgnore);

        this.myDebugActive = params.myDebugActive;

        this.myDebugHorizontalMovementActive = params.myDebugHorizontalMovementActive;
        this.myDebugHorizontalPositionActive = params.myDebugHorizontalPositionActive;
        this.myDebugVerticalMovementActive = params.myDebugVerticalMovementActive;
        this.myDebugVerticalPositionActive = params.myDebugVerticalPositionActive;
        this.myDebugSlidingActive = params.myDebugSlidingActive;
        this.myDebugSurfaceInfoActive = params.myDebugSurfaceInfoActive;
        this.myDebugRuntimeParamsActive = params.myDebugRuntimeParamsActive;
        this.myDebugMovementActive = params.myDebugMovementActive;
    }
};

CollisionRuntimeParams = class CollisionRuntimeParams {
    constructor() {
        this.myOriginalPosition = PP.vec3_create();
        this.myNewPosition = PP.vec3_create();

        this.myOriginalHeight = 0;

        this.myOriginalForward = PP.vec3_create();
        this.myOriginalUp = PP.vec3_create();

        this.myOriginalMovement = PP.vec3_create();
        this.myFixedMovement = PP.vec3_create();

        this.myLastValidOriginalHorizontalMovement = PP.vec3_create();
        this.myLastValidOriginalVerticalMovement = PP.vec3_create();

        this.myIsOnGround = false;
        this.myGroundAngle = 0;
        this.myGroundPerceivedAngle = 0;
        this.myGroundNormal = PP.vec3_create();

        this.myIsOnCeiling = false;
        this.myCeilingAngle = 0;
        this.myCeilingPerceivedAngle = 0;
        this.myCeilingNormal = PP.vec3_create();

        this.myHorizontalMovementCanceled = false; // could add HorizontalMovementCanceledReason
        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit = new PP.RaycastHit();

        this.myVerticalMovementCanceled = false;
        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit = new PP.RaycastHit();

        this.myHasSnappedOnGround = false;
        this.myHasSnappedOnCeiling = false;
        this.myHasFixedPositionGround = false;
        this.myHasFixedPositionCeiling = false;

        this.myIsSliding = false;
        this.myIsSlidingIntoOppositeDirection = false;
        this.myIsSlidingFlickerPrevented = false;
        this.mySlidingFlickerPreventionCheckAnywayCounter = 0;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit = new PP.RaycastHit();
        this.mySliding90DegreesSign = 0;
        this.mySlidingRecompute90DegreesSign = true;
        this.myLastValidIsSliding = false;
        this.mySlidingPreviousHorizontalMovement = PP.vec3_create();

        this.myOriginalTeleportPosition = PP.vec3_create();
        this.myFixedTeleportPosition = PP.vec3_create();

        this.myOriginalPositionCheckPosition = PP.vec3_create();
        this.myFixedPositionCheckPosition = PP.vec3_create();

        this.myTeleportCanceled = false;

        this.myIsPositionOk = false;

        this.myIsTeleport = false; // could be a single bool but not sure if there should be an option and don't want to create an enum for now
        this.myIsMove = false;
        this.myIsPositionCheck = false;
        this.myIsPositionCheckAllowFix = false;
    }

    reset() {
        this.myOriginalPosition.vec3_zero();
        this.myNewPosition.vec3_zero();

        this.myOriginalHeight = 0;

        this.myOriginalForward.vec3_zero();
        this.myOriginalUp.vec3_zero();

        this.myOriginalMovement.vec3_zero();
        this.myFixedMovement.vec3_zero();

        this.myLastValidOriginalHorizontalMovement.vec3_zero();
        this.myLastValidOriginalVerticalMovement.vec3_zero();

        this.myIsOnGround = false;
        this.myGroundAngle = 0;
        this.myGroundPerceivedAngle = 0;
        this.myGroundNormal.vec3_zero();

        this.myIsOnCeiling = false;
        this.myCeilingAngle = 0;
        this.myCeilingPerceivedAngle = 0;
        this.myCeilingNormal.vec3_zero();

        this.myHorizontalMovementCanceled = false;
        this.myIsCollidingHorizontally = false;
        this.myHorizontalCollisionHit.reset();

        this.myVerticalMovementCanceled = false;
        this.myIsCollidingVertically = false;
        this.myVerticalCollisionHit.reset();

        this.myHasSnappedOnGround = false;
        this.myHasSnappedOnCeiling = false;
        this.myHasFixedPositionGround = false;
        this.myHasFixedPositionCeiling = false;

        this.myIsSliding = false;
        this.myIsSlidingIntoOppositeDirection = false;
        this.myIsSlidingFlickerPrevented = false;
        this.mySlidingFlickerPreventionCheckAnywayCounter = 0;
        this.mySlidingMovementAngle = 0;
        this.mySlidingCollisionAngle = 0;
        this.mySlidingCollisionHit.reset();
        this.mySliding90DegreesSign = 0;
        this.mySlidingRecompute90DegreesSign = true;
        this.myLastValidIsSliding = false;
        this.mySlidingPreviousHorizontalMovement.vec3_zero();

        this.myOriginalTeleportPosition.vec3_zero();
        this.myFixedTeleportPosition.vec3_zero();

        this.myOriginalPositionCheckPosition.vec3_zero();
        this.myFixedPositionCheckPosition.vec3_zero();

        this.myTeleportCanceled = false;

        this.myIsPositionOk = false;

        this.myIsTeleport = false;
        this.myIsMove = false;
        this.myIsPositionCheck = false;
        this.myIsPositionCheckAllowFix = false;
    }

    copy(other) {
        this.myOriginalPosition.vec3_copy(other.myOriginalPosition);
        this.myNewPosition.vec3_copy(other.myNewPosition);

        this.myOriginalHeight = other.myOriginalHeight;

        this.myOriginalForward.vec3_copy(other.myOriginalForward);
        this.myOriginalUp.vec3_copy(other.myOriginalUp);

        this.myOriginalMovement.vec3_copy(other.myOriginalMovement);
        this.myFixedMovement.vec3_copy(other.myFixedMovement);

        this.myLastValidOriginalHorizontalMovement.vec3_copy(other.myLastValidOriginalHorizontalMovement);
        this.myLastValidOriginalVerticalMovement.vec3_copy(other.myLastValidOriginalVerticalMovement);

        this.myIsOnGround = other.myIsOnGround;
        this.myGroundAngle = other.myGroundAngle;
        this.myGroundPerceivedAngle = other.myGroundPerceivedAngle;
        this.myGroundNormal.vec3_copy(other.myGroundNormal);

        this.myIsOnCeiling = other.myIsOnCeiling;
        this.myCeilingAngle = other.myCeilingAngle;
        this.myCeilingPerceivedAngle = other.myCeilingPerceivedAngle;
        this.myCeilingNormal.vec3_copy(other.myCeilingNormal);

        this.myHorizontalMovementCanceled = other.myHorizontalMovementCanceled;
        this.myIsCollidingHorizontally = other.myIsCollidingHorizontally;
        this.myHorizontalCollisionHit.copy(other.myHorizontalCollisionHit);

        this.myVerticalMovementCanceled = other.myVerticalMovementCanceled;
        this.myIsCollidingVertically = other.myIsCollidingVertically;
        this.myVerticalCollisionHit.copy(other.myVerticalCollisionHit);

        this.myHasSnappedOnGround = other.myHasSnappedOnGround;
        this.myHasSnappedOnCeiling = other.myHasSnappedOnCeiling;
        this.myHasFixedPositionGround = other.myHasFixedPositionGround;
        this.myHasFixedPositionCeiling = other.myHasFixedPositionCeiling;

        this.myIsSliding = other.myIsSliding;
        this.myIsSlidingIntoOppositeDirection = other.myIsSlidingIntoOppositeDirection;
        this.myIsSlidingFlickerPrevented = other.myIsSlidingFlickerPrevented;
        this.mySlidingFlickerPreventionCheckAnywayCounter = other.mySlidingFlickerPreventionCheckAnywayCounter;
        this.mySlidingMovementAngle = other.mySlidingMovementAngle;
        this.mySlidingCollisionAngle = other.mySlidingCollisionAngle;
        this.mySlidingCollisionHit.copy(other.mySlidingCollisionHit);
        this.mySliding90DegreesSign = other.mySliding90DegreesSign;
        this.mySlidingRecompute90DegreesSign = other.mySlidingRecompute90DegreesSign;
        this.myLastValidIsSliding = other.myLastValidIsSliding;
        this.mySlidingPreviousHorizontalMovement.vec3_copy(other.mySlidingPreviousHorizontalMovement);

        this.myOriginalTeleportPosition.vec3_copy(other.myOriginalTeleportPosition);
        this.myFixedTeleportPosition.vec3_copy(other.myFixedTeleportPosition);
        this.myTeleportCanceled = other.myTeleportCanceled;

        this.myIsPositionOk = other.myIsPositionOk;

        this.myOriginalPositionCheckPosition.vec3_copy(other.myOriginalPositionCheckPosition);
        this.myFixedPositionCheckPosition.vec3_copy(other.myFixedPositionCheckPosition);

        this.myIsTeleport = other.myIsTeleport;
        this.myIsMove = other.myIsMove;
        this.myIsPositionCheck = other.myIsPositionCheck;
        this.myIsPositionCheckAllowFix = other.myIsPositionCheckAllowFix;
    }
};