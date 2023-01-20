PP.CharacterCollisionResults = class CharacterCollisionResults {
    constructor() {
        this.myCheckType = PP.CharacterCollisionCheckType.NONE;

        this.myTransformResults = new PP.CharacterCollisionTransformResults();

        this.myMovementResults = new PP.CharacterCollisionMovementResults();
        this.myHorizontalMovementResults = new PP.CharacterCollisionMovementResults();
        this.myVerticalMovementResults = new PP.CharacterCollisionMovementResults();

        this.myTeleportResults = new PP.CharacterCollisionTeleportResults();

        this.myCheckTransformResults = new PP.CharacterCollisionCheckTransformResults();

        this.mySlideResults = new PP.CharacterCollisionSlideResults();

        this.myGroundInfo = new PP.CharacterCollisionSurfaceInfo();
        this.myCeilingInfo = new PP.CharacterCollisionSurfaceInfo();

        this.myVerticalAdjustmentsResults = new PP.CharacterCollisionVerticalAdjustmentsResults();

        this.mySplitMovementResults = new PP.CharacterCollisionSplitMovementResults();

        this.myInternalResults = new PP.CharacterCollisionInternalResults();
    }

    reset() {
        this.myCheckType = PP.CharacterCollisionCheckType.NONE;

        this.myTransformResults.reset();

        this.myMovementResults.reset();
        this.myHorizontalMovementResults.reset();
        this.myVerticalMovementResults.reset();

        this.myTeleportResults.reset();

        this.myCheckTransformResults.reset();

        this.mySlideResults.reset();

        this.myGroundInfo.reset();
        this.myCeilingInfo.reset();

        this.myVerticalAdjustmentsResults.reset();

        this.mySplitMovementResults.reset();

        this.myInternalResults.reset();
    }

    copy(other) {
        this.myCheckType = other.myCheckType;

        this.myTransformResults.copy(other.myTransformResults);

        this.myMovementResults.copy(other.myMovementResults);
        this.myHorizontalMovementResults.copy(other.myHorizontalMovementResults);
        this.myVerticalMovementResults.copy(other.myVerticalMovementResults);

        this.myTeleportResults.copy(other.myTeleportResults);

        this.myCheckTransformResults.copy(other.myCheckTransformResults);

        this.mySlideResults.copy(other.mySlideResults);

        this.myGroundInfo.copy(other.myGroundInfo);
        this.myCeilingInfo.copy(other.myCeilingInfo);

        this.myVerticalAdjustmentsResults.copy(other.myVerticalAdjustmentsResults);

        this.mySplitMovementResults.copy(other.mySplitMovementResults);

        this.myInternalResults.copy(other.myInternalResults);
    }
};

PP.CharacterCollisionCheckType = {
    NONE: 0,
    CHECK_MOVEMENT: 1,
    CHECK_TELEPORT: 2,
    CHECK_TRANSFORM: 3,
    UPDATE_SURFACE_INFO: 4,
    UPDATE_GROUND_INFO: 5,
    UPDATE_CEILING_INFO: 6
};

PP.CharacterCollisionSurfaceInfo = class CharacterCollisionSurfaceInfo {
    constructor() {
        this.myIsOnSurface = false;
        this.mySurfaceAngle = 0;
        this.mySurfacePerceivedAngle = 0;
        this.mySurfaceNormal = PP.vec3_create();
    }

    reset() {
        this.myIsOnSurface = false;
        this.mySurfaceAngle = 0;
        this.mySurfacePerceivedAngle = 0;
        this.mySurfaceNormal.vec3_zero();
    }

    copy(other) {
        this.myIsOnSurface = other.myIsOnSurface;
        this.mySurfaceAngle = other.mySurfaceAngle;
        this.mySurfacePerceivedAngle = other.mySurfacePerceivedAngle;
        this.mySurfaceNormal.vec3_copy(other.mySurfaceNormal);
    }
};

PP.CharacterCollisionSlideResults = class CharacterCollisionSlideResults {
    constructor() {
        this.myHasSlid = false;
        this.mySlideMovementAngle = 0;
        this.mySlideSurfaceAngle = 0;
        this.mySlideSurfaceNormal = PP.vec3_create();
    }

    reset() {
        this.myHasSlid = false;
        this.mySlideMovementAngle = 0;
        this.mySlideSurfaceAngle = 0;
        this.mySlideSurfaceNormal.vec3_zero();
    }

    copy(other) {
        this.myHasSlid = other.myHasSlid;
        this.mySlideMovementAngle = other.mySlideMovementAngle;
        this.mySlideSurfaceAngle = other.mySlideSurfaceAngle;
        this.mySlideSurfaceNormal.vec3_copy(other.mySlideSurfaceNormal);
    }
};

PP.CharacterCollisionTransformResults = class CharacterCollisionMovementResults {
    constructor() {
        this.myStartTransformQuat = PP.quat2_create();
        this.myEndTransformQuat = PP.quat2_create();
    }

    reset() {
        this.myStartTransformQuat.quat2_identity();
        this.myEndTransformQuat.quat2_identity();
    }

    copy(other) {
        this.myStartTransformQuat.quat2_copy(other.myStartTransformQuat);
        this.myEndTransformQuat.quat2_copy(other.myEndTransformQuat);
    }
};

PP.CharacterCollisionMovementResults = class CharacterCollisionMovementResults {
    constructor() {
        this.myStartMovement = PP.vec3_create();
        this.myEndMovement = PP.vec3_create();
        this.myMovementFailed = false;
        this.myIsColliding = false;
        this.myReferenceCollisionHit = new PP.RaycastHit();
    }

    reset() {
        this.myStartMovement.vec3_zero();
        this.myEndMovement.vec3_zero();
        this.myMovementFailed = false;
        this.myIsColliding = false;
        this.myReferenceCollisionHit.reset();
    }

    copy(other) {
        this.myStartMovement.vec3_copy(other.myStartMovement);
        this.myEndMovement.vec3_copy(other.myEndMovement);
        this.myMovementFailed = other.myMovementFailed;
        this.myIsColliding = other.myIsColliding;
        this.myReferenceCollisionHit.copy(other.myReferenceCollisionHit);
    }
};

PP.CharacterCollisionTeleportResults = class CharacterCollisionTeleportResults {
    constructor() {
        this.myStartTeleportTransformQuat = PP.quat2_create();
        this.myEndTeleportTransformQuat = PP.quat2_create();
        this.myTeleportFailed = false;
    }

    reset() {
        this.myStartTeleportTransformQuat.quat2_identity();
        this.myEndTeleportTransformQuat.quat2_identity();
        this.myTeleportFailed = false;
    }

    copy(other) {
        this.myStartTeleportTransformQuat.quat2_copy(other.myStartTeleportTransformQuat);
        this.myEndTeleportTransformQuat.quat2_copy(other.myEndTeleportTransformQuat);
        this.myTeleportFailed = other.myTeleportFailed;
    }
};

PP.CharacterCollisionCheckTransformResults = class CharacterCollisionCheckTransformResults {
    constructor() {
        this.myStartCheckTransformQuat = PP.quat2_create();
        this.myEndCheckTransformQuat = PP.quat2_create();
        this.myCheckTransformFailed = false;
    }

    reset() {
        this.myStartCheckTransformQuat.quat2_identity();
        this.myEndCheckTransformQuat.quat2_identity();
        this.myCheckTransformFailed = false;
    }

    copy(other) {
        this.myStartCheckTransformQuat.quat2_copy(other.myStartCheckTransformQuat);
        this.myEndCheckTransformQuat.quat2_copy(other.myEndCheckTransformQuat);
        this.myCheckTransformFailed = other.myCheckTransformFailed;
    }
};

PP.CharacterCollisionVerticalAdjustmentsResults = class CharacterCollisionCheckTransformResults {
    constructor() {
        this.myHasSnappedOnGround = false;
        this.myHasPoppedOutGround = false;

        this.myHasSnappedOnCeiling = false;
        this.myHasPoppedOutCeiling = false;

        this.myHasReducedVerticalMovement = false;

        this.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle = false;
        this.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle = false;
    }

    reset() {
        this.myHasSnappedOnGround = false;
        this.myHasPoppedOutGround = false;

        this.myHasSnappedOnCeiling = false;
        this.myHasPoppedOutCeiling = false;

        this.myHasReducedVerticalMovement = false;

        this.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle = false;
        this.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle = false;
    }

    copy(other) {
        this.myHasSnappedOnGround = other.myHasSnappedOnGround;
        this.myHasPoppedOutGround = other.myHasPoppedOutGround;

        this.myHasSnappedOnCeiling = other.myHasSnappedOnCeiling;
        this.myHasPoppedOutCeiling = other.myHasPoppedOutCeiling;

        this.myHasReducedVerticalMovement = other.myHasReducedVerticalMovement;

        this.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle = other.myHasAddedVerticalMovementBasedOnGroundPerceivedAngle;
        this.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle = other.myHasAddedVerticalMovementBasedOnCeilingPerceivedAngle;
    }
};

PP.CharacterCollisionSplitMovementResults = class CharacterCollisionSplitMovementResults {
    constructor() {
        this.mySplitMovementSteps = 0;
        this.mySplitMovementStepsPerformed = 0;
        this.mySplitMovementInterrupted = false;
        this.mySplitMovementMovementChecked = PP.vec3_create();
    }

    reset() {
        this.mySplitMovementSteps = 0;
        this.mySplitMovementStepsPerformed = 0;
        this.mySplitMovementInterrupted = false;
        this.mySplitMovementMovementChecked.vec3_zero();
    }

    copy(other) {
        this.mySplitMovementSteps = other.mySplitMovementSteps;
        this.mySplitMovementStepsPerformed = other.mySplitMovementStepsPerformed;
        this.mySplitMovementInterrupted = other.mySplitMovementInterrupted;
        this.mySplitMovementMovementChecked.vec3_copy(other.mySplitMovementMovementChecked);
    }
};

PP.CharacterCollisionInternalResults = class CharacterCollisionSplitMovementResults {
    constructor() {
        this.myLastRelevantStartHorizontalMovement = PP.vec3_create();
        this.myLastRelevantEndHorizontalMovement = PP.vec3_create();

        this.myLastRelevantStartVerticalMovement = PP.vec3_create();
        this.myLastRelevantEndVerticalMovement = PP.vec3_create();

        this.myLastRelevantHasSlid = false;
        this.myHasSlidTowardOppositeDirection = false;
        this.myLastRelevantSlideFlickerPrevented = false;
        this.mySlideFlickerPreventionForceCheckCounter = 0;
        this.mySlide90DegreesDirectionSign = 0;
        this.mySlide90DegreesRecomputeDirectionSign = true;
    }

    reset() {
        this.myLastRelevantStartHorizontalMovement.vec3_zero();
        this.myLastRelevantEndHorizontalMovement.vec3_zero();

        this.myLastRelevantStartVerticalMovement.vec3_zero();
        this.myLastRelevantEndVerticalMovement.vec3_zero();

        this.myLastRelevantHasSlid = false;
        this.myHasSlidTowardOppositeDirection = false;
        this.myLastRelevantSlideFlickerPrevented = false;
        this.mySlideFlickerPreventionForceCheckCounter = 0;
        this.mySlide90DegreesDirectionSign = 0;
        this.mySlide90DegreesRecomputeDirectionSign = true;
    }

    copy(other) {
        this.myLastRelevantStartHorizontalMovement.vec3_copy(other.myLastRelevantStartHorizontalMovement);
        this.myLastRelevantEndHorizontalMovement.vec3_copy(other.myLastRelevantEndHorizontalMovement);

        this.myLastRelevantStartVerticalMovement.vec3_copy(other.myLastRelevantStartVerticalMovement);
        this.myLastRelevantEndVerticalMovement.vec3_copy(other.myLastRelevantEndVerticalMovement);

        this.myLastRelevantHasSlid = other.myLastRelevantHasSlid;
        this.myHasSlidTowardOppositeDirection = other.myHasSlidTowardOppositeDirection;
        this.myLastRelevantSlideFlickerPrevented = other.myLastRelevantSlideFlickerPrevented;
        this.mySlideFlickerPreventionForceCheckCounter = other.mySlideFlickerPreventionForceCheckCounter;
        this.mySlide90DegreesDirectionSign = other.mySlide90DegreesDirectionSign;
        this.mySlide90DegreesRecomputeDirectionSign = other.mySlide90DegreesRecomputeDirectionSign;
    }
};