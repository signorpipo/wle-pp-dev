import { Component, Material, Object3D, Property } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { Timer } from "../../../../../cauldron/cauldron/timer.js";
import { PhysicsLayerFlags } from "../../../../../cauldron/physics/physics_layer_flags.js";
import { PhysicsUtils } from "../../../../../cauldron/physics/physics_utils.js";
import { InputUtils } from "../../../../../input/cauldron/input_utils.js";
import { BasePose } from "../../../../../input/pose/base_pose.js";
import { Globals } from "../../../../../pp/globals.js";
import { PlayerLocomotion, PlayerLocomotionParams } from "./player_locomotion.js";

export class PlayerLocomotionComponent extends Component {
    public static override TypeName = "pp-player-locomotion";


    @property.enum(["Smooth", "Teleport"], "Smooth")
    private _myDefaultLocomotionType!: number;

    @property.bool(true)
    private _myAlwaysSmoothForNonVR!: boolean;

    /** Double press main hand thumbstick (default: left) to switch */
    @property.bool(true)
    private _mySwitchLocomotionTypeShortcutEnabled!: boolean;

    @property.string("0, 0, 0, 0, 0, 0, 0, 0")
    private _myPhysicsBlockLayerFlags!: string;

    @property.float(1.70)
    private _myDefaultHeight!: number;

    @property.float(0.3)
    private _myCharacterRadius!: number;

    @property.float(2)
    private _myMaxSpeed!: number;

    @property.float(100)
    private _myMaxRotationSpeed!: number;

    @property.float(-20)
    private _myGravityAcceleration!: number;

    @property.float(-15)
    private _myMaxGravitySpeed!: number;

    @property.float(1)
    private _mySpeedSlowDownPercentageOnWallSlid!: number;

    @property.bool(true)
    private _myIsSnapTurn!: boolean;

    @property.bool(true)
    private _mySnapTurnOnlyVR!: boolean;

    @property.float(30)
    private _mySnapTurnAngle!: number;

    @property.float(0)
    private _mySnapTurnSpeedDegrees!: number;



    @property.bool(false)
    private _myFlyEnabled!: boolean;

    @property.bool(false)
    private _myStartFlying!: boolean;

    @property.bool(true)
    private _myFlyWithButtonsEnabled!: boolean;

    @property.bool(true)
    private _myFlyWithViewAngleEnabled!: boolean;

    @property.float(30)
    private _myMinAngleToFlyUpNonVR!: number;

    @property.float(50)
    private _myMinAngleToFlyDownNonVR!: number;

    @property.float(60)
    private _myMinAngleToFlyUpVR!: number;

    @property.float(1)
    private _myMinAngleToFlyDownVR!: number;

    @property.float(60)
    private _myMinAngleToFlyRight!: number;


    @property.enum(["Left", "Right"], "Left")
    private _myMainHand!: number;

    @property.bool(true)
    private _myDirectionInvertForwardWhenUpsideDown!: boolean;

    @property.enum(["Head", "Hand", "Custom Object"], "Head")
    private _myVRDirectionReferenceType!: number;

    @property.object()
    private _myVRDirectionReferenceObject!: Object3D;


    @property.enum(["Instant", "Blink", "Shift"], "Shift")
    private _myTeleportType!: number;

    @property.float(3)
    private _myTeleportMaxDistance!: number;

    @property.float(1.25)
    private _myTeleportMaxHeightDifference!: number;

    @property.bool(false)
    private _myTeleportRotationOnUpEnabled!: boolean;

    @property.material()
    private _myTeleportValidMaterial!: Material;

    @property.material()
    private _myTeleportInvalidMaterial!: Material;

    @property.object()
    private _myTeleportPositionObject!: Object3D;

    @property.bool(true)
    private _myTeleportPositionObjectRotateWithHead!: boolean;

    @property.object()
    private _myTeleportParableStartReferenceObject!: Object3D;


    @property.bool(true)
    private _myResetRealOnStart!: boolean;

    /**
     * #WARN With `_myResetRealOnStartFramesAmount` at `1` it can happen that you enter the session like 1 frame before the game load
     * and the head pose might have not been properly initialized yet in the WebXR API, so the reset real will not happen has expected  
     * Since this is a sort of edge case (either u enter after the load, or you were already in for more than 2-3 frames), and that
     * setting this to more than `1` can cause a visible (even if very short) stutter after the load (due to resetting the head multiple times),
     * it's better to keep this value at `1`  
     * A possible effect of the edge case is the view being obscured on start because it thinks you are colliding
     * 
     * A value of `3` will make u sure that the head pose will be initialized and the reset real will happen as expected in any case  
     * For example, if u have a total fade at start and nothing can be seen aside the clear color for at least, let's say, 10 frames, 
     * you can set this to `3` safely, since there will be no visible stutter to be seen (beside the clear color)
     */
    @property.int(1)
    private _myResetRealOnStartFramesAmount!: number;

    /** Can fix some head through floor issues, when you can move your head completely to the other side of the floor  
        If the floors are thick enough that this can't happen, you can leave this to false  */
    @property.bool(true)
    private _myResetHeadToFeetInsteadOfReal!: boolean;

    @property.float(0.25)
    private _myResetHeadToRealMinDistance!: number;


    /** Valid means, for example, that the real player has not moved inside a wall by moving in the real space.
        Works 100% properly only if it has the same value as `_myViewOcclusionInsideWallsEnabled` (both true or false)  */
    @property.bool(true)
    private _mySyncWithRealWorldPositionOnlyIfValid!: boolean;

    /** Works 100% properly only if it has the same value as `_mySyncWithRealWorldPositionOnlyIfValid` (both true or false)  */
    @property.bool(true)
    private _myViewOcclusionInsideWallsEnabled!: boolean;


    @property.bool(false)
    private _mySyncNonVRHeightWithVROnExitSession!: boolean;

    @property.bool(false)
    private _mySyncNonVRVerticalAngleWithVROnExitSession!: boolean;


    @property.bool(true)
    private _mySyncHeadWithRealAfterLocomotionUpdateIfNeeded!: boolean;


    @property.enum(["Very Low", "Low", "Medium", "High", "Very High"], "High")
    private _myColliderAccuracy!: number;

    @property.bool(false)
    private _myColliderCheckOnlyFeet!: boolean;

    @property.bool(true)
    private _myColliderSlideAlongWall!: boolean;

    @property.float(30)
    private _myColliderMaxWalkableGroundAngle!: number;

    @property.bool(true)
    private _myColliderSnapOnGround!: boolean;

    @property.float(0.1)
    private _myColliderMaxDistanceToSnapOnGround!: number;

    @property.float(0.1)
    private _myColliderMaxWalkableGroundStepHeight!: number;

    @property.bool(false)
    private _myColliderPreventFallingFromEdges!: boolean;


    /** Main hand (default: left) select + thumbstick press, auto switch to smooth */
    @property.bool(false)
    private _myDebugFlyShortcutEnabled!: boolean;

    @property.float(5)
    private _myDebugFlyMaxSpeedMultiplier!: number;

    /** Main hand (default: left) thumbstick pressed while moving */
    @property.bool(false)
    private _myMoveThroughCollisionShortcutEnabled!: boolean;

    /** Not main hand (default: right) thumbstick pressed while moving */
    @property.bool(false)
    private _myMoveHeadShortcutEnabled!: boolean;

    /** Main hand (default: left) select pressed while moving */
    @property.bool(false)
    private _myTripleSpeedShortcutEnabled!: boolean;


    @property.bool(false)
    private _myDebugHorizontalEnabled!: boolean;

    @property.bool(false)
    private _myDebugVerticalEnabled!: boolean;


    @property.bool(false)
    private _myCollisionCheckDisabled!: boolean;


    @property.bool(false)
    private _myRaycastCountLogEnabled!: boolean;

    @property.bool(false)
    private _myRaycastVisualDebugEnabled!: boolean;

    @property.bool(false)
    private _myPerformanceLogEnabled!: boolean;


    private _myPlayerLocomotion!: PlayerLocomotion;

    private _myLocomotionStarted: boolean = false;
    private _myResetReal: boolean = true;

    private _myDebugPerformanceLogTimer: Timer = new Timer(0.5);
    private _myDebugPerformanceLogTotalTime: number = 0;
    private _myDebugPerformanceLogFrameCount: number = 0;


    public override start(): void {
        const params = new PlayerLocomotionParams(this.engine);

        params.myDefaultLocomotionType = this._myDefaultLocomotionType;
        params.myAlwaysSmoothForNonVR = this._myAlwaysSmoothForNonVR;
        params.mySwitchLocomotionTypeShortcutEnabled = this._mySwitchLocomotionTypeShortcutEnabled;

        params.myDefaultHeight = this._myDefaultHeight;

        params.myMaxSpeed = this._myMaxSpeed;
        params.myMaxRotationSpeed = this._myMaxRotationSpeed;
        params.myGravityAcceleration = this._myGravityAcceleration;
        params.myMaxGravitySpeed = this._myMaxGravitySpeed;

        params.myCharacterRadius = this._myCharacterRadius;

        params.mySpeedSlowDownPercentageOnWallSlid = this._mySpeedSlowDownPercentageOnWallSlid;

        params.myIsSnapTurn = this._myIsSnapTurn;
        params.mySnapTurnOnlyVR = this._mySnapTurnOnlyVR;
        params.mySnapTurnAngle = this._mySnapTurnAngle;
        params.mySnapTurnSpeedDegrees = this._mySnapTurnSpeedDegrees;

        params.myFlyEnabled = this._myFlyEnabled;
        params.myStartFlying = this._myStartFlying;
        params.myFlyWithButtonsEnabled = this._myFlyWithButtonsEnabled;
        params.myFlyWithViewAngleEnabled = this._myFlyWithViewAngleEnabled;
        params.myMinAngleToFlyUpNonVR = this._myMinAngleToFlyUpNonVR;
        params.myMinAngleToFlyDownNonVR = this._myMinAngleToFlyDownNonVR;
        params.myMinAngleToFlyUpVR = this._myMinAngleToFlyUpVR;
        params.myMinAngleToFlyDownVR = this._myMinAngleToFlyDownVR;
        params.myMinAngleToFlyRight = this._myMinAngleToFlyRight;

        params.myMainHand = InputUtils.getHandednessByIndex(this._myMainHand)!;

        params.myDirectionInvertForwardWhenUpsideDown = this._myDirectionInvertForwardWhenUpsideDown;
        params.myVRDirectionReferenceType = this._myVRDirectionReferenceType;
        params.myVRDirectionReferenceObject = this._myVRDirectionReferenceObject;

        params.myForeheadExtraHeight = 0.1;

        params.myTeleportType = this._myTeleportType;
        params.myTeleportMaxDistance = this._myTeleportMaxDistance;
        params.myTeleportMaxHeightDifference = this._myTeleportMaxHeightDifference;
        params.myTeleportRotationOnUpEnabled = this._myTeleportRotationOnUpEnabled;
        params.myTeleportValidMaterial = this._myTeleportValidMaterial;
        params.myTeleportInvalidMaterial = this._myTeleportInvalidMaterial;
        params.myTeleportPositionObject = this._myTeleportPositionObject;
        params.myTeleportPositionObjectRotateWithHead = this._myTeleportPositionObjectRotateWithHead;
        params.myTeleportParableStartReferenceObject = this._myTeleportParableStartReferenceObject;

        params.myResetRealOnStart = this._myResetRealOnStart;
        params.myResetRealOnStartFramesAmount = this._myResetRealOnStartFramesAmount;
        params.myResetHeadToFeetInsteadOfReal = this._myResetHeadToFeetInsteadOfReal;
        params.myResetHeadToRealMinDistance = this._myResetHeadToRealMinDistance;

        params.mySyncWithRealWorldPositionOnlyIfValid = this._mySyncWithRealWorldPositionOnlyIfValid;
        params.myViewOcclusionInsideWallsEnabled = this._myViewOcclusionInsideWallsEnabled;

        params.mySyncNonVRHeightWithVROnExitSession = this._mySyncNonVRHeightWithVROnExitSession;
        params.mySyncNonVRVerticalAngleWithVROnExitSession = this._mySyncNonVRVerticalAngleWithVROnExitSession;

        params.mySyncHeadWithRealAfterLocomotionUpdateIfNeeded = this._mySyncHeadWithRealAfterLocomotionUpdateIfNeeded;

        params.myColliderAccuracy = this._myColliderAccuracy;
        params.myColliderCheckOnlyFeet = this._myColliderCheckOnlyFeet;
        params.myColliderSlideAlongWall = this._myColliderSlideAlongWall;
        params.myColliderMaxWalkableGroundAngle = this._myColliderMaxWalkableGroundAngle;
        params.myColliderSnapOnGround = this._myColliderSnapOnGround;
        params.myColliderMaxDistanceToSnapOnGround = this._myColliderMaxDistanceToSnapOnGround;
        params.myColliderMaxWalkableGroundStepHeight = this._myColliderMaxWalkableGroundStepHeight;
        params.myColliderPreventFallingFromEdges = this._myColliderPreventFallingFromEdges;

        params.myDebugFlyShortcutEnabled = this._myDebugFlyShortcutEnabled;
        params.myDebugFlyMaxSpeedMultiplier = this._myDebugFlyMaxSpeedMultiplier;
        params.myMoveThroughCollisionShortcutEnabled = this._myMoveThroughCollisionShortcutEnabled;
        params.myMoveHeadShortcutEnabled = this._myMoveHeadShortcutEnabled;
        params.myTripleSpeedShortcutEnabled = this._myTripleSpeedShortcutEnabled;

        params.myDebugHorizontalEnabled = this._myDebugHorizontalEnabled;
        params.myDebugVerticalEnabled = this._myDebugVerticalEnabled;

        params.myCollisionCheckDisabled = this._myCollisionCheckDisabled;

        params.myPhysicsBlockLayerFlags.copy(this._getPhysicsBlockLayersFlags());

        this._myPlayerLocomotion = new PlayerLocomotion(params);

        this._myLocomotionStarted = false;
        this._myResetReal = true;

        this._myDebugPerformanceLogTimer = new Timer(0.5);
        this._myDebugPerformanceLogTotalTime = 0;
        this._myDebugPerformanceLogFrameCount = 0;

        Globals.getHeadPose(this.engine)!.registerPostPoseUpdatedEventEventListener(this, this.onPostPoseUpdatedEvent.bind(this));
    }

    public onPostPoseUpdatedEvent(dt: number, pose: Readonly<BasePose>, manualUpdate: boolean): void {
        if (manualUpdate) return;

        let startTime = 0;
        if (this._myPerformanceLogEnabled && Globals.isDebugEnabled(this.engine)) {
            startTime = window.performance.now();
        }

        let raycastVisualDebugEnabledBackup = false;
        if (this._myRaycastVisualDebugEnabled && Globals.isDebugEnabled(this.engine)) {
            raycastVisualDebugEnabledBackup = PhysicsUtils.isRaycastVisualDebugEnabled(this.engine.physics);
            PhysicsUtils.setRaycastVisualDebugEnabled(true, this.engine.physics);
        }

        if (this._myRaycastCountLogEnabled && Globals.isDebugEnabled(this.engine)) {
            PhysicsUtils.resetRaycastCount(this.engine.physics);
        }

        if (!this._myLocomotionStarted) {
            this._myLocomotionStarted = true;
            this._myPlayerLocomotion.start();
        }

        this._myPlayerLocomotion.update(dt);

        if (this._myPerformanceLogEnabled && Globals.isDebugEnabled(this.engine)) {
            const endTime = window.performance.now();
            this._myDebugPerformanceLogTotalTime += endTime - startTime;
            this._myDebugPerformanceLogFrameCount++;

            this._myDebugPerformanceLogTimer.update(dt);
            if (this._myDebugPerformanceLogTimer.isDone()) {
                this._myDebugPerformanceLogTimer.start();

                const averageTime = this._myDebugPerformanceLogTotalTime / this._myDebugPerformanceLogFrameCount;

                console.log("Locomotion ms: " + averageTime.toFixed(3));

                this._myDebugPerformanceLogTotalTime = 0;
                this._myDebugPerformanceLogFrameCount = 0;
            }
        }

        if (this._myRaycastVisualDebugEnabled && Globals.isDebugEnabled(this.engine)) {
            PhysicsUtils.setRaycastVisualDebugEnabled(raycastVisualDebugEnabledBackup, this.engine.physics);
        }

        if (this._myRaycastCountLogEnabled && Globals.isDebugEnabled(this.engine)) {
            console.log("Raycast count: " + PhysicsUtils.getRaycastCount(this.engine.physics));
            PhysicsUtils.resetRaycastCount(this.engine.physics);
        }
    }

    public getPlayerLocomotion(): PlayerLocomotion {
        return this._myPlayerLocomotion;
    }

    public override onActivate(): void {
        if (this._myPlayerLocomotion != null) {
            this._myPlayerLocomotion.setActive(true);
        }
    }

    public override onDeactivate(): void {
        if (this._myPlayerLocomotion != null) {
            this._myPlayerLocomotion.setActive(false);
        }
    }

    private _getPhysicsBlockLayersFlags(): PhysicsLayerFlags {
        const physicsFlags = new PhysicsLayerFlags();

        const flags = [...this._myPhysicsBlockLayerFlags.split(",")];
        for (let i = 0; i < flags.length; i++) {
            physicsFlags.setFlagActive(i, flags[i].trim() == "1");
        }

        return physicsFlags;
    }

    public override onDestroy(): void {
        this._myPlayerLocomotion?.destroy();
    }
}