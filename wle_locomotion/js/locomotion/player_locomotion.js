PlayerLocomotionDirectionReferenceType = {
    HEAD: 0,
    HAND_LEFT: 1,
    HAND_RIGHT: 2,
    CUSTOM_OBJECT: 3,
};

PlayerLocomotionParams = class PlayerLocomotionParams {
    constructor() {
        this.myMaxSpeed = 0;
        this.myMaxRotationSpeed = 0;

        this.myIsSnapTurn = false;
        this.mySnapTurnAngle = 0;

        this.myFlyEnabled = false;
        this.myMinAngleToFlyUpNonVR = 0;
        this.myMinAngleToFlyDownNonVR = 0;
        this.myMinAngleToFlyUpVR = 0;
        this.myMinAngleToFlyDownVR = 0;
        this.myMinAngleToFlyRight = 0;

        this.myVRDirectionReferenceType = PlayerLocomotionDirectionReferenceType.HEAD;
        this.myVRDirectionReferenceObject = null;

        this.myForeheadExtraHeight = 0;
    }
};

// #TODO add lerped snap on vertical over like half a second to avoid the "snap effect"
// this could be done by detatching the actual vertical position of the player from the collision real one when a snap is detected above a certain threshold
// with a timer, after which the vertical position is just copied, while during the detatching is lerped toward the collision vertical one
PlayerLocomotion = class PlayerLocomotion {
    constructor(params) {
        this._myParams = params;

        this._myCollisionCheckParamsSmooth = new CollisionCheckParams();
        this._myCollisionCheckParamsTeleport = new CollisionCheckParams();

        this._myCollisionRuntimeParams = new CollisionRuntimeParams();
        this._myMovementRuntimeParams = new PlayerLocomotionMovementRuntimeParams();
        this._myMovementRuntimeParams.myCollisionRuntimeParams = this._myCollisionRuntimeParams;

        this._setupCollisionCheckParamsSmooth();
        this._setupCollisionCheckParamsTeleport();

        {
            let params = new PlayerHeadManagerParams();

            params.mySessionChangeResyncEnabled = true;

            params.myBlurEndResyncEnabled = true;
            params.myBlurEndResyncRotation = true;

            params.myExitSessionResyncHeight = true;
            params.myExitSessionResyncVerticalAngle = true;
            params.myExitSessionRemoveRightTilt = true;
            params.myExitSessionAdjustMaxVerticalAngle = true;
            params.myExitSessionMaxVerticalAngle = 90;

            this._myPlayerHeadManager = new PlayerHeadManager(params);
        }

        {
            let params = new PlayerLocomotionRotateParams();

            params.myPlayerHeadManager = this._myPlayerHeadManager;

            params.myMaxRotationSpeed = this._myParams.myMaxRotationSpeed;
            params.myIsSnapTurn = this._myParams.myIsSnapTurn;
            params.mySnapTurnAngle = this._myParams.mySnapTurnAngle;

            params.myRotationMinStickIntensityThreshold = 0.1;
            params.mySnapTurnActivateThreshold = 0.5;
            params.mySnapTurnResetThreshold = 0.4;

            params.myClampVerticalAngle = true;
            params.myMaxVerticalAngle = 90;

            this._myPlayerLocomotionRotate = new PlayerLocomotionRotate(params);
        }

        {
            {
                let params = new PlayerLocomotionSmoothParams();

                params.myPlayerHeadManager = this._myPlayerHeadManager;

                params.myCollisionCheckParams = this._myCollisionCheckParamsSmooth;

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

                params.myMaxDistance = 10;
                params.myMaxHeightDifference = 20;
                params.myGroundAngleToIgnoreUpward = this._myCollisionCheckParamsSmooth.myGroundAngleToIgnore;
                params.myMustBeOnGround = true;

                params.myTeleportBlockLayerFlags.setAllFlagsActive(true);

                params.myTeleportFeetPositionMustBeVisible = false;
                params.myTeleportHeadPositionMustBeVisible = false;
                params.myTeleportHeadOrFeetPositionMustBeVisible = true;

                params.myVisibilityBlockLayerFlags.setAllFlagsActive(true);

                params.myPerformTeleportAsMovement = false;
                params.myTeleportAsMovementRemoveVerticalMovement = true;
                params.myTeleportAsMovementExtraVerticalMovementPerMeter = -2;

                params.myGravityAcceleration = -9.81;

                params.myDebugActive = true;
                params.myDebugDetectActive = true;
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
        this._myPlayerLocomotionRotate.start();

        this._myPlayerLocomotionSmooth.init();
        this._myPlayerLocomotionTeleport.init();

        this._myLocomotionMovementFSM.perform("start");
    }

    update(dt) {
        this._myPlayerHeadManager.update(dt);

        if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.THUMBSTICK).isPressEnd(2)) {
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
        this._myCollisionCheckParamsSmooth.myHeight = this._myPlayerHeadManager.getHeadHeight();
        if (this._myCollisionCheckParamsSmooth.myHeight <= 0.000001) {
            this._myCollisionCheckParamsSmooth.myHeight = 0;
        } else {
            this._myCollisionCheckParamsSmooth.myHeight += this._myParams.myForeheadExtraHeight;
        }

        this._myCollisionCheckParamsTeleport.myHeight = this._myCollisionCheckParamsSmooth.myHeight;
    }

    _setupCollisionCheckParamsSmooth() {
        this._myCollisionCheckParamsSmooth.mySplitMovementEnabled = false;
        this._myCollisionCheckParamsSmooth.mySplitMovementMaxLength = 0;

        this._myCollisionCheckParamsSmooth.myRadius = 0.3;
        this._myCollisionCheckParamsSmooth.myDistanceFromFeetToIgnore = 0.1;
        this._myCollisionCheckParamsSmooth.myDistanceFromHeadToIgnore = 0.1;

        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckEnabled = true;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementStepEnabled = false;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementStepMaxLength = 0;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementRadialStepAmount = 1;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckDiagonal = true;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckStraight = false;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckHorizontalBorder = false;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckVerticalStraight = false;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckVerticalDiagonal = true;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this._myCollisionCheckParamsSmooth.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;

        this._myCollisionCheckParamsSmooth.myHalfConeAngle = 60;
        this._myCollisionCheckParamsSmooth.myHalfConeSliceAmount = 2;
        this._myCollisionCheckParamsSmooth.myCheckConeBorder = true;
        this._myCollisionCheckParamsSmooth.myCheckConeRay = true;
        this._myCollisionCheckParamsSmooth.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = false;
        this._myCollisionCheckParamsSmooth.myHorizontalPositionCheckVerticalDirectionType = 2; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!

        this._myCollisionCheckParamsSmooth.myFeetRadius = 0.1;
        this._myCollisionCheckParamsSmooth.myAdjustVerticalMovementWithSurfaceAngle = true;

        this._myCollisionCheckParamsSmooth.mySnapOnGroundEnabled = true;
        this._myCollisionCheckParamsSmooth.mySnapOnGroundExtraDistance = 0.1;
        this._myCollisionCheckParamsSmooth.mySnapOnCeilingEnabled = false;
        this._myCollisionCheckParamsSmooth.mySnapOnCeilingExtraDistance = 0.1;

        this._myCollisionCheckParamsSmooth.myGroundCircumferenceSliceAmount = 8;
        this._myCollisionCheckParamsSmooth.myGroundCircumferenceStepAmount = 2;
        this._myCollisionCheckParamsSmooth.myGroundCircumferenceRotationPerStep = 22.5;
        this._myCollisionCheckParamsSmooth.myGroundFixDistanceFromFeet = 0.1;
        this._myCollisionCheckParamsSmooth.myGroundFixDistanceFromHead = 0.1;

        this._myCollisionCheckParamsSmooth.myCheckHeight = true;
        this._myCollisionCheckParamsSmooth.myCheckHeightTop = true;
        this._myCollisionCheckParamsSmooth.myCheckHeightConeOnCollision = true;
        this._myCollisionCheckParamsSmooth.myCheckHeightConeOnCollisionKeepHit = false;
        this._myCollisionCheckParamsSmooth.myHeightCheckStepAmount = 1;
        this._myCollisionCheckParamsSmooth.myCheckVerticalFixedForwardEnabled = true;
        this._myCollisionCheckParamsSmooth.myCheckVerticalStraight = true;
        this._myCollisionCheckParamsSmooth.myCheckVerticalDiagonalRay = false;
        this._myCollisionCheckParamsSmooth.myCheckVerticalDiagonalBorder = false;
        this._myCollisionCheckParamsSmooth.myCheckVerticalDiagonalBorderRay = false;
        this._myCollisionCheckParamsSmooth.myCheckVerticalSearchFurtherVerticalHit = false;

        this._myCollisionCheckParamsSmooth.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParamsSmooth.myCeilingAngleToIgnore = 30;

        this._myCollisionCheckParamsSmooth.myHeight = 1;

        this._myCollisionCheckParamsSmooth.myDistanceToBeOnGround = 0.001;
        this._myCollisionCheckParamsSmooth.myDistanceToComputeGroundInfo = 0.1;
        this._myCollisionCheckParamsSmooth.myDistanceToBeOnCeiling = 0.001;
        this._myCollisionCheckParamsSmooth.myDistanceToComputeCeilingInfo = 0.1;
        this._myCollisionCheckParamsSmooth.myVerticalFixToBeOnGround = 0;
        this._myCollisionCheckParamsSmooth.myVerticalFixToComputeGroundInfo = 0;
        this._myCollisionCheckParamsSmooth.myVerticalFixToBeOnCeiling = 0;
        this._myCollisionCheckParamsSmooth.myVerticalFixToComputeCeilingInfo = 0;

        this._myCollisionCheckParamsSmooth.mySlidingEnabled = true;
        this._myCollisionCheckParamsSmooth.mySlidingHorizontalMovementCheckBetterNormal = true;
        this._myCollisionCheckParamsSmooth.mySlidingMaxAttempts = 4;
        this._myCollisionCheckParamsSmooth.mySlidingCheckBothDirections = true;        // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParamsSmooth.mySlidingFlickeringPreventionType = 1;      // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParamsSmooth.mySlidingFlickeringPreventionCheckOnlyIfAlreadySliding = true;
        this._myCollisionCheckParamsSmooth.mySlidingFlickerPreventionCheckAnywayCounter = 4;
        this._myCollisionCheckParamsSmooth.mySlidingAdjustSign90Degrees = true;

        this._myCollisionCheckParamsSmooth.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this._myCollisionCheckParamsSmooth.myBlockLayerFlags.setAllFlagsActive(true);
        let physXComponents = PP.myPlayerObjects.myPlayer.pp_getComponentsHierarchy("physx");
        for (let physXComponent of physXComponents) {
            this._myCollisionCheckParamsSmooth.myObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first.pp_equals(second));
        }

        this._myCollisionCheckParamsSmooth.myDebugActive = false;

        this._myCollisionCheckParamsSmooth.myDebugHorizontalMovementActive = false;
        this._myCollisionCheckParamsSmooth.myDebugHorizontalPositionActive = true;
        this._myCollisionCheckParamsSmooth.myDebugVerticalMovementActive = false;
        this._myCollisionCheckParamsSmooth.myDebugVerticalPositionActive = false;
        this._myCollisionCheckParamsSmooth.myDebugSlidingActive = false;
        this._myCollisionCheckParamsSmooth.myDebugSurfaceInfoActive = false;
        this._myCollisionCheckParamsSmooth.myDebugRuntimeParamsActive = false;
        this._myCollisionCheckParamsSmooth.myDebugMovementActive = false;
    }

    _setupCollisionCheckParamsTeleport() {
        this._myCollisionCheckParamsTeleport.copy(this._myCollisionCheckParamsSmooth);

        this._myCollisionCheckParamsTeleport.myHalfConeAngle = 180;
        this._myCollisionCheckParamsTeleport.myHalfConeSliceAmount = 6;

        this._myCollisionCheckParamsTeleport.myCheckVerticalFixedForwardEnabled = true;
        this._myCollisionCheckParamsTeleport.myCheckVerticalFixedForward = [0, 0, 1];

        this._myCollisionCheckParamsTeleport.myCheckHorizontalFixedForwardEnabled = true;
        this._myCollisionCheckParamsTeleport.myCheckHorizontalFixedForward = [0, 0, 1];

        this._myCollisionCheckParamsTeleport.myGroundAngleToIgnore = 60;
        this._myCollisionCheckParamsTeleport.myCeilingAngleToIgnore = 30;

        this._myCollisionCheckParamsTeleport.myDistanceToBeOnGround = 0.001;

        this._myCollisionCheckParamsTeleport.mySlidingEnabled = false;

        this._myCollisionCheckParamsTeleport.mySplitMovementEnabled = true;
        this._myCollisionCheckParamsTeleport.mySplitMovementMaxLength = 0.2;

        //this._myCollisionCheckParamsTeleport.myHalfConeAngle = 90;
        //this._myCollisionCheckParamsTeleport.myHalfConeSliceAmount = 3;
        //this._myCollisionCheckParamsTeleport.myCheckHorizontalFixedForwardEnabled = false;

        this._myCollisionCheckParamsTeleport.myDebugActive = false;
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