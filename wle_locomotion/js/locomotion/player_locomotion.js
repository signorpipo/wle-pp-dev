PlayerLocomotionDirectionReferenceType = {
    HEAD: 0,
    HAND: 1,
    CUSTOM_OBJECT: 2,
};

transformManager = null;

PlayerLocomotionParams = class PlayerLocomotionParams {
    constructor() {
        this.myMaxSpeed = 0;
        this.myMaxRotationSpeed = 0;

        this.myIsSnapTurn = false;
        this.mySnapTurnOnlyInsideXRSession = false;
        this.mySnapTurnAngle = 0;
        this.mySnapTurnSpeedDegrees = 0;

        this.myFlyEnabled = false;
        this.myMinAngleToFlyUpNonVR = 0;
        this.myMinAngleToFlyDownNonVR = 0;
        this.myMinAngleToFlyUpVR = 0;
        this.myMinAngleToFlyDownVR = 0;
        this.myMinAngleToFlyRight = 0;

        this.myMainHand = PP.Handedness.LEFT;

        this.myVRDirectionReferenceType = PlayerLocomotionDirectionReferenceType.HEAD;
        this.myVRDirectionReferenceObject = null;

        this.myTeleportParableStartReferenceObject = null;

        this.myForeheadExtraHeight = 0;

        this.myTeleportPositionObject = null;
    }
};

// #TODO add lerped snap on vertical over like half a second to avoid the "snap effect"
// this could be done by detatching the actual vertical position of the player from the collision real one when a snap is detected above a certain threshold
// with a timer, after which the vertical position is just copied, while during the detatching is lerped toward the collision vertical one
PlayerLocomotion = class PlayerLocomotion {
    constructor(params) {
        this._myParams = params;

        this._myCollisionCheckParamsMovement = new CollisionCheckParams();
        this._setupCollisionCheckParamsMovement();
        this._myCollisionCheckParamsTeleport = null;
        this._setupCollisionCheckParamsTeleport();


        this._myCollisionRuntimeParams = new CollisionRuntimeParams();
        this._myMovementRuntimeParams = new PlayerLocomotionMovementRuntimeParams();
        this._myMovementRuntimeParams.myCollisionRuntimeParams = this._myCollisionRuntimeParams;

        {
            let params = new PlayerHeadManagerParams();

            params.mySessionChangeResyncEnabled = true;

            params.myBlurEndResyncEnabled = true;
            params.myBlurEndResyncRotation = true;

            //params.myNextEnterSessionFloorHeight = 3;
            params.myEnterSessionResyncHeight = false;
            params.myExitSessionResyncHeight = false;
            params.myExitSessionResyncVerticalAngle = true;
            params.myExitSessionRemoveRightTilt = true;
            params.myExitSessionAdjustMaxVerticalAngle = true;
            params.myExitSessionMaxVerticalAngle = 90;

            params.myHeightOffsetVRWithFloor = 0;
            params.myHeightOffsetVRWithoutFloor = 1.75;
            params.myHeightOffsetNonVR = 1.75;

            params.myForeheadExtraHeight = this._myParams.myForeheadExtraHeight;

            params.myFeetRotationKeepUp = true;

            params.myDebugActive = false;

            this._myPlayerHeadManager = new PlayerHeadManager(params);
        }

        {
            let params = new PlayerTransformManagerParams();

            params.myPlayerHeadManager = this._myPlayerHeadManager;

            params.myMovementCollisionCheckParams = this._myCollisionCheckParamsMovement;
            params.myTeleportCollisionCheckParams = null;
            params.myTeleportCollisionCheckParamsCopyFromMovement = true;
            params.myTeleportCollisionCheckParamsCheck360 = true;

            params.myHeadCollisionBlockLayerFlags.setMask(params.myMovementCollisionCheckParams.myBlockLayerFlags.getMask());
            params.myHeadCollisionObjectsToIgnore.pp_copy(params.myMovementCollisionCheckParams.myObjectsToIgnore);

            params.myCollisionRuntimeParams = this._myCollisionRuntimeParams;

            params.myHeadRadius = 0.15;

            params.myIsMaxDistanceFromRealToSyncEnabled = true;
            params.myMaxDistanceFromRealToSync = 100;

            params.myIsFloatingValidIfVerticalMovement = false;
            params.myIsFloatingValidIfVerticalMovementAndRealOnGround = false;
            params.myIsFloatingValidIfSteepGround = false;
            params.myIsFloatingValidIfVerticalMovementAndSteepGround = false;
            params.myIsFloatingValidIfRealOnGround = false;
            params.myIsLeaningValidAboveDistance = true;
            params.myLeaningValidDistance = 2;
            params.myFloatingSplitCheckEnabled = true;
            params.myFloatingSplitCheckMaxLength = 0.2;
            params.myFloatingSplitCheckMaxSteps = 5;
            params.myRealMovementAllowVerticalAdjustments = false;

            params.myUpdateRealPositionValid = true;
            params.myUpdatePositionValid = true;

            params.myIsBodyCollidingWhenHeightBelowValue = null;
            params.myIsBodyCollidingWhenHeightAboveValue = null;

            params.myResetToValidOnEnterSession = true;
            params.myResetToValidOnExitSession = true;

            params.myAlwaysResetRealPositionNonVR = true;
            params.myAlwaysResetRealRotationNonVR = true;
            params.myAlwaysResetRealHeightNonVR = true;

            params.myAlwaysResetRealPositionVR = false;
            params.myAlwaysResetRealRotationVR = false;
            params.myAlwaysResetRealHeightVR = false;

            params.myNeverResetRealPositionNonVR = false;
            params.myNeverResetRealRotationNonVR = false;
            params.myNeverResetRealHeightNonVR = false;

            params.myNeverResetRealPositionVR = false;
            params.myNeverResetRealRotationVR = false;
            params.myNeverResetRealHeightVR = true;

            params.myResetRealOnMove = true;

            params.myDebugActive = true;

            this._myPlayerTransformManager = new PlayerTransformManager(params);

            transformManager = this._myPlayerTransformManager;
        }

        {
            let params = new PlayerObscureManagerParams();

            params.myPlayerTransformManager = this._myPlayerTransformManager;

            params.myObscureObject = null;
            params.myObscureMaterial = null;
            params.myObscureRadius = 0.1;

            params.myObscureFadeOutSeconds = 0.25;
            params.myObscureFadeInSeconds = 0.25;

            params.myObscureFadeEasingFunction = PP.EasingFunction.linear;
            params.myObscureLevelRelativeDistanceEasingFunction = PP.EasingFunction.linear;

            params.myDistanceToStartObscureWhenBodyColliding = 0.2;
            params.myDistanceToStartObscureWhenHeadColliding = 0;
            params.myDistanceToStartObscureWhenFloating = 1;
            params.myDistanceToStartObscureWhenFar = 1;

            params.myRelativeDistanceToMaxObscureWhenBodyColliding = 0.5;
            params.myRelativeDistanceToMaxObscureWhenHeadColliding = 0.1;
            params.myRelativeDistanceToMaxObscureWhenFloating = 5;
            params.myRelativeDistanceToMaxObscureWhenFar = 5;

            this._myPlayerObscureManager = new PlayerObscureManager(params);
        }

        {
            let params = new PlayerLocomotionRotateParams();

            params.myPlayerHeadManager = this._myPlayerHeadManager;

            params.myMaxRotationSpeed = this._myParams.myMaxRotationSpeed;
            params.myIsSnapTurn = this._myParams.myIsSnapTurn;
            params.mySnapTurnOnlyInsideXRSession = this._myParams.mySnapTurnOnlyInsideXRSession;
            params.mySnapTurnAngle = this._myParams.mySnapTurnAngle;

            if (this._myParams.mySnapTurnSpeedDegrees > LocomotionUtils.EPSILON_NUMBER) {
                params.mySmoothSnapActive = true;
                params.mySmoothSnapSpeedDegrees = this._myParams.mySnapTurnSpeedDegrees;
            } else {
                params.mySmoothSnapActive = false;
            }

            params.myRotationMinStickIntensityThreshold = 0.1;
            params.mySnapTurnActivateThreshold = 0.5;
            params.mySnapTurnResetThreshold = 0.4;

            params.myClampVerticalAngle = true;
            params.myMaxVerticalAngle = 90;

            this._myPlayerLocomotionRotate = new PlayerLocomotionRotate(params);

            params.myHandedness = PP.InputUtils.getOppositeHandedness(this._myParams.myMainHand);
        }

        {
            {
                let params = new PlayerLocomotionSmoothParams();

                params.myPlayerHeadManager = this._myPlayerHeadManager;
                params.myPlayerTransformManager = this._myPlayerTransformManager;

                params.myCollisionCheckParams = this._myCollisionCheckParamsMovement;

                params.myHandedness = this._myParams.myMainHand;

                params.myMaxSpeed = this._myParams.myMaxSpeed;

                params.myMovementMinStickIntensityThreshold = 0.1;

                params.myFlyEnabled = this._myParams.myFlyEnabled;
                params.myMinAngleToFlyUpNonVR = this._myParams.myMinAngleToFlyUpNonVR;
                params.myMinAngleToFlyDownNonVR = this._myParams.myMinAngleToFlyDownNonVR;
                params.myMinAngleToFlyUpVR = this._myParams.myMinAngleToFlyUpVR;
                params.myMinAngleToFlyDownVR = this._myParams.myMinAngleToFlyDownVR;
                params.myMinAngleToFlyRight = this._myParams.myMinAngleToFlyRight;

                params.myVRDirectionReferenceType = this._myParams.myVRDirectionReferenceType;
                params.myVRDirectionReferenceObject = this._myParams.myVRDirectionReferenceObject;

                this._myPlayerLocomotionSmooth = new PlayerLocomotionSmooth(params, this._myMovementRuntimeParams);
            }

            {
                let params = new PlayerLocomotionTeleportParams();

                params.myPlayerHeadManager = this._myPlayerHeadManager;

                params.myCollisionCheckParams = this._myCollisionCheckParamsTeleport;

                params.myHandedness = this._myParams.myMainHand;

                params.myDetectionParams.myMaxDistance = 3;
                params.myDetectionParams.myMaxHeightDifference = 4;
                params.myDetectionParams.myGroundAngleToIgnoreUpward = this._myCollisionCheckParamsMovement.myGroundAngleToIgnore;
                params.myDetectionParams.myMustBeOnGround = true;

                params.myDetectionParams.myTeleportBlockLayerFlags.setAllFlagsActive(true);
                params.myDetectionParams.myTeleportFloorLayerFlags.setAllFlagsActive(true);

                params.myDetectionParams.myTeleportFeetPositionMustBeVisible = false;
                params.myDetectionParams.myTeleportHeadPositionMustBeVisible = false;
                params.myDetectionParams.myTeleportHeadOrFeetPositionMustBeVisible = true;

                params.myDetectionParams.myTeleportParableStartReferenceObject = this._myParams.myTeleportParableStartReferenceObject;

                params.myDetectionParams.myVisibilityBlockLayerFlags.setAllFlagsActive(true);

                params.myVisualizerParams.myTeleportPositionObject = this._myParams.myTeleportPositionObject;

                params.myPerformTeleportAsMovement = false;
                params.myTeleportAsMovementRemoveVerticalMovement = true;
                params.myTeleportAsMovementExtraVerticalMovementPerMeter = -2;

                params.myGravityAcceleration = -9.81;

                params.myDebugActive = false;
                params.myDebugDetectActive = true;
                params.myDebugShowActive = true;
                params.myDebugVisibilityActive = false;

                this._myPlayerLocomotionTeleport = new PlayerLocomotionTeleport(params, this._myMovementRuntimeParams);
            }
        }

        this._setupLocomotionMovementFSM();

        this._myIdle = false;
    }

    start() {
        this._fixAlmostUp();

        this._myPlayerHeadManager.start();
        this._myPlayerTransformManager.start();

        this._myPlayerObscureManager.start();

        this._myPlayerLocomotionRotate.start();

        this._myLocomotionMovementFSM.perform("start");
    }

    update(dt) {
        this._myPlayerHeadManager.update(dt);
        this._myPlayerTransformManager.update(dt);

        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.THUMBSTICK).isPressEnd(2)) {
            if (this._myLocomotionMovementFSM.isInState("smooth") && this._myPlayerLocomotionSmooth.canStop()) {
                this._myLocomotionMovementFSM.perform("next");
            } else if (this._myLocomotionMovementFSM.isInState("teleport") && this._myPlayerLocomotionTeleport.canStop()) {
                this._myLocomotionMovementFSM.perform("next");
            }
        }

        if (this._myPlayerHeadManager.isSynced()) {

            this._updateCollisionHeight();

            if (!this._myIdle) {
                this._myPlayerLocomotionRotate.update(dt);
                this._myLocomotionMovementFSM.update(dt);
            }
        }

        this._myPlayerObscureManager.update(dt);
        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.SELECT).isPressEnd(2)) {
            if (this._myPlayerObscureManager.isFading()) {
                this._myPlayerObscureManager.obscureLevelOverride(this._myPlayerObscureManager.isFadingOut() ? Math.pp_random(0, 0) : Math.pp_random(1, 1));
            } else {
                this._myPlayerObscureManager.obscureLevelOverride(this._myPlayerObscureManager.isObscured() ? Math.pp_random(0, 0) : Math.pp_random(1, 1));
            }
        }
    }

    setIdle(idle) {
        this._myIdle = idle;

        if (idle) {
            this._myLocomotionMovementFSM.perform("idle");
        } else {
            this._myLocomotionMovementFSM.perform("start");
        }
    }

    _updateCollisionHeight() {
        this._myCollisionCheckParamsMovement.myHeight = this._myPlayerHeadManager.getHeightHead();
        if (this._myCollisionCheckParamsMovement.myHeight <= 0.000001) {
            this._myCollisionCheckParamsMovement.myHeight = 0;
        }
        this._myCollisionCheckParamsTeleport.myHeight = this._myCollisionCheckParamsMovement.myHeight;
    }

    _setupCollisionCheckParamsMovement() {
        this._myCollisionCheckParamsMovement.mySplitMovementEnabled = false;
        this._myCollisionCheckParamsMovement.mySplitMovementMaxLength = 0;

        this._myCollisionCheckParamsMovement.myRadius = 0.3;
        this._myCollisionCheckParamsMovement.myDistanceFromFeetToIgnore = 0.1;
        this._myCollisionCheckParamsMovement.myDistanceFromHeadToIgnore = 0.1;

        //this._myCollisionCheckParamsMovement.myPositionOffsetLocal.vec3_set(0, 1, 0)
        //this._myCollisionCheckParamsMovement.myRotationOffsetLocalQuat.quat_fromAxis(45, [1, 1, 0].vec3_normalize());

        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckEnabled = true;
        this._myCollisionCheckParamsMovement.myHorizontalMovementStepEnabled = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementStepMaxLength = 0;
        this._myCollisionCheckParamsMovement.myHorizontalMovementRadialStepAmount = 1;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckDiagonal = true;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckStraight = true;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckHorizontalBorder = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckVerticalStraight = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckVerticalDiagonalUpward = true;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckVerticalDiagonalDownward = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;
        this._myCollisionCheckParamsMovement.myHorizontalMovementCheckStraightOnlyForCenter = true;

        this._myCollisionCheckParamsMovement.myHorizontalPositionCheckEnabled = true;
        this._myCollisionCheckParamsMovement.myHalfConeAngle = 60;
        this._myCollisionCheckParamsMovement.myHalfConeSliceAmount = 2;
        this._myCollisionCheckParamsMovement.myCheckConeBorder = true;
        this._myCollisionCheckParamsMovement.myCheckConeRay = true;
        this._myCollisionCheckParamsMovement.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = false;
        this._myCollisionCheckParamsMovement.myHorizontalPositionCheckVerticalDirectionType = 2; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!

        this._myCollisionCheckParamsMovement.myVerticalMovementCheckEnabled = true;
        this._myCollisionCheckParamsMovement.myVerticalPositionCheckEnabled = true;
        this._myCollisionCheckParamsMovement.myVerticalMovementReduceEnabled = true;
        this._myCollisionCheckParamsMovement.myFeetRadius = 0.1;
        this._myCollisionCheckParamsMovement.myAdjustVerticalMovementWithSurfaceAngle = true;

        this._myCollisionCheckParamsMovement.mySnapOnGroundEnabled = true;
        this._myCollisionCheckParamsMovement.mySnapOnGroundExtraDistance = 0.1;
        this._myCollisionCheckParamsMovement.mySnapOnCeilingEnabled = false;
        this._myCollisionCheckParamsMovement.mySnapOnCeilingExtraDistance = 0.1;

        this._myCollisionCheckParamsMovement.myGroundPopOutEnabled = true;
        this._myCollisionCheckParamsMovement.myGroundPopOutExtraDistance = 0.1;
        this._myCollisionCheckParamsMovement.myCeilingPopOutEnabled = true;
        this._myCollisionCheckParamsMovement.myCeilingPopOutExtraDistance = 0.1;

        this._myCollisionCheckParamsMovement.myGroundCircumferenceAddCenter = true;
        this._myCollisionCheckParamsMovement.myGroundCircumferenceSliceAmount = 8;
        this._myCollisionCheckParamsMovement.myGroundCircumferenceStepAmount = 2;
        this._myCollisionCheckParamsMovement.myGroundCircumferenceRotationPerStep = 22.5;
        this._myCollisionCheckParamsMovement.myVerticalAllowHitInsideCollisionIfOneOk = true;

        this._myCollisionCheckParamsMovement.myCheckHeight = true;
        this._myCollisionCheckParamsMovement.myCheckHeightTop = true;
        this._myCollisionCheckParamsMovement.myCheckHeightConeOnCollision = true;
        this._myCollisionCheckParamsMovement.myCheckHeightConeOnCollisionKeepHit = false;
        this._myCollisionCheckParamsMovement.myHeightCheckStepAmount = 1;
        this._myCollisionCheckParamsMovement.myCheckVerticalFixedForwardEnabled = true;
        this._myCollisionCheckParamsMovement.myCheckVerticalFixedForward = [0, 0, 1];
        this._myCollisionCheckParamsMovement.myCheckVerticalBothDirection = true;

        this._myCollisionCheckParamsMovement.myCheckVerticalStraight = true;
        this._myCollisionCheckParamsMovement.myCheckVerticalDiagonalRay = false;
        this._myCollisionCheckParamsMovement.myCheckVerticalDiagonalBorder = false;
        this._myCollisionCheckParamsMovement.myCheckVerticalDiagonalBorderRay = false;
        this._myCollisionCheckParamsMovement.myCheckVerticalSearchFurtherVerticalHit = false;

        this._myCollisionCheckParamsMovement.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParamsMovement.myCeilingAngleToIgnore = 30;

        //this._myCollisionCheckParamsMovement.myHorizontalMovementGroundAngleIgnoreHeight = 0.1 * 3;
        //this._myCollisionCheckParamsMovement.myHorizontalMovementCeilingAngleIgnoreHeight = 0.1 * 3;
        //this._myCollisionCheckParamsMovement.myHorizontalPositionGroundAngleIgnoreHeight = 0.1;
        //this._myCollisionCheckParamsMovement.myHorizontalPositionCeilingAngleIgnoreHeight = 0.1;

        this._myCollisionCheckParamsMovement.myHorizontalMovementGroundAngleIgnoreMaxMovementLeft = 0.1;
        this._myCollisionCheckParamsMovement.myHorizontalMovementGroundAngleIgnoreMaxMovementLeft = 0.1;

        this._myCollisionCheckParamsMovement.myHeight = 1;

        this._myCollisionCheckParamsMovement.myComputeGroundInfoEnabled = true;
        this._myCollisionCheckParamsMovement.myComputeCeilingInfoEnabled = true;
        this._myCollisionCheckParamsMovement.myDistanceToBeOnGround = 0.001;
        this._myCollisionCheckParamsMovement.myDistanceToComputeGroundInfo = 0.1;
        this._myCollisionCheckParamsMovement.myDistanceToBeOnCeiling = 0.001;
        this._myCollisionCheckParamsMovement.myDistanceToComputeCeilingInfo = 0.1;
        this._myCollisionCheckParamsMovement.myVerticalFixToBeOnGround = 0;
        this._myCollisionCheckParamsMovement.myVerticalFixToComputeGroundInfo = 0;
        this._myCollisionCheckParamsMovement.myVerticalFixToBeOnCeiling = 0;
        this._myCollisionCheckParamsMovement.myVerticalFixToComputeCeilingInfo = 0;

        this._myCollisionCheckParamsMovement.myAllowSurfaceSteepFix = false;
        this._myCollisionCheckParamsMovement.myMustRemainOnGround = false;
        this._myCollisionCheckParamsMovement.myMustRemainOnCeiling = false;
        this._myCollisionCheckParamsMovement.myRegatherGroundInfoOnSurfaceCheckFail = true;
        this._myCollisionCheckParamsMovement.myRegatherCeilingInfoOnSurfaceCheckFail = true;

        this._myCollisionCheckParamsMovement.mySlidingEnabled = true;
        this._myCollisionCheckParamsMovement.mySlidingHorizontalMovementCheckBetterNormal = true;
        this._myCollisionCheckParamsMovement.mySlidingMaxAttempts = 4;
        this._myCollisionCheckParamsMovement.mySlidingCheckBothDirections = true;        // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParamsMovement.mySlidingFlickeringPreventionType = 1;      // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParamsMovement.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding = true;
        this._myCollisionCheckParamsMovement.mySlidingFlickerPreventionCheckAnywayCounter = 4;
        this._myCollisionCheckParamsMovement.mySlidingAdjustSign90Degrees = true;

        this._myCollisionCheckParamsMovement.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this._myCollisionCheckParamsMovement.myBlockLayerFlags.setAllFlagsActive(true);
        let physXComponents = PP.myPlayerObjects.myPlayer.pp_getComponentsHierarchy("physx");
        for (let physXComponent of physXComponents) {
            this._myCollisionCheckParamsMovement.myObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first.pp_equals(second));
        }

        this._myCollisionCheckParamsMovement.myDebugActive = false;

        this._myCollisionCheckParamsMovement.myDebugHorizontalMovementActive = false;
        this._myCollisionCheckParamsMovement.myDebugHorizontalPositionActive = true;
        this._myCollisionCheckParamsMovement.myDebugVerticalMovementActive = false;
        this._myCollisionCheckParamsMovement.myDebugVerticalPositionActive = false;
        this._myCollisionCheckParamsMovement.myDebugSlidingActive = false;
        this._myCollisionCheckParamsMovement.myDebugSurfaceInfoActive = false;
        this._myCollisionCheckParamsMovement.myDebugRuntimeParamsActive = false;
        this._myCollisionCheckParamsMovement.myDebugMovementActive = false;
    }

    _setupCollisionCheckParamsTeleport() {
        this._myCollisionCheckParamsTeleport = CollisionCheckUtils.generate360TeleportParamsFromMovementParams(this._myCollisionCheckParamsMovement);

        // increased so to let teleport on steep slopes from above (from below is fixed through detection myGroundAngleToIgnoreUpward)
        this._myCollisionCheckParamsTeleport.myGroundAngleToIgnore = 60;

        // this is needed for when u want to perform the teleport as a movement
        // maybe this should be another set of collsion check params copied from the smooth ones?
        // when you teleport as move, u check with the teleport for the position, and this other params for the move, so that u can use a smaller
        // cone, and sliding if desired
        // if nothing is specified it's copied from the teleport and if greater than 90 cone is tuned down, and also the below settings are applied

        // you could also do this if u want to perform the teleport as movement, instead of using the smooth
        // but this will make even the final teleport check be halved
        //this._myCollisionCheckParamsTeleport.myHalfConeAngle = 90;
        //this._myCollisionCheckParamsTeleport.myHalfConeSliceAmount = 3;
        //this._myCollisionCheckParamsTeleport.myCheckHorizontalFixedForwardEnabled = false;
        //this._myCollisionCheckParamsTeleport.mySplitMovementEnabled = true;
        //this._myCollisionCheckParamsTeleport.mySplitMovementMaxLength = 0.2;

        //this._myCollisionCheckParamsTeleport.myDebugActive = true;
    }

    _fixAlmostUp() {
        // get rotation on y and adjust if it's slightly tilted when it's almsot 0,1,0

        let defaultUp = [0, 1, 0];
        let angleWithDefaultUp = PP.myPlayerObjects.myPlayer.pp_getUp().vec3_angle(defaultUp);
        if (angleWithDefaultUp < 1) {
            let forward = PP.myPlayerObjects.myPlayer.pp_getForward();
            let flatForward = forward.vec3_clone();
            flatForward[1] = 0;

            let defaultForward = [0, 0, 1];
            let angleWithDefaultForward = defaultForward.vec3_angleSigned(flatForward, defaultUp);

            PP.myPlayerObjects.myPlayer.pp_resetRotation();
            PP.myPlayerObjects.myPlayer.pp_rotateAxis(angleWithDefaultForward, defaultUp);
        }
    }

    _setupLocomotionMovementFSM() {
        this._myLocomotionMovementFSM = new PP.FSM();
        this._myLocomotionMovementFSM.setDebugLogActive(true, "Locomotion Movement");

        this._myLocomotionMovementFSM.addState("init");
        this._myLocomotionMovementFSM.addState("smooth", (dt) => this._myPlayerLocomotionSmooth.update(dt));
        this._myLocomotionMovementFSM.addState("teleport", (dt) => this._myPlayerLocomotionTeleport.update(dt));
        this._myLocomotionMovementFSM.addState("idleSmooth");
        this._myLocomotionMovementFSM.addState("idleTeleport");

        this._myLocomotionMovementFSM.addTransition("init", "smooth", "start", function () {
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("smooth", "teleport", "next", function () {
            this._myPlayerLocomotionSmooth.stop();
            this._myPlayerLocomotionTeleport.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("teleport", "smooth", "next", function () {
            this._myPlayerLocomotionTeleport.stop();
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("smooth", "idleSmooth", "idle", function () {
            this._myPlayerLocomotionSmooth.stop();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("teleport", "idleTeleport", "idle", function () {
            this._myPlayerLocomotionTeleport.stop();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("idleSmooth", "smooth", "start", function () {
            this._myPlayerLocomotionSmooth.start();
        }.bind(this));

        this._myLocomotionMovementFSM.addTransition("idleTeleport", "teleport", "start", function () {
            this._myPlayerLocomotionTeleport.start();
        }.bind(this));

        this._myLocomotionMovementFSM.init("init");
    }
};