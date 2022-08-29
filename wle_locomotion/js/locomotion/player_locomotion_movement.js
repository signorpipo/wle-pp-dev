PlayerLocomotionMovementRuntimeParams = class PlayerLocomotionMovementRuntimeParams {
    constructor() {
        this.myIsFlying = false;
        this.myCollisionRuntimeParams = null;
    }
};

PlayerLocomotionMovement = class PlayerLocomotionMovement {
    constructor(runtimeParams) {
        this._myRuntimeParams = runtimeParams;
    }

    start() {

    }

    stop() {

    }

    canStop() {
        return true;
    }
};