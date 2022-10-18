PlayerLocomotionTeleportTeleportType = {
    INSTANT: 0,
    BLINK: 1,
    SHIFT: 2,
};

PlayerLocomotionTeleportTeleportParams = class PlayerLocomotionTeleportTeleportParams {
    constructor() {
        this.myTeleportType = PlayerLocomotionTeleportTeleportType.INSTANT;


    }
};

PlayerLocomotionTeleportTeleportState = class PlayerLocomotionTeleportTeleportState extends PlayerLocomotionTeleportState {
    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams) {
        super(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);

        this._myFSM = new PP.FSM();
        //this._myFSM.setDebugLogActive(true, "Locomotion Teleport Teleport");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");

        this._myFSM.addState("instant_teleport", this._updateInstant.bind(this));
        this._myFSM.addState("blink_teleport", this._updateInstant.bind(this));
        this._myFSM.addState("shift_teleport", this._updateInstant.bind(this));

        this._myFSM.addTransition("init", "idle", "start");

        this._myFSM.addTransition("idle", "instant_teleport", "start_instant");
        this._myFSM.addTransition("idle", "blink_teleport", "start_blink");
        this._myFSM.addTransition("idle", "shift_teleport", "start_shift");

        this._myFSM.addTransition("instant_teleport", "idle", "done", this._teleportDone.bind(this));
        this._myFSM.addTransition("blink_teleport", "idle", "done", this._teleportDone.bind(this));
        this._myFSM.addTransition("shift_teleport", "idle", "done", this._teleportDone.bind(this));

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("instant_teleport", "idle", "stop");
        this._myFSM.addTransition("blink_teleport", "idle", "stop");
        this._myFSM.addTransition("shift_teleport", "idle", "stop");

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
                this._myFSM.perform("start_blink");
        }
    }

    end() {
    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    completeTeleport() {
        this._myFSM.perform("stop");
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
    }

    _updateInstant(dt, fsm) {
        fsm.perform("done");
    }

    _completeTeleport() {
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
    }

    _teleportDone() {
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myTeleportRuntimeParams.myTeleportRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
        this._myParentFSM.perform("done");
    }
};

PlayerLocomotionTeleportTeleportState.prototype._teleportToPosition = function () {
    let playerUp = PP.vec3_create();
    let feetPosition = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let teleportRotation = PP.quat_create();
    let teleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _teleportToPosition(teleportPosition, rotationOnUp, collisionRuntimeParams) {
        this._myTeleportAsMovementFailed = false;

        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        feetTransformQuat = this._myTeleportParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.quat2_setPositionRotationQuat(feetPosition, feetRotationQuat);
        }

        teleportCollisionRuntimeParams.copy(collisionRuntimeParams);
        if (!this._myTeleportParams.myPerformTeleportAsMovement) {
            this._checkTeleport(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        } else {
            this._checkTeleportAsMovement(teleportPosition, feetTransformQuat, teleportCollisionRuntimeParams);
        }

        if (!teleportCollisionRuntimeParams.myTeleportCanceled) {
            collisionRuntimeParams.copy(teleportCollisionRuntimeParams);
            this._myTeleportParams.myPlayerHeadManager.teleportFeetPosition(collisionRuntimeParams.myNewPosition);
            if (rotationOnUp != 0) {
                teleportRotation.quat_fromAxis(rotationOnUp, playerUp);
                this._myTeleportParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(teleportRotation);
            }
        }
    };
}();