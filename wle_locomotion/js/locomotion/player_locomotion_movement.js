PlayerLocomotionMovementRuntimeParams = class PlayerLocomotionMovementRuntimeParams {
    constructor() {
        this.myIsFlying = false;
        this.myCollisionRuntimeParams = null;
    }
};

PlayerLocomotionMovement = class PlayerLocomotionMovement {
    constructor(locomotionRuntimeParams) {
        this._myLocomotionRuntimeParams = locomotionRuntimeParams;
    }

    start() {

    }

    stop() {

    }

    canStop() {
        return true;
    }
};