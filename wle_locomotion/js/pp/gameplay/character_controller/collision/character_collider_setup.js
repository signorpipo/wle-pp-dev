PP.CharacterColliderSetup = class CharacterColliderSetup {
    constructor() {
        this.myHeight = 0;

        this.myPositionOffsetLocal = PP.vec3_create();
        this.myRotationOffsetLocalQuat = PP.quat_create();

        this.myHorizontalCheckSetup = new PP.CharacterColliderHorizontalCheckSetup();
        this.myVerticalCheckSetup = new PP.CharacterColliderVerticalCheckSetup();

        this.mySlideSetup = new PP.CharacterColliderSlideSetup();

        this.myGroundSetup = new PP.CharacterColliderSurfaceSetup();
        this.myCeilingSetup = new PP.CharacterColliderSurfaceSetup();

        this.mySplitMovementSetup = new PP.CharacterColliderSplitMovementSetup();

        this.myDebugSetup = new PP.CharacterColliderDebugSetup();
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderHorizontalPositionVerticalCheckDirection = {
    UPWARD: 0,      // gives less issues with a ground based movement, but may also collide a bit more, resulting in less sliding
    DOWNWARD: 1,    // gives less issues with a ceiling based movement (unusual), but may also collide a bit more, resulting in less sliding and more stuck in front of a wall
    BOTH: 2         // check both directions, more expensive (2x checks) and better prevent collisions, sliding more, but is more expensive and gives more issues           

    //                                                                                                                                                  _
    // the issues means that a small step at the end of a slope, maybe due to 2 rectangles, one for the floor and the other for the slope like this -> /   
    // can create a small step if the floor rectangle is a bit above the end of the slope, this will make the character get stuck thinking it's a wall
    // BOTH do a more "aggressive" vertical check that makes the character get less stuck in other situations, but can get stuck in this one
    // the better solution is to properly create the level, and if possible combine the 2 rectangles by having the floor a little below the end of the slope (like this -> /-)
    // the step that is created "on the other side" in fact can easily be ignored thanks to the myHorizontalCheckFeetDistanceToIgnore param
    // if the level is properly created the best solution should be UPWARD
    // and also myHorizontalPositionVerticalCheckIgnoreHitsInsideCollision = false
}

PP.CharacterColliderHorizontalCheckSetup = class CharacterColliderHorizontalCheckSetup {
    constructor() {
        this.myHorizontalCheckConeRadius = 0;
        this.myHorizontalCheckConeHalfAngle = 0;

        this.myHorizontalHeightCheckEnabled = false;
        this.myHorizontalHeightCheckSteps = 0;
        this.myHorizontalHeightVerticalCheckEnabled = false;
        this.myHorizontalHeightHorizontalCheckEnabled = false;

        this.myHorizontalCheckFeetDistanceToIgnore = 0;
        this.myHorizontalCheckHeadDistanceToIgnore = 0;
        // these distances can be used to make the character ignore small steps, like a stair step, so they can move on it
        // it also needs the surface pop out to be enabeld to then snap on the step

        this.myHorizontalCheckFixedForwardEnabled = false; // this is basically only useful if the cone angle is 180 degrees
        this.myHorizontalCheckFixedForward = PP.vec3_create();

        this.myHorizontalMovementCheckEnabled = false;

        this.myHorizontalMovementCheckSplitMovementEnabled = false;
        this.myHorizontalMovementCheckSplitMovementMaxSteps = null;
        this.myHorizontalMovementCheckSplitMovementMaxStepLength = null;
        this.myHorizontalMovementCheckSplitMovementMinStepLength = null;

        this.myHorizontalMovementCheckRadialSteps = 0;

        this.myHorizontalMovementHorizontalRadialCheckEnabled = false;
        this.myHorizontalMovementHorizontalDiagonalOutwardCheckEnabled = false;
        this.myHorizontalMovementHorizontalDiagonalInwardCheckEnabled = false;
        this.myHorizontalMovementHorizontalStraightCheckEnabled = false;
        this.myHorizontalMovementHorizontalStraightCentralCheckEnabled = false;

        this.myHorizontalMovementVerticalRadialDiagonalOutwardCheckEnabled = false;
        this.myHorizontalMovementVerticalRadialDiagonalInwardCheckEnabled = false;

        this.myHorizontalMovementVerticalDiagonalOutwardUpwardCheckEnabled = false;
        this.myHorizontalMovementVerticalDiagonalOutwardDownwardCheckEnabled = false;
        this.myHorizontalMovementVerticalDiagonalInwardUpwardCheckEnabled = false;
        this.myHorizontalMovementVerticalDiagonalInwardDownwardCheckEnabled = false;

        this.myHorizontalMovementVerticalStraightCheckEnabled = false;
        this.myHorizontalMovementVerticalStraightCentralCheckEnabled = false;
        this.myHorizontalMovementVerticalStraightDiagonalUpwardCheckEnabled = false;
        this.myHorizontalMovementVerticalStraightDiagonalUpwardCentralCheckEnabled = false;
        this.myHorizontalMovementVerticalStraightDiagonalDownwardCheckEnabled = false;
        this.myHorizontalMovementVerticalStraightDiagonalDownwardCentralCheckEnabled = false;

        this.myHorizontalPositionCheckEnabled = false;
        this.myHorizontalPositionCheckConeHalfSlices = 0;
        this.myHorizontalPositionHorizontalBorderCheckEnabled = false;
        this.myHorizontalPositionHorizontalRadialCheckEnabled = false;

        this.myHorizontalPositionVerticalStraightCheckEnabled = false;
        this.myHorizontalPositionVerticalStraightCentralCheckEnabled = false;
        this.myHorizontalPositionVerticalRadialDiagonalOutwardCheckEnabled = false;
        this.myHorizontalPositionVerticalRadialDiagonalInwardCheckEnabled = false;
        this.myHorizontalPositionVerticalBorderDiagonalOutwardCheckEnabled = false;
        this.myHorizontalPositionVerticalBorderDiagonalInwardCheckEnabled = false;
        this.myHorizontalPositionVerticalRadialBorderDiagonalUpwardCheckEnabled = false;
        this.myHorizontalPositionVerticalRadialBorderDiagonalDownwardCheckEnabled = false;

        this.myHorizontalPositionVerticalCheckSearchFarthestHit = false; //somewhat expensive, but can help fix sime sliding issues

        this.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHit = false;
        this.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHitKeepVerticalHitIfNoHorizontalHit = false;
        // if the horizontal check does not hit the vertical hit will be restored
        // the fact that the horizontal does not hit could be due to the fact that it thinks that the collision can be ignored
        // so restoring the vertical hit can be a bit safer (since u are actually colliding) but also can lead to false positive

        this.myHorizontalPositionVerticalCheckIgnoreHitsInsideCollision = false; // true gives less issues, but may also collide a bit more, resulting in less sliding
        this.myHorizontalPositionVerticalCheckDirection = PP.CharacterColliderHorizontalPositionVerticalCheckDirection.UPWARD;

        this.myHorizontalCheckBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myHorizontalCheckObjectsToIgnore = [];
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderVerticalCheckSetup = class CharacterColliderVerticalCheckSetup {
    constructor() {
        this.myVerticalCheckCircumferenceRadius = 0;

        this.myVerticalCheckCircumferenceSlices = 0;
        this.myVerticalCheckCircumferenceCentralCheckEnabled = false;
        this.myVerticalCheckCircumferenceRadialSteps = 0;
        this.myVerticalCheckCircumferenceRotationPerRadialStepDegrees = 0;

        this.myVerticalCheckFixedForwardEnabled = false;
        this.myVerticalCheckFixedForward = PP.vec3_create();

        this.myVerticalMovementCheckEnabled = false;
        this.myVerticalMovementCheckReductionEnabled = false;
        this.myVerticalMovementCheckPerformCheckTowardBothDirections = false;

        this.myVerticalPositionCheckEnabled = false;

        this.myVerticalCheckAllowHitsInsideCollisionIfOneValid = false;
        // if at least one vertical raycast is valid (no hit, outside collision) is it ok if the other checks are completely inside a collision
        // let you keep moving vertically if only partially inside a wall

        this.myVerticalCheckBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myVerticalCheckObjectsToIgnore = [];
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderSlideFlickerPreventionMode = {
    NONE: 0,
    USE_PREVIOUS_RESULTS: 1,                // allow some flicker before stabilizing but avoid stopping for a 1 frame flicker only (false positive), is also less expensive
    COLLISION_ANGLE_ABOVE_90_DEGREES: 2,    // prevents most flicker apart those on almost flat surface, can have some false positive, always check when sliding into opposite direction
    COLLISION_ANGLE_ABOVE_90_DEGREES_OR_MOVEMENT_ANGLE_ABOVE_85_DEGREES: 3, // less flicker than COLLISION_ANGLE_ABOVE_90_DEGREES but more false positive, always check when sliding into opposite direction
    ALWAYS: 4,                              // less flicker than COLLISION_ANGLE_ABOVE_90_DEGREES_OR_MOVEMENT_ANGLE_ABOVE_85_DEGREES but more false positive
};

PP.CharacterColliderSlideSetup = class CharacterColliderSlideSetup {
    constructor() {
        this.mySlideEnabled = false;

        this.mySlideMaxAttempts = 0;

        this.mySlideHorizontalMovementCheckBetterReferenceHit = false;
        // if the horizontal movement finds a hit it stops looking, but could end up having a bad reference collision hit
        // this makes it so it will check a better hit to use later for the slide

        this.mySlideCheckBothDirections = false;
        // expensive, 2 times the checks since it basically check again on the other slide direction
        // this can fix some edge cases in which u can get stuck instead of sliding
        // it basically require that u also add flicker prevention

        this.mySlideFlickerPreventionMode = PP.CharacterColliderSlideFlickerPreventionMode.NONE;

        this.mySlideFlickerPreventionCheckOnlyIfAlreadySliding = false;
        // this flag make it so the prevention is done only if it was already sliding
        // this can lead to a few frames of flicker if u go toward a corner directly, but allow the movement to be more fluid, avoiding getting stuck and false positive

        this.mySlideFlickerPreventionForceCheckCounter = 0;
        // if the collision think it needs to check for flicker, it will keep checking for the next X frames based on this value even if the condition are not met anymore
        // this help in catching the flicker when the direction is not changing every frame but every 2-3 for example
        // it's especially useful if combo-ed with CharacterColliderSlideFlickerPreventionMode.USE_PREVIOUS_RESULTS, making it a bit less fluid but also less flickering

        this.mySlide90DegreesAdjustDirectionSign = false;
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderSurfaceSetup = class CharacterColliderSurfaceSetup {
    constructor() {
        this.mySurfaceSnapEnabled = false;
        this.mySurfaceSnapMaxDistance = 0;

        this.mySurfacePopOutEnabled = false;
        this.mySurfacePopOutMaxDistance = 0;

        this.mySurfaceAngleToIgnore = 0;
        this.mySurfaceAngleToIgnoreWithSurfacePerceivedAngle = 0;
        // between this value and myAngleToIgnore, use the perceived angle to see if u can actually ignore the surface
        // this basically means that on steep surface u could still go up by moving diagonally

        this.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalMovement = null;
        this.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalPosition = null;
        // if the collision with the surface is above this max value, even if the surface angle is ignorable do not ignore it

        this.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft = null;
        // if the collision with the surface happens during the horizontal movement check, if the horizontal movement left (total movement to perform minus hit distance)
        // is above this value do not ignore it otherwise you would ignore a surface but are actually going too much inside it

        this.myAddVerticalMovementBasedOnSurfacePerceivedAngle = false;

        this.myGatherSurfaceInfo = false;

        this.myIsOnSurfaceMaxOutsideDistance = 0;
        this.myIsOnSurfaceMaxInsideDistance = 0;
        this.myIsOnSurfaceIfInsideSurface = false;

        this.myGatherSurfaceNormalMaxOutsideDistance = 0;
        this.myGatherSurfaceNormalMaxInsideDistance = 0;

        this.myIsOnInvalidSurfacePerceivedAngleAllowExitAttempt = false;
        // if u start on an invalid perceived angle (above angle to ignore) u normally can't even try to move uphill, this will let you try and see if with that movement
        // you could end up in a valid perceived angle position

        this.myMustRemainOnSurface = false;
        this.myMustRemainOnValidSurfaceAngleDownhill = false;
        // normally you can move downhill on whatever angle, but you may want the character to stay on an angle that will be valid even if u turn to go back uphill

        this.myRegatherSurfaceInfoOnSurfaceCheckFailed = false;
        // instead of copying the previous surface info on fail, regather them
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderSplitMovementSetup = class CharacterColliderSplitMovementSetup {
    constructor() {
        this.mySplitMovementEnabled = false;

        this.mySplitMovementMaxSteps = null;
        this.mySplitMovementMaxStepLength = null;
        this.mySplitMovementMinStepLength = null;

        this.mySplitMovementStopOnHorizontalMovementFailed = false;
        this.mySplitMovementStopOnVerticalMovementFailed = false;
        this.mySplitMovementStopOnCallback = null;                        // Signature: callback(collisionRuntimeParams) -> bool
        this.mySplitMovementStopReturnPreviousResults = false;
    }

    copy(other) {
        // implemented outside class definition
    }
};

PP.CharacterColliderDebugSetup = class CharacterColliderDebugSetup {
    constructor() {
        this.myDebugActive = false;

        this.myDebugMovementActive = false;

        this.myDebugHorizontalMovementCheckActive = false;
        this.myDebugHorizontalPositionCheckActive = false;

        this.myDebugVerticalMovementCheckActive = false;
        this.myDebugVerticalPositionCheckActive = false;

        this.myDebugSlideActive = false;

        this.myDebugGroundInfoActive = false;
        this.myDebugCeilingInfoActive = false;

        this.myDebugResultsActive = false;
    }

    copy(other) {
        // implemented outside class definition
    }
};



// IMPLEMENTATION

PP.CharacterColliderSetup.prototype.copy = function (other) {
    this.myHeight = other.myHeight;

    this.myPositionOffsetLocal.vec3_copy(other.myPositionOffsetLocal);
    this.myRotationOffsetLocalQuat.quat_copy(other.myRotationOffsetLocalQuat);

    this.myHorizontalCheckSetup.copy(other.myHorizontalCheckSetup);
    this.myVerticalCheckSetup.copy(other.myVerticalCheckSetup);

    this.mySlideSetup.copy(other.mySlideSetup);

    this.myGroundSetup.copy(other.myGroundSetup);
    this.myCeilingSetup.copy(other.myCeilingSetup);

    this.mySplitMovementSetup.copy(other.mySplitMovementSetup);

    this.myDebugSetup.copy(other.myDebugSetup);
};

PP.CharacterColliderHorizontalCheckSetup.prototype.copy = function (other) {
    this.myHorizontalCheckConeRadius = other.myHorizontalCheckConeRadius;
    this.myHorizontalCheckConeHalfAngle = other.myHorizontalCheckConeHalfAngle;

    this.myHorizontalHeightCheckEnabled = other.myHorizontalHeightCheckEnabled;
    this.myHorizontalHeightCheckSteps = other.myHorizontalHeightCheckSteps;
    this.myHorizontalHeightVerticalCheckEnabled = other.myHorizontalHeightVerticalCheckEnabled;
    this.myHorizontalHeightHorizontalCheckEnabled = other.myHorizontalHeightHorizontalCheckEnabled;

    this.myHorizontalCheckFeetDistanceToIgnore = other.myHorizontalCheckFeetDistanceToIgnore;
    this.myHorizontalCheckHeadDistanceToIgnore = other.myHorizontalCheckHeadDistanceToIgnore;

    this.myHorizontalCheckFixedForwardEnabled = other.myHorizontalCheckFixedForwardEnabled;
    this.myHorizontalCheckFixedForward.vec3_copy(other.myHorizontalCheckFixedForward);

    this.myHorizontalMovementCheckEnabled = other.myHorizontalMovementCheckEnabled;

    this.myHorizontalMovementCheckSplitMovementEnabled = other.myHorizontalMovementCheckSplitMovementEnabled;
    this.myHorizontalMovementCheckSplitMovementMaxSteps = other.myHorizontalMovementCheckSplitMovementMaxSteps;
    this.myHorizontalMovementCheckSplitMovementMaxStepLength = other.myHorizontalMovementCheckSplitMovementMaxStepLength;
    this.myHorizontalMovementCheckSplitMovementMinStepLength = other.myHorizontalMovementCheckSplitMovementMinStepLength;

    this.myHorizontalMovementCheckRadialSteps = other.myHorizontalMovementCheckRadialSteps;

    this.myHorizontalMovementHorizontalRadialCheckEnabled = other.myHorizontalMovementHorizontalRadialCheckEnabled;
    this.myHorizontalMovementHorizontalDiagonalOutwardCheckEnabled = other.myHorizontalMovementHorizontalDiagonalOutwardCheckEnabled;
    this.myHorizontalMovementHorizontalDiagonalInwardCheckEnabled = other.myHorizontalMovementHorizontalDiagonalInwardCheckEnabled;
    this.myHorizontalMovementHorizontalStraightCheckEnabled = other.myHorizontalMovementHorizontalStraightCheckEnabled;
    this.myHorizontalMovementHorizontalStraightCentralCheckEnabled = other.myHorizontalMovementHorizontalStraightCentralCheckEnabled;

    this.myHorizontalMovementVerticalRadialDiagonalOutwardCheckEnabled = other.myHorizontalMovementVerticalRadialDiagonalOutwardCheckEnabled;
    this.myHorizontalMovementVerticalRadialDiagonalInwardCheckEnabled = other.myHorizontalMovementVerticalRadialDiagonalInwardCheckEnabled;

    this.myHorizontalMovementVerticalDiagonalOutwardUpwardCheckEnabled = other.myHorizontalMovementVerticalDiagonalOutwardUpwardCheckEnabled;
    this.myHorizontalMovementVerticalDiagonalOutwardDownwardCheckEnabled = other.myHorizontalMovementVerticalDiagonalOutwardDownwardCheckEnabled;
    this.myHorizontalMovementVerticalDiagonalInwardUpwardCheckEnabled = other.myHorizontalMovementVerticalDiagonalInwardUpwardCheckEnabled;
    this.myHorizontalMovementVerticalDiagonalInwardDownwardCheckEnabled = other.myHorizontalMovementVerticalDiagonalInwardDownwardCheckEnabled;

    this.myHorizontalMovementVerticalStraightCheckEnabled = other.myHorizontalMovementVerticalStraightCheckEnabled;
    this.myHorizontalMovementVerticalStraightCentralCheckEnabled = other.myHorizontalMovementVerticalStraightCentralCheckEnabled;
    this.myHorizontalMovementVerticalStraightDiagonalUpwardCheckEnabled = other.myHorizontalMovementVerticalStraightDiagonalUpwardCheckEnabled;
    this.myHorizontalMovementVerticalStraightDiagonalUpwardCentralCheckEnabled = other.myHorizontalMovementVerticalStraightDiagonalUpwardCentralCheckEnabled;
    this.myHorizontalMovementVerticalStraightDiagonalDownwardCheckEnabled = other.myHorizontalMovementVerticalStraightDiagonalDownwardCheckEnabled;
    this.myHorizontalMovementVerticalStraightDiagonalDownwardCentralCheckEnabled = other.myHorizontalMovementVerticalStraightDiagonalDownwardCentralCheckEnabled;

    this.myHorizontalPositionCheckEnabled = other.myHorizontalPositionCheckEnabled;
    this.myHorizontalPositionCheckConeHalfSlices = other.myHorizontalPositionCheckConeHalfSlices;
    this.myHorizontalPositionHorizontalBorderCheckEnabled = other.myHorizontalPositionHorizontalBorderCheckEnabled;
    this.myHorizontalPositionHorizontalRadialCheckEnabled = other.myHorizontalPositionHorizontalRadialCheckEnabled;

    this.myHorizontalPositionVerticalStraightCheckEnabled = other.myHorizontalPositionVerticalStraightCheckEnabled;
    this.myHorizontalPositionVerticalStraightCentralCheckEnabled = other.myHorizontalPositionVerticalStraightCentralCheckEnabled;
    this.myHorizontalPositionVerticalRadialDiagonalOutwardCheckEnabled = other.myHorizontalPositionVerticalRadialDiagonalOutwardCheckEnabled;
    this.myHorizontalPositionVerticalRadialDiagonalInwardCheckEnabled = other.myHorizontalPositionVerticalRadialDiagonalInwardCheckEnabled;
    this.myHorizontalPositionVerticalBorderDiagonalOutwardCheckEnabled = other.myHorizontalPositionVerticalBorderDiagonalOutwardCheckEnabled;
    this.myHorizontalPositionVerticalBorderDiagonalInwardCheckEnabled = other.myHorizontalPositionVerticalBorderDiagonalInwardCheckEnabled;
    this.myHorizontalPositionVerticalRadialBorderDiagonalUpwardCheckEnabled = other.myHorizontalPositionVerticalRadialBorderDiagonalUpwardCheckEnabled;
    this.myHorizontalPositionVerticalRadialBorderDiagonalDownwardCheckEnabled = other.myHorizontalPositionVerticalRadialBorderDiagonalDownwardCheckEnabled;

    this.myHorizontalPositionVerticalCheckSearchFarthestHit = other.myHorizontalPositionVerticalCheckSearchFarthestHit;

    this.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHit = other.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHit;
    this.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHitKeepVerticalHitIfNoHorizontalHit = other.myHorizontalPositionVerticalCheckPerformHorizontalCheckOnHitKeepVerticalHitIfNoHorizontalHit;

    this.myHorizontalPositionVerticalCheckIgnoreHitsInsideCollision = other.myHorizontalPositionVerticalCheckIgnoreHitsInsideCollision;
    this.myHorizontalPositionVerticalCheckDirection = other.myHorizontalPositionVerticalCheckDirection;

    this.myHorizontalCheckBlockLayerFlags.setMask(other.myHorizontalCheckBlockLayerFlags.getMask());
    this.myHorizontalCheckObjectsToIgnore.pp_copy(other.myHorizontalCheckObjectsToIgnore);
};

PP.CharacterColliderVerticalCheckSetup.prototype.copy = function (other) {
    this.myVerticalCheckCircumferenceRadius = other.myVerticalCheckCircumferenceRadius;

    this.myVerticalCheckCircumferenceSlices = other.myVerticalCheckCircumferenceSlices;
    this.myVerticalCheckCircumferenceCentralCheckEnabled = other.myVerticalCheckCircumferenceCentralCheckEnabled;
    this.myVerticalCheckCircumferenceRadialSteps = other.myVerticalCheckCircumferenceRadialSteps;
    this.myVerticalCheckCircumferenceRotationPerRadialStepDegrees = other.myVerticalCheckCircumferenceRotationPerRadialStepDegrees;

    this.myVerticalCheckFixedForwardEnabled = other.myVerticalCheckFixedForwardEnabled;
    this.myVerticalCheckFixedForward.vec3_copy(other.myVerticalCheckFixedForward);

    this.myVerticalMovementCheckEnabled = other.myVerticalMovementCheckEnabled;
    this.myVerticalMovementCheckReductionEnabled = other.myVerticalMovementCheckReductionEnabled;
    this.myVerticalMovementCheckPerformCheckTowardBothDirections = other.myVerticalMovementCheckPerformCheckTowardBothDirections;

    this.myVerticalPositionCheckEnabled = other.myVerticalPositionCheckEnabled;

    this.myVerticalCheckAllowHitsInsideCollisionIfOneValid = other.myVerticalCheckAllowHitsInsideCollisionIfOneValid;

    this.myVerticalCheckBlockLayerFlags.setMask(other.myVerticalCheckBlockLayerFlags.getMask());
    this.myVerticalCheckObjectsToIgnore.pp_copy(other.myVerticalCheckObjectsToIgnore);
};

PP.CharacterColliderSlideSetup.prototype.copy = function (other) {
    this.mySlideEnabled = other.mySlideEnabled;

    this.mySlideMaxAttempts = other.mySlideMaxAttempts;

    this.mySlideHorizontalMovementCheckBetterReferenceHit = other.mySlideHorizontalMovementCheckBetterReferenceHit;

    this.mySlideCheckBothDirections = other.mySlideCheckBothDirections;

    this.mySlideFlickerPreventionMode = other.mySlideFlickerPreventionMode;

    this.mySlideFlickerPreventionCheckOnlyIfAlreadySliding = other.mySlideFlickerPreventionCheckOnlyIfAlreadySliding;

    this.mySlideFlickerPreventionForceCheckCounter = other.mySlideFlickerPreventionForceCheckCounter;

    this.mySlide90DegreesAdjustDirectionSign = other.mySlide90DegreesAdjustDirectionSign;
};

PP.CharacterColliderSurfaceSetup.prototype.copy = function (other) {
    this.mySurfaceSnapEnabled = other.mySurfaceSnapEnabled;
    this.mySurfaceSnapMaxDistance = other.mySurfaceSnapMaxDistance;

    this.mySurfacePopOutEnabled = other.mySurfacePopOutEnabled;
    this.mySurfacePopOutMaxDistance = other.mySurfacePopOutMaxDistance;

    this.mySurfaceAngleToIgnore = other.mySurfaceAngleToIgnore;
    this.mySurfaceAngleToIgnoreWithSurfacePerceivedAngle = other.mySurfaceAngleToIgnoreWithSurfacePerceivedAngle;

    this.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalMovement = other.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalMovement;
    this.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalPosition = other.mySurfaceAngleToIgnoreMaxVerticalDistanceHorizontalPosition;

    this.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft = other.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft;

    this.myAddVerticalMovementBasedOnSurfacePerceivedAngle = other.myAddVerticalMovementBasedOnSurfacePerceivedAngle;

    this.myGatherSurfaceInfo = other.myGatherSurfaceInfo;

    this.myIsOnSurfaceMaxOutsideDistance = other.myIsOnSurfaceMaxOutsideDistance;
    this.myIsOnSurfaceMaxInsideDistance = other.myIsOnSurfaceMaxInsideDistance;
    this.myIsOnSurfaceIfInsideSurface = other.myIsOnSurfaceIfInsideSurface;

    this.myGatherSurfaceNormalMaxOutsideDistance = other.myGatherSurfaceNormalMaxOutsideDistance;
    this.myGatherSurfaceNormalMaxInsideDistance = other.myGatherSurfaceNormalMaxInsideDistance;

    this.myIsOnInvalidSurfacePerceivedAngleAllowExitAttempt = other.myIsOnInvalidSurfacePerceivedAngleAllowExitAttempt;

    this.myMustRemainOnSurface = other.myMustRemainOnSurface;
    this.myMustRemainOnValidSurfaceAngleDownhill = other.myMustRemainOnValidSurfaceAngleDownhill;

    this.myRegatherSurfaceInfoOnSurfaceCheckFailed = other.myRegatherSurfaceInfoOnSurfaceCheckFailed;
};

PP.CharacterColliderSplitMovementSetup.prototype.copy = function (other) {
    this.mySplitMovementEnabled = other.mySplitMovementEnabled;

    this.mySplitMovementMaxSteps = other.mySplitMovementMaxSteps;
    this.mySplitMovementMaxStepLength = other.mySplitMovementMaxStepLength;
    this.mySplitMovementMinStepLength = other.mySplitMovementMinStepLength;

    this.mySplitMovementStopOnHorizontalMovementFailed = other.mySplitMovementStopOnHorizontalMovementFailed;
    this.mySplitMovementStopOnVerticalMovementFailed = other.mySplitMovementStopOnVerticalMovementFailed;
    this.mySplitMovementStopOnCallback = other.mySplitMovementStopOnCallback;
    this.mySplitMovementStopReturnPreviousResults = other.mySplitMovementStopReturnPreviousResults;
};

PP.CharacterColliderDebugSetup.prototype.copy = function (other) {
    this.myDebugActive = other.myDebugActive;

    this.myDebugMovementActive = other.myDebugMovementActive;

    this.myDebugHorizontalMovementCheckActive = other.myDebugHorizontalMovementCheckActive;
    this.myDebugHorizontalPositionCheckActive = other.myDebugHorizontalPositionCheckActive;

    this.myDebugVerticalMovementCheckActive = other.myDebugVerticalMovementCheckActive;
    this.myDebugVerticalPositionCheckActive = other.myDebugVerticalPositionCheckActive;

    this.myDebugSlideActive = other.myDebugSlideActive;

    this.myDebugGroundInfoActive = other.myDebugGroundInfoActive;
    this.myDebugCeilingInfoActive = other.myDebugCeilingInfoActive;

    this.myDebugResultsActive = other.myDebugResultsActive;
};



Object.defineProperty(PP.CharacterColliderSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderHorizontalCheckSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderVerticalCheckSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderSlideSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderSurfaceSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderSplitMovementSetup.prototype, "copy", { enumerable: false });
Object.defineProperty(PP.CharacterColliderDebugSetup.prototype, "copy", { enumerable: false });