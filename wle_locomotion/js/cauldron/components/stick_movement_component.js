import { Component, Property } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer";
import { PhysicsLayerFlags } from "../../pp/cauldron/physics/physics_layer_flags";
import { XRUtils } from "../../pp/cauldron/utils/xr_utils";
import { ComponentUtils } from "../../pp/cauldron/wl/utils/component_utils";
import { Direction2DTo3DConverter, Direction2DTo3DConverterParams } from "../../pp/gameplay/cauldron/cauldron/direction_2D_to_3D_converter";
import { CollisionCheckBridge } from "../../pp/gameplay/experimental/character_controller/collision/collision_check_bridge";
import { CollisionCheckParams, CollisionRuntimeParams } from "../../pp/gameplay/experimental/character_controller/collision/legacy/collision_check/collision_params";
import { GamepadAxesID, GamepadButtonID } from "../../pp/input/gamepad/gamepad_buttons";
import { vec3_create } from "../../pp/plugin/js/extensions/array_extension";
import { Globals } from "../../pp/pp/globals";

export class StickMovementComponent extends Component {
    static TypeName = "stick-movement";
    static Properties = {
        _myScale: Property.float(1.0),
        _mySpeed: Property.float(4.0),
        _myFlyEnabled: Property.bool(false),
        _myMinAngleToFlyUpHead: Property.float(30),
        _myMinAngleToFlyDownHead: Property.float(50),
        _myMinAngleToFlyUpHand: Property.float(60),
        _myMinAngleToFlyDownHand: Property.float(1),
        _myMinAngleToFlyRight: Property.float(30),
        _myDirectionReference: Property.enum(['head', 'hand left', 'hand right'], 'hand left')

    };

    start() {
        let directionConverterHeadParams = new Direction2DTo3DConverterParams();
        directionConverterHeadParams.myAutoUpdateFlyForward = this._myFlyEnabled;
        directionConverterHeadParams.myAutoUpdateFlyRight = this._myFlyEnabled;
        directionConverterHeadParams.myMinAngleToFlyForwardUp = this._myMinAngleToFlyUpHead;
        directionConverterHeadParams.myMinAngleToFlyForwardDown = this._myMinAngleToFlyDownHead;
        directionConverterHeadParams.myMinAngleToFlyRightUp = this._myMinAngleToFlyRight;
        directionConverterHeadParams.myMinAngleToFlyRightDown = this._myMinAngleToFlyRight;

        let directionConverterHandParams = new Direction2DTo3DConverterParams();
        directionConverterHandParams.myAutoUpdateFlyForward = this._myFlyEnabled;
        directionConverterHandParams.myAutoUpdateFlyRight = this._myFlyEnabled;
        directionConverterHandParams.myMinAngleToFlyForwardUp = this._myMinAngleToFlyUpHand;
        directionConverterHandParams.myMinAngleToFlyForwardDown = this._myMinAngleToFlyDownHand;
        directionConverterHandParams.myMinAngleToFlyRightUp = this._myMinAngleToFlyRight;
        directionConverterHandParams.myMinAngleToFlyRightDown = this._myMinAngleToFlyRight;

        this._myDirectionConverterHead = new Direction2DTo3DConverter(directionConverterHeadParams);
        this._myDirectionConverterHand = new Direction2DTo3DConverter(directionConverterHandParams);

        this._myCollisionCheckParams = null;
        this._myCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myDirectionReferenceObject = Globals.getPlayerObjects(this.engine).myHead;
        this._mySessionActive = false;

        XRUtils.registerSessionStartEndEventListeners(this, this._onXRSessionStart.bind(this), this._onXRSessionEnd.bind(this), false, false, this.engine);

        this._myStickIdleTimer = new Timer(0.25, false);
        this._myIsFlying = false;

        this._myFirstTime = true;

        this._myInitialHeight = 0;
    }

    update(dt) {
        if (dt > 0.25) {
            dt = 0.25;
        }

        if (this._myFirstTime) {
            this._myFirstTime = false;

            this._setupCollisionCheckParams();
        }

        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.SELECT).isPressed()) {
            let mesh = this.object.pp_getComponentHierarchy("mesh");
            let physX = this.object.pp_getComponentHierarchy("physx");

            let scale = mesh.object.pp_getScale();
            scale[1] = this._myInitialHeight / 4;
            mesh.object.pp_setScale(scale);
            physX.extents = scale;
            physX.active = false;
            physX.active = true;

            let position = mesh.object.pp_getPositionLocal();
            position[1] = this._myInitialHeight / (4 * this._myScale);
            mesh.object.pp_setPositionLocal(position);

            this._myCollisionCheckParams.myHeight = this._myInitialHeight / 2;
        } else {
            let mesh = this.object.pp_getComponentHierarchy("mesh");
            let physX = this.object.pp_getComponentHierarchy("physx");

            let scale = mesh.object.pp_getScale();
            scale[1] = this._myInitialHeight / 2;
            mesh.object.pp_setScale(scale);
            physX.extents = scale;
            physX.active = false;
            physX.active = true;

            let position = mesh.object.pp_getPositionLocal();
            position[1] = this._myInitialHeight / (2 * this._myScale);
            mesh.object.pp_setPositionLocal(position);

            this._myCollisionCheckParams.myHeight = this._myInitialHeight;
        }

        let up = this.object.pp_getUp();

        let movement = vec3_create();

        let minIntensityThreshold = 0.1;
        let axes = Globals.getLeftGamepad(this.engine).getAxesInfo(GamepadAxesID.THUMBSTICK).getAxes();
        axes[0] = Math.abs(axes[0]) > minIntensityThreshold ? axes[0] : 0;
        axes[1] = Math.abs(axes[1]) > minIntensityThreshold ? axes[1] : 0;

        if (!axes.vec2_isZero()) {
            this._myStickIdleTimer.start();
            let movementDirection = null;
            if (this._mySessionActive && this._myDirectionReference != 0) {
                movementDirection = this._myDirectionConverterHand.convert(axes, this._myDirectionReferenceObject.pp_getTransform(), up);
            } else {
                movementDirection = this._myDirectionConverterHead.convert(axes, this._myDirectionReferenceObject.pp_getTransform(), up);
            }

            if (!movementDirection.vec3_isZero()) {
                this._myIsFlying = this._myIsFlying || movementDirection.vec3_componentAlongAxis(up).vec3_length() > 0.0001;

                let movementIntensity = axes.vec2_length();
                let speed = Math.pp_lerp(0, this._mySpeed, movementIntensity);
                movementDirection.vec3_scale(speed * this._myScale * dt, movement);
            }
        } else {
            if (this._myStickIdleTimer.isRunning()) {
                this._myStickIdleTimer.update(dt);
                if (this._myStickIdleTimer.isDone()) {
                    this._myDirectionConverterHead.resetFly();
                    this._myDirectionConverterHand.resetFly();
                }
            }
        }

        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.TOP_BUTTON).isPressed()) {
            movement.vec3_add([0, this._mySpeed * this._myScale * dt, 0], movement);
            this._myIsFlying = true;
        } else if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressed()) {
            movement.vec3_add([0, -this._mySpeed * this._myScale * dt, 0], movement);
            this._myIsFlying = true;
        }

        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressEnd(2)) {
            this._myIsFlying = false;
        }

        if (!this._myIsFlying) {
            movement.vec3_add(up.vec3_scale(-3 * this._myScale * dt), movement);
        }

        CollisionCheckBridge.getCollisionCheck(this.engine).move(movement, this.object.pp_getTransformQuat(), this._myCollisionCheckParams, this._myCollisionRuntimeParams);

        this.object.pp_translate(this._myCollisionRuntimeParams.myFixedMovement);

        if (this._myCollisionRuntimeParams.myIsOnGround) {
            this._myIsFlying = false;
            this._myDirectionConverterHead.stopFlying();
            this._myDirectionConverterHand.stopFlying();
        }
    }

    _setupCollisionCheckParams() {
        this._myCollisionCheckParams = new CollisionCheckParams();

        this._myCollisionCheckParams.mySplitMovementEnabled = false;
        this._myCollisionCheckParams.mySplitMovementMaxLength = 0;

        this._myCollisionCheckParams.myRadius = 0.3 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromFeetToIgnore = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromHeadToIgnore = 0.1 * this._myScale;

        this._myCollisionCheckParams.myHorizontalMovementCheckEnabled = false;
        this._myCollisionCheckParams.myHorizontalMovementStepEnabled = false;
        this._myCollisionCheckParams.myHorizontalMovementStepMaxLength = 0;
        this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount = 1;
        this._myCollisionCheckParams.myHorizontalMovementCheckDiagonalOutward = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckDiagonalInward = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonalUpwardOutward = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonalUpwardInward = true;
        this._myCollisionCheckParams.myHorizontalMovementHorizontalStraightCentralCheckEnabled = true;

        this._myCollisionCheckParams.myHalfConeAngle = 60;
        this._myCollisionCheckParams.myHalfConeSliceAmount = 1;
        this._myCollisionCheckParams.myCheckConeBorder = true;
        this._myCollisionCheckParams.myCheckConeRay = true;
        this._myCollisionCheckParams.myHorizontalPositionCheckVerticalIgnoreHitsInsideCollision = true;
        this._myCollisionCheckParams.myHorizontalPositionCheckVerticalDirectionType = 0; // somewhat expensive, 2 times the check for the vertical check of the horizontal movement!

        this._myCollisionCheckParams.myFeetRadius = 0.1 * this._myScale;
        this._myCollisionCheckParams.myAdjustVerticalMovementWithGroundAngleDownhill = true;
        this._myCollisionCheckParams.myAdjustVerticalMovementWithGroundAngleUphill = true;
        this._myCollisionCheckParams.myAdjustVerticalMovementWithCeilingAngleUphill = true;

        this._myCollisionCheckParams.mySnapOnGroundEnabled = true;
        this._myCollisionCheckParams.mySnapOnGroundExtraDistance = 0.1 * this._myScale;
        this._myCollisionCheckParams.mySnapOnCeilingEnabled = false;
        this._myCollisionCheckParams.mySnapOnCeilingExtraDistance = 0.1 * this._myScale;

        this._myCollisionCheckParams.myGroundCircumferenceAddCenter = true;
        this._myCollisionCheckParams.myGroundCircumferenceSliceAmount = 4;
        this._myCollisionCheckParams.myGroundCircumferenceStepAmount = 1;
        this._myCollisionCheckParams.myGroundCircumferenceRotationPerStep = 45;
        this._myCollisionCheckParams.myGroundPopOutExtraDistance = 0.1 * this._myScale;
        this._myCollisionCheckParams.myCeilingPopOutExtraDistance = 0.1 * this._myScale;

        this._myCollisionCheckParams.myCheckHeight = true;
        this._myCollisionCheckParams.myCheckHeightVerticalMovement = true;
        this._myCollisionCheckParams.myCheckHeightVerticalPosition = true;
        this._myCollisionCheckParams.myHeightCheckStepAmountMovement = 1;
        this._myCollisionCheckParams.myHeightCheckStepAmountPosition = 1;
        this._myCollisionCheckParams.myCheckHeightTopMovement = true;
        this._myCollisionCheckParams.myCheckHeightTopPosition = true;
        this._myCollisionCheckParams.myCheckHeightConeOnCollision = true;
        this._myCollisionCheckParams.myCheckVerticalForwardFixed = true;
        this._myCollisionCheckParams.myCheckVerticalStraight = true;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRayOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRayInward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderInward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRayOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRayInward = false;

        this._myCollisionCheckParams.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParams.myCeilingAngleToIgnore = 30;

        let mesh = this.object.pp_getComponentHierarchy("mesh");
        this._myCollisionCheckParams.myHeight = mesh.object.pp_getScale()[1] * 2;
        this._myInitialHeight = this._myCollisionCheckParams.myHeight;

        this._myCollisionCheckParams.myDistanceToBeOnGround = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeGroundInfo = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceToBeOnCeiling = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeCeilingInfo = 0.1 * this._myScale;

        this._myCollisionCheckParams.mySlidingEnabled = true;
        this._myCollisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal = true;
        this._myCollisionCheckParams.mySlidingMaxAttempts = 2;
        this._myCollisionCheckParams.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParams.mySlidingFlickeringPreventionType = 1;      // expensive, 2 times the check for the whole horizontal movement!

        this._myCollisionCheckParams.myHorizontalBlockLayerFlags = new PhysicsLayerFlags();
        this._myCollisionCheckParams.myHorizontalBlockLayerFlags.setAllFlagsActive(true);
        let physXComponents = this.object.pp_getComponentsHierarchy("physx");
        for (let physXComponent of physXComponents) {
            this._myCollisionCheckParams.myHorizontalObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first.pp_equals(second));
        }

        this._myCollisionCheckParams.myVerticalBlockLayerFlags.copy(this._myCollisionCheckParams.myHorizontalBlockLayerFlags);
        this._myCollisionCheckParams.myVerticalObjectsToIgnore.pp_copy(this._myCollisionCheckParams.myHorizontalObjectsToIgnore);

        this._myCollisionCheckParams.myHorizontalPositionCheckEnabled = true;
        this._myCollisionCheckParams.myVerticalMovementCheckEnabled = true;
        this._myCollisionCheckParams.myVerticalPositionCheckEnabled = true;
        this._myCollisionCheckParams.myVerticalMovementReduceEnabled = true;
        this._myCollisionCheckParams.myComputeGroundInfoEnabled = true;
        this._myCollisionCheckParams.myComputeCeilingInfoEnabled = true;

        this._myCollisionCheckParams.myGroundPopOutEnabled = true;
        this._myCollisionCheckParams.myGroundPopOutExtraDistance = 0.1;
        this._myCollisionCheckParams.myCeilingPopOutEnabled = true;
        this._myCollisionCheckParams.myCeilingPopOutExtraDistance = 0.1;

        this._myCollisionCheckParams.myDebugActive = false;
    }

    _onXRSessionStart() {
        if (this._myDirectionReference == 0) {
            this._myDirectionReferenceObject = Globals.getPlayerObjects(this.engine).myHead;
        } else if (this._myDirectionReference == 1) {
            this._myDirectionReferenceObject = Globals.getPlayerObjects(this.engine).myHandLeft;
        } else {
            this._myDirectionReferenceObject = Globals.getPlayerObjects(this.engine).myHandRight;
        }
        this._mySessionActive = true;
    }

    _onXRSessionEnd() {
        this._mySessionActive = false;
        this._myDirectionReferenceObject = Globals.getPlayerObjects(this.engine).myHead;
    }

    pp_clone(clonedObject, deepCloneParams, extraData) {
        let clonedComponent = ComponentUtils.cloneDefault(this, targetObject);

        return clonedComponent;
    }
}