PP.CharacterColliderSetup = class CharacterColliderSetup {
    constructor() {
        this.myHeight = 0;

        this.myPositionOffsetLocal = PP.vec3_create();
        this.myRotationOffsetLocalQuat = PP.quat_create();

        this.myHorizontalSetup = new cancelAnimationFrame();
        this.myVerticalSetup = new cancelAnimationFrame();

        this.mySlideSetup = new cancelAnimationFrame();

        this.myGroundSetup = new cancelAnimationFrame();
        this.myCeilingSetup = new cancelAnimationFrame();

        this.mySplitMovementSetup = new cancelAnimationFrame();

        this.myDebugSetup = new cancelAnimationFrame();
    }

    defaultSetup() {

    }

    copy(other) {

    }
};

PP.CharacterColliderHorizontalSetup = class CharacterColliderHorizontalSetup {
    constructor() {
        this.myRadius = 0;
        this.myDistanceFromFeetToIgnore = 0;
        this.myDistanceFromHeadToIgnore = 0;

        this.myHorizontalMovementCheckEnabled = false;

        // usually the horizontal movement is very small and it could be simply skipped has a check, the horizontal position check will be enough
        // with small I mean that it's very unlikely that in 10 cm of movement in a frame u are going to hit something in between but not in the final position
        // if u feel like the movement is bigger or want to be sure u can always enabled this
        // if the movement is really that big it's probably better to use the mySplitMovementEnabled flag and split the movement check into smaller movements
        this.myHorizontalMovementStepEnabled = false;
        this.myHorizontalMovementStepMaxLength = 0;

        this.myHorizontalMovementRadialStepAmount = 0;
        this.myHorizontalMovementCheckDiagonal = false;
        this.myHorizontalMovementCheckStraight = false;
        this.myHorizontalMovementCheckHorizontalBorder = false;
        this.myHorizontalMovementCheckVerticalStraight = false;
        this.myHorizontalMovementCheckVerticalDiagonalUpward = false;
        this.myHorizontalMovementCheckVerticalDiagonalDownward = false;
        this.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;
        this.myHorizontalMovementCheckStraightOnlyForCenter = false;

        this.myHorizontalPositionCheckEnabled = false;

        this.myHalfConeAngle = 0;
        this.myHalfConeSliceAmount = 0;
        this.myCheckConeBorder = false;
        this.myCheckConeRay = false;
        this.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = true; // true gives less issues(tm), but may also collide a bit more, resulting in less sliding
        this.myHorizontalPositionCheckVerticalDirectionType = 0; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!
        // 0: check upward, gives less issues(tm) (hitting a very small step at the end of a slope /-) with a grounded movement (not fly or snapped to ceiling), but may also collide a bit more, resulting in less sliding
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
        this.myCheckHorizontalFixedForward = PP.vec3_create();


        this.myHeightCheckStepAmount = 0;
        this.myCheckVerticalStraight = false;
        this.myCheckVerticalDiagonalRay = false;
        this.myCheckVerticalDiagonalBorder = false;
        this.myCheckVerticalDiagonalBorderRay = false;
        this.myCheckVerticalSearchFurtherVerticalHit = false; //somewhat expensive, but can help fix sime sliding issues

        this.myCheckHeight = false;
        this.myCheckHeightTop = false;
        this.myCheckHeightConeOnCollision = false;
        this.myCheckHeightConeOnCollisionKeepHit = false;
        // if true and myCheckHeightConeOnCollision is true, if the cone does not hit the height hit will be restored
        // the fact that the cone does not hit could be due to the fact that it thinks that the collision can be ignored though, sop restoring can be a bit safer but also collide more

        this.myGroundCircumferenceAddCenter = false;
        this.myGroundCircumferenceSliceAmount = 0;
        this.myGroundCircumferenceStepAmount = 0;
        this.myGroundCircumferenceRotationPerStep = 0;
        this.myVerticalAllowHitInsideCollisionIfOneOk = false;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myObjectsToIgnore = [];
    }
};

PP.CharacterColliderVerticalSetup = class CharacterColliderVerticalSetup {
    constructor() {
        this.myRadius = 0;

        this.myVerticalMovementCheckEnabled = false;
        this.myVerticalPositionCheckEnabled = false;
        this.myFeetRadius = 0;
        this.myAdjustVerticalMovementWithSurfaceAngle = false; //#TODO split into ceiling and ground
        this.myCheckVerticalFixedForwardEnabled = false;
        this.myCheckVerticalFixedForward = PP.vec3_create();
        this.myCheckVerticalBothDirection = false;

        this.myVerticalMovementReduceEnabled = false;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myObjectsToIgnore = [];
    }
};

PP.CharacterColliderSlideFlickerPreventionType = {
    NONE: 0,
    USE_PREVIOUS_RESULTS: 1, // allow some flicker before stabilizing but avoid stopping for a 1 frame flicker only (false positive), is also less expensive
    COLLISION_ANGLE_ABOVE_90_DEGREES: 2, // prevents most flicker apart those on almost flat surface, can have some false positive, always check when sliding into opposite direction
    COLLISION_ANGLE_ABOVE_90_DEGREES_OR_MOVEMENT_ANGLE_ABOVE_85_DEGREES: 3, // less flicker than COLLISION_ANGLE_ABOVE_90_DEGREES but more false positive, always check when sliding into opposite direction
    ALWAYS: 4, // less flicker than COLLISION_ANGLE_ABOVE_90_DEGREES_OR_MOVEMENT_ANGLE_ABOVE_85_DEGREES but more false positive
}

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

        this.mySlideFlickerPreventionType = PP.CharacterColliderSlideFlickerPreventionType.NONE;

        this.mySlideFlickerPreventionCheckOnlyIfAlreadySliding = false;
        // this flag make it so the prevention is done only if it was already sliding
        // this can lead to a few frames of flicker if u go towards a corner directly, but allow the movement to be more fluid, avoiding getting stuck and false positive

        this.mySlideFlickerPreventionForceCheckCounter = 0;
        // if the collision think it needs to check for flicker, it will keep checking for the next X frames based on this value even if the condition are not met anymore
        // this help in catching the flicker when the direction is not changing every frame but every 2-3 for example
        // it's especially useful if combo-ed with CharacterColliderSlideFlickerPreventionType.USE_PREVIOUS_RESULTS, making it a bit less fluid but also less flickering

        this.mySlide90DegreesAdjustDirectionSign = false;
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

        this.myGatherSurfaceInfoEnabled = false;

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
};