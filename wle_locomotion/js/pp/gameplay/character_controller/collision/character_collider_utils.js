PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel = {
    VERY_LOW: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    VERY_HIGH: 4,
};

PP.CharacterColliderSetupSimplifiedCreationParams = class CharacterColliderSetupSimplifiedCreationParams {
    constructor() {
        this.myHeight = 0;
        this.myRadius = 0;

        this.myAccuracyLevel = PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.VERY_LOW;

        this.myIsPlayer = false;

        this.myCheckOnlyFeet = false;

        this.myAverageSpeed = 0;

        this.myCanFly = false;

        this.myShouldSlideAgainstWall = false;

        this.myCollectGroundInfo = false;
        this.myShouldSnapOnGround = false;
        this.myMaxWalkableGroundAngle = 0;
        this.myMaxWalkableGroundStepHeight = 0;
        this.myCanFallFromEdges = false;

        this.myHorizontalCheckBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myHorizontalCheckObjectsToIgnore = [];

        this.myVerticalCheckBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myVerticalCheckObjectsToIgnore = [];

        this.myHorizontalCheckDebugActive = false;
        this.myVerticalCheckDebugActive = false;
    }
};

PP.CharacterColliderUtils = {
    createCharacterColliderSetupSimplified: function (simplifiedCreationParams, outCharacterColliderSetup = new PP.CharacterColliderSetup()) {
        // implemented outside class definition
    },
    createTeleportColliderFromMovementCollider: function (movementColliderSetup, outTeleportColliderSetup = new PP.CharacterColliderSetup()) {
        outTeleportColliderSetup.copy(movementColliderSetup);

        outTeleportColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeHalfAngle = 180;
        outTeleportColliderSetup.myHorizontalCheckSetup.myHorizontalPositionCheckConeHalfSlices =
            Math.round((outTeleportColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeHalfAngle / movementColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeHalfAngle)
                * movementColliderSetup.myHorizontalCheckSetup.myHorizontalPositionCheckConeHalfSlices);

        outTeleportColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFixedForwardEnabled = true;
        outTeleportColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFixedForward.vec3_set(0, 0, 1);

        return outTeleportColliderSetup;
    },
};



// IMPLEMENTATION

PP.CharacterColliderUtils.createCharacterColliderSetupSimplified = function (simplifiedCreationParams, outCharacterColliderSetup = new PP.CharacterColliderSetup()) {

    outCharacterColliderSetup.myHeight = simplifiedCreationParams.myHeight;
    outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckConeRadius = simplifiedCreationParams.myRadius;
    outCharacterColliderSetup.myVerticalCheckSetup.myVerticalCheckCircumferenceRadius = simplifiedCreationParams.myRadius / 2;

    outCharacterColliderSetup.myVerticalCheckSetup.myVerticalCheckFixedForwardEnabled = true;
    outCharacterColliderSetup.myVerticalCheckSetup.myVerticalCheckFixedForward.vec3_set(0, 0, 1);

    if (!simplifiedCreationParams.myCheckOnlyFeet || simplifiedCreationParams.myCanFly) {
        outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalHeightCheckEnabled = true;
        outCharacterColliderSetup.myVerticalCheckSetup.myVerticalPositionCheckEnabled = true;
    }

    if (simplifiedCreationParams.myShouldSlideAgainstWall) {
        outCharacterColliderSetup.myWallSlideSetup.myWallSlideEnabled = true;
    }

    outCharacterColliderSetup.myGroundSetup.mySurfaceSnapMaxDistance = simplifiedCreationParams.myRadius / 3;
    outCharacterColliderSetup.myGroundSetup.mySurfacePopOutMaxDistance = simplifiedCreationParams.myRadius / 3;
    outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft = simplifiedCreationParams.myRadius / 2;
    if (simplifiedCreationParams.myAverageSpeed > 5) {
        let multiplier = Math.ceil(simplifiedCreationParams.myAverageSpeed / 5);
        outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft *= multiplier;
    }

    if (simplifiedCreationParams.myCollectGroundInfo || simplifiedCreationParams.myMaxWalkableGroundAngle > 0) {
        outCharacterColliderSetup.myGroundSetup.myCollectSurfaceInfo = true;
    }
    if (simplifiedCreationParams.myShouldSnapOnGround) {
        outCharacterColliderSetup.myGroundSetup.mySurfaceSnapEnabled = true;
    }
    outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnore = simplifiedCreationParams.myMaxWalkableGroundAngle;
    outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFeetDistanceToIgnore = simplifiedCreationParams.myMaxWalkableGroundStepHeight;

    if (simplifiedCreationParams.myCanFly) {
        outCharacterColliderSetup.myCeilingSetup.myCollectSurfaceInfo = outCharacterColliderSetup.myGroundSetup.myCollectSurfaceInfo;
        outCharacterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnore = outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnore;
        outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckHeadDistanceToIgnore = outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckFeetDistanceToIgnore;

        outCharacterColliderSetup.myCeilingSetup.mySurfaceSnapMaxDistance = outCharacterColliderSetup.myGroundSetup.mySurfaceSnapMaxDistance;
        outCharacterColliderSetup.myCeilingSetup.mySurfacePopOutMaxDistance = outCharacterColliderSetup.myGroundSetup.mySurfacePopOutMaxDistance;
        outCharacterColliderSetup.myCeilingSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft = outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnoreMaxHorizontalMovementLeft;

    }

    if (!simplifiedCreationParams.myCanFallFromEdges) {
        outCharacterColliderSetup.myGroundSetup.myMustStayOnSurface = true;
        outCharacterColliderSetup.myGroundSetup.myIsOnSurfaceMaxSurfaceAngle = Math.max(60, outCharacterColliderSetup.myGroundSetup.mySurfaceAngleToIgnore);
    }

    outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckBlockLayerFlags.copy(simplifiedCreationParams.myHorizontalCheckBlockLayerFlags);
    outCharacterColliderSetup.myHorizontalCheckSetup.myHorizontalCheckObjectsToIgnore.pp_copy(simplifiedCreationParams.myHorizontalCheckObjectsToIgnore);

    outCharacterColliderSetup.myVerticalCheckSetup.myVerticalCheckBlockLayerFlags.copy(simplifiedCreationParams.myVerticalCheckBlockLayerFlags);
    outCharacterColliderSetup.myVerticalCheckSetup.myVerticalCheckObjectsToIgnore.pp_copy(simplifiedCreationParams.myVerticalCheckObjectsToIgnore);

    if (simplifiedCreationParams.myHorizontalCheckDebugActive) {
        outCharacterColliderSetup.myDebugSetup.myDebugActive = true;
        outCharacterColliderSetup.myDebugSetup.myDebugHorizontalMovementCheckActive = true;
        outCharacterColliderSetup.myDebugSetup.myDebugHorizontalPositionCheckActive = true;
    }

    if (simplifiedCreationParams.myVerticalCheckDebugActive) {
        outCharacterColliderSetup.myDebugSetup.myDebugActive = true;
        outCharacterColliderSetup.myDebugSetup.myDebugVerticalMovementCheckActive = true;
        outCharacterColliderSetup.myDebugSetup.myDebugVerticalPositionCheckActive = true;
    }

    switch (simplifiedCreationParams.myAccuracyLevel) {
        case PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.VERY_HIGH:

        case PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.HIGH:

        case PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.MEDIUM:
            // da medium in su
            if (simplifiedCreationParams.myCanFly) {
                outCharacterColliderSetup.myVerticalCheckSetup.myVerticalMovementCheckPerformCheckOnBothSides = true;
            }

        case PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.LOW:

        case PP.CharacterColliderSetupSimplifiedCreationAccuracyLevel.VERY_LOW:
    }
};