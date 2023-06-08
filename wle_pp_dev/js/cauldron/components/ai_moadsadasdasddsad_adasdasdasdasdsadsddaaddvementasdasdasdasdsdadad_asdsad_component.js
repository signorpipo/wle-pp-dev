import { Component, Property } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer";
import { PhysicsLayerFlags } from "../../pp/cauldron/physics/physics_layer_flags";
import { ComponentUtils } from "../../pp/cauldron/wl/utils/component_utils";
import { CollisionCheckBridge } from "../../pp/gameplay/experimental/character_controller/collision/collision_check_bridge";
import { CollisionCheckParams, CollisionRuntimeParams } from "../../pp/gameplay/experimental/character_controller/collision/legacy/collision_check/collision_params";
import { quat2_create, vec3_create } from "../../pp/plugin/js/extensions/array_extension";

export class AIMovementComponent extends Component {
    static TypeName = "ai-movement";
    static Properties = {
        _myScale: Property.float(1.0),
        _myMinSpeed: Property.float(1.0),
        _myMaxSpeed: Property.float(3.0),
        _myMinDirectionTime: Property.float(1.0),
        _myMaxDirectionTime: Property.float(5.0)

    };

    start() {
        this._myCurrentDirection = vec3_create(0, 0, 1);

        this._myChangeDirectionTimer = new Timer(0);
        this._myChangeDirectionTimer.end();

        this._myCollisionTimer = new Timer(1);
        this._myCollisionTimer.end();

        this._mySpeed = Math.pp_random(this._myMinSpeed, this._myMaxSpeed);

        this._myCollisionCheckParams = null;
        this._myCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myFirstTime = true;

        this._changeDirection(false);

    }

    update(dt) {
        // Implemented outside class definition
    }

    _changeDirection(goOpposite) {
        // Implemented outside class definition
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
        this._myCollisionCheckParams.myCheckConeBorder = false;
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
        this._myCollisionCheckParams.myCheckHeightConeOnCollision = false;
        this._myCollisionCheckParams.myCheckVerticalForwardFixed = true;
        this._myCollisionCheckParams.myCheckVerticalStraight = true;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRayOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRayInward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderInward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRayOutward = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRayInward = false;
        this._myCollisionCheckParams.myCheckVerticalSearchFartherVerticalHit = false;

        this._myCollisionCheckParams.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParams.myCeilingAngleToIgnore = 0;

        let mesh = this.object.pp_getComponentHierarchy("mesh");
        this._myCollisionCheckParams.myHeight = mesh.object.pp_getScale()[1] * 2;

        this._myCollisionCheckParams.myDistanceToBeOnGround = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeGroundInfo = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceToBeOnCeiling = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeCeilingInfo = 0.1 * this._myScale;
        this._myCollisionCheckParams.myVerticalFixToBeOnGround = 0;
        this._myCollisionCheckParams.myVerticalFixToComputeGroundInfo = 0;
        this._myCollisionCheckParams.myVerticalFixToBeOnCeiling = 0;
        this._myCollisionCheckParams.myVerticalFixToComputeCeilingInfo = 0;

        this._myCollisionCheckParams.mySlidingEnabled = true;
        this._myCollisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal = false;
        this._myCollisionCheckParams.mySlidingMaxAttempts = 2;
        this._myCollisionCheckParams.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParams.mySlidingFlickeringPreventionType = 0;      // expensive, 2 times the check for the whole horizontal movement!

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

        this._myCollisionCheckParams.myDebugHorizontalMovementActive = true;
        this._myCollisionCheckParams.myDebugHorizontalPositionActive = true;
        this._myCollisionCheckParams.myDebugVerticalMovementActive = true;
        this._myCollisionCheckParams.myDebugVerticalPositionActive = true;
        this._myCollisionCheckParams.myDebugSlidingActive = true;
        this._myCollisionCheckParams.myDebugRuntimeParamsActive = false;
        this._myCollisionCheckParams.myDebugMovementActive = false;
    }

    pp_clone(targetObject) {
        let clonedComponent = ComponentUtils.cloneDefault(this, targetObject);

        return clonedComponent;
    }
}



// IMPLEMENTATION

AIMovementComponent.prototype.update = function () {
    let tempUp = vec3_create();
    let tempMovement = vec3_create();
    let tempGravity = vec3_create();
    let tempTransformQuat = quat2_create();
    return function update(dt) {
        if (dt > 0.25) {
            dt = 0.25;
        }

        if (this._myFirstTime) {
            this._myFirstTime = false;

            this._setupCollisionCheckParams();
        }

        this._myChangeDirectionTimer.update(dt);
        this._myCollisionTimer.update(dt);

        if (this._myChangeDirectionTimer.isDone()) {
            this._changeDirection(false);
        }

        let up = this.object.pp_getUp(tempUp);
        let movement = this._myCurrentDirection.vec3_scale(this._mySpeed * this._myScale * dt, tempMovement);
        movement.vec3_add(up.vec3_scale(-3 * this._myScale * dt, tempGravity), movement);

        CollisionCheckBridge.getCollisionCheck(this.engine).move(movement, this.object.pp_getTransformQuat(tempTransformQuat), this._myCollisionCheckParams, this._myCollisionRuntimeParams);

        if (this._myCollisionRuntimeParams.myHorizontalMovementCanceled) {
            if (this._myCollisionTimer.isDone()) {
                this._myCollisionTimer.start();

                this._changeDirection(true);
            }
        }

        this.object.pp_translate(this._myCollisionRuntimeParams.myFixedMovement);
    };
}();

AIMovementComponent.prototype._changeDirection = function () {
    let tempUp = vec3_create();
    return function _changeDirection(goOpposite) {
        let up = this.object.pp_getUp(tempUp);

        if (!goOpposite) {
            this._myCurrentDirection.vec3_rotateAxis(Math.pp_random(-180, 180), up, this._myCurrentDirection);
        } else {
            this._myCurrentDirection.vec3_rotateAxis(180, up, this._myCurrentDirection);
            this._myCurrentDirection.vec3_rotateAxis(Math.pp_random(-90, 90), up, this._myCurrentDirection);
        }

        this._myChangeDirectionTimer.start(Math.pp_random(this._myMinDirectionTime, this._myMaxDirectionTime));
    };
}();
