import { FSM, SkipStateFunction } from "../../../../../../cauldron/fsm/fsm.js";
import { EasingFunction } from "../../../../../../cauldron/utils/math_utils.js";
import { vec3_create } from "../../../../../../plugin/js/extensions/array/vec_create_extension.js";
import { PlayerLocomotionTeleportState } from "./player_locomotion_teleport_state.js";
import { PlayerLocomotionTeleportTeleportBlinkState } from "./player_locomotion_teleport_teleport_blink_state.js";
import { PlayerLocomotionTeleportTeleportShiftState } from "./player_locomotion_teleport_teleport_shift_state.js";

export let PlayerLocomotionTeleportTeleportType = {
    INSTANT: 0,
    BLINK: 1,
    SHIFT: 2
};

export class PlayerLocomotionTeleportTeleportParams {

    constructor() {
        this.myTeleportType = PlayerLocomotionTeleportTeleportType.SHIFT;

        this.myBlinkFadeOutSeconds = 0.2;
        this.myBlinkFadeInSeconds = 0.2;
        this.myBlinkWaitSeconds = 0.1;
        this.myBlinkSphereColor = vec3_create();
        this.myBlinkSphereScale = 0.5;

        this.myShiftMovementSeconds = 0.15;
        this.myShiftMovementSecondsMultiplierOverDistanceFunction = null;
        this.myShiftMovementEasingFunction = EasingFunction.easeInOut;

        this.myShiftRotateSeconds = 1;
        this.myShiftRotateSecondsMultiplierOverAngleFunction = null;
        this.myShiftRotateEasingFunction = EasingFunction.easeOut;
        this.myShiftRotateStartAfterMovementPercentage = 0.7;

        this.myShiftRotateSecondsMultiplierOverAngleFunction = function (angle) {
            return EasingFunction.easeOut(angle / 180);
        };
    }
}

export class PlayerLocomotionTeleportTeleportState extends PlayerLocomotionTeleportState {

    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams, movementCollisionCheckParams) {
        super(teleportParams, teleportRuntimeParams, locomotionRuntimeParams, movementCollisionCheckParams);

        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "Locomotion Teleport Teleport");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");

        this._myBlinkState = new PlayerLocomotionTeleportTeleportBlinkState(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);
        this._myShiftState = new PlayerLocomotionTeleportTeleportShiftState(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);

        this._myFSM.addState("instant_teleport", this._instantUpdate.bind(this));
        this._myFSM.addState("blink_teleport", this._myBlinkState);
        this._myFSM.addState("shift_teleport", this._myShiftState);

        this._myFSM.addTransition("init", "idle", "start");

        this._myFSM.addTransition("idle", "instant_teleport", "start_instant", this._startInstantTeleport.bind(this));
        this._myFSM.addTransition("idle", "blink_teleport", "start_blink");
        this._myFSM.addTransition("idle", "shift_teleport", "start_shift");

        this._myFSM.addTransition("instant_teleport", "idle", "done", this._teleportDone.bind(this));
        this._myFSM.addTransition("blink_teleport", "idle", "done", this._teleportDone.bind(this));
        this._myFSM.addTransition("shift_teleport", "idle", "done", this._teleportDone.bind(this));

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("instant_teleport", "idle", "stop", this._instantStop.bind(this));
        this._myFSM.addTransition("blink_teleport", "idle", "stop");
        this._myFSM.addTransition("shift_teleport", "idle", "stop");

        this._myFSM.addTransition("idle", "idle", "cancel");
        this._myFSM.addTransition("instant_teleport", "idle", "cancel", this._cancelInstant.bind(this));
        this._myFSM.addTransition("blink_teleport", "idle", "cancel", this._cancelBlink.bind(this), SkipStateFunction.END);
        this._myFSM.addTransition("shift_teleport", "idle", "cancel", this._cancelShift.bind(this), SkipStateFunction.END);

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }

    start(fsm) {
        this._myParentFSM = fsm;

        switch (this._myTeleportParams.myTeleportParams.myTeleportType) {
            case PlayerLocomotionTeleportTeleportType.INSTANT:
                this._myFSM.perform("start_instant");
                break;
            case PlayerLocomotionTeleportTeleportType.BLINK:
                this._myFSM.perform("start_blink");
                break;
            case PlayerLocomotionTeleportTeleportType.SHIFT:
                this._myFSM.perform("start_shift");
                break;
            default:
                this._myFSM.perform("start_instant");
        }
    }

    end() {

    }

    cancelTeleport() {
        this._myFSM.perform("cancel");
    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    completeTeleport() {
        this._myFSM.perform("stop");
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp);
    }

    _startInstantTeleport() {
        this._myLocomotionRuntimeParams.myIsTeleporting = true;
    }

    _instantUpdate(dt, fsm) {
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp);
        this._myLocomotionRuntimeParams.myIsTeleporting = false;
        this._myLocomotionRuntimeParams.myTeleportJustPerformed = true;
        fsm.perform("done");
    }

    _instantStop(fsm) {
        this._instantUpdate(0, fsm);
    }

    _teleportDone() {
        this._myTeleportParams.myPlayerTransformManager.resetReal();

        this._myParentFSM.performDelayed("done");
    }

    _cancelInstant() {
        this._myLocomotionRuntimeParams.myIsTeleporting = false;
    }

    _cancelBlink() {
        this._myBlinkState.cancelTeleport();
    }

    _cancelShift() {
        this._myShiftState.cancelTeleport();
    }
}