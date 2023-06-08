export class PlayerLocomotionMovementRuntimeParams {

    constructor() {
        this.myIsFlying = false;
        this.myGravitySpeed = 0;
        this.myCollisionRuntimeParams = null;

        this.myIsTeleportDetecting = false;
        this.myIsTeleporting = false;
        this.myTeleportJustPerformed = false;
    }
}

export class PlayerLocomotionMovement {

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
}