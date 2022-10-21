PlayerLocomotionTeleportTeleportShiftState = class PlayerLocomotionTeleportTeleportShiftState extends PlayerLocomotionTeleportState {
    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams) {
        super(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);

        this._myFSM = new PP.FSM();
        //this._myFSM.setDebugLogActive(true, "Locomotion Teleport Teleport Shift");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");

        this._myFSM.addState("shifting", this._shiftingUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");

        this._myFSM.addTransition("idle", "shifting", "teleport", this._startShifting.bind(this));
        this._myFSM.addTransition("shifting", "idle", "done", this._teleportDone.bind(this));

        this._myFSM.addTransition("idle", "idle", "stop");
        this._myFSM.addTransition("shifting", "idle", "stop", this._stop.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._myShiftTimer = new PP.Timer(this._myTeleportParams.myTeleportParams.myShiftSeconds);
        this._myFeetStartPosition = new PP.vec3_create();
        this._myLeftRotationOnUp = 0;
        this._myCurrentRotationOnUp = 0;
        this._myStartRotationOnUp = 0;
    }

    start(fsm) {
        this._myParentFSM = fsm;

        this._myFSM.perform("teleport");
    }

    end() {
        this._myFSM.perform("stop");
    }

    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    _startShifting() {
        this._myLocomotionRuntimeParams.myIsTeleporting = true;
        this._myFeetStartPosition = this._myTeleportParams.myPlayerHeadManager.getFeetPosition(this._myFeetStartPosition);

        this._myShiftTimer.start();

        if (this._myTeleportParams.myTeleportParams.myShiftSecondsMultiplierOverDistanceFunction) {
            let distance = this._myTeleportRuntimeParams.myTeleportPosition.vec3_distance(this._myFeetStartPosition);
            let multiplier = this._myTeleportParams.myTeleportParams.myShiftSecondsMultiplierOverDistanceFunction(distance);
            this._myShiftTimer.start(this._myTeleportParams.myTeleportParams.myShiftSeconds * multiplier);
        }

        this._myStartRotationOnUp = this._myTeleportRuntimeParams.myTeleportRotationOnUp;
        this._myCurrentRotationOnUp = 0;
    }

    _stop() {
        this._teleport();
    }

    _teleportDone() {
        this._teleport();
        this._myParentFSM.performDelayed("done");
    }

    _teleport() {
        //this._myLocomotionRuntimeParams.myIsTeleporting = false;
        this._myLocomotionRuntimeParams.myTeleportJustPerformed = true;
        this._teleportToPosition(this._myTeleportRuntimeParams.myTeleportPosition, this._myStartRotationOnUp - this._myCurrentRotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
    }
};

PlayerLocomotionTeleportTeleportShiftState.prototype._shiftingUpdate = function () {
    let movementToTeleportFeet = PP.vec3_create();
    let newFeetPosition = PP.vec3_create();
    return function _shiftingUpdate(dt, fsm) {
        let rotationOnUp = 0;

        if (this._myShiftTimer.getPercentage() == 2) {
            rotationOnUp = this._myStartRotationOnUp;

            this._myCurrentRotationOnUp = rotationOnUp;
        }

        this._myShiftTimer.update(dt);

        if (this._myShiftTimer.isDone()) {
            fsm.perform("done");
        } else {
            let interpolationValue = this._myTeleportParams.myTeleportParams.myShiftEasingFunction(this._myShiftTimer.getPercentage());

            movementToTeleportFeet = this._myTeleportRuntimeParams.myTeleportPosition.vec3_sub(this._myFeetStartPosition, movementToTeleportFeet);
            movementToTeleportFeet.vec3_scale(interpolationValue, movementToTeleportFeet);
            newFeetPosition = this._myFeetStartPosition.vec3_add(movementToTeleportFeet, newFeetPosition);

            if (this._myTeleportParams.myTeleportParams.myShiftSmoothRotation) {

                let newCurrentRotationOnUp = this._myStartRotationOnUp * interpolationValue;
                rotationOnUp = newCurrentRotationOnUp - this._myCurrentRotationOnUp;

                this._myCurrentRotationOnUp = newCurrentRotationOnUp;
            }

            this._teleportToPosition(newFeetPosition, rotationOnUp, this._myLocomotionRuntimeParams.myCollisionRuntimeParams);
        }
    };
}();



Object.defineProperty(PlayerLocomotionTeleportTeleportShiftState.prototype, "_shiftingUpdate", { enumerable: false });