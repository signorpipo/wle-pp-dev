PlayerLocomotionTeleportParablePointInfo = class PlayerLocomotionTeleportParable {
    constructor() {
        this.myIndex = 0;

        this.myPosition = PP.vec3_create();

        this.myPrevPosition = PP.vec3_create();
        this.myNextPosition = PP.vec3_create();

        this.myDistance = 0;
    }
};

PlayerLocomotionTeleportParable = class PlayerLocomotionTeleportParable {
    constructor() {
        this._myStartPosition = PP.vec3_create();

        this._myForward = PP.vec3_create();
        this._myUp = PP.vec3_create();

        this._mySpeed = 0;
        this._myGravity = 0;
        this._myStepLength = 0;
    }

    setStartPosition(startPosition) {
        this._myStartPosition.vec3_copy(startPosition);
    }

    setForward(forward) {
        this._myForward.vec3_copy(forward);
    }

    setUp(up) {
        this._myUp.vec3_copy(up);
    }

    setSpeed(speed) {
        this._mySpeed = speed;
    }

    setGravity(gravity) {
        this._myGravity = gravity;
    }

    setStepLength(stepLength) {
        this._myStepLength = stepLength;
    }

    getPosition(positionIndex, outPosition = PP.vec3_create()) {
        // implemented outside class definition
    }

    getDistance(positionIndex) {
        // implemented outside class definition
    }

    getPositionByDistance(distance, outPosition = PP.vec3_create()) {
        // implemented outside class definition
    }
};

PlayerLocomotionTeleportParable.prototype.getPosition = function () {
    let forwardPosition = PP.vec3_create();
    let upPosition = PP.vec3_create();
    return function getPosition(positionIndex, outPosition = PP.vec3_create()) {
        let deltaTimePerStep = this._myStepLength / this._mySpeed;

        let elapsedTime = deltaTimePerStep * positionIndex;

        forwardPosition = this._myForward.vec3_scale(this._mySpeed * elapsedTime, forwardPosition);
        forwardPosition = forwardPosition.vec3_add(this._myStartPosition, forwardPosition);

        upPosition = this._myUp.vec3_scale(this._myGravity * elapsedTime * elapsedTime / 2);

        outPosition = forwardPosition.vec3_add(upPosition, outPosition);

        return outPosition;
    };
}();

PlayerLocomotionTeleportParable.prototype.getDistance = function () {
    let forwardPosition = PP.vec3_create();
    let upPosition = PP.vec3_create();
    let currentPosition = PP.vec3_create();
    let prevPosition = PP.vec3_create();
    return function getDistance(positionIndex) {
        let deltaTimePerStep = this._myStepLength / this._mySpeed;

        let distance = 0;
        prevPosition.vec3_copy(this._myStartPosition);

        for (let i = 1; i <= positionIndex; i++) {
            let elapsedTime = deltaTimePerStep * positionIndex;

            forwardPosition = this._myForward.vec3_scale(this._mySpeed * elapsedTime, forwardPosition);
            forwardPosition = forwardPosition.vec3_add(this._myStartPosition, forwardPosition);

            upPosition = this._myUp.vec3_scale(this._myGravity * elapsedTime * elapsedTime / 2);

            currentPosition = forwardPosition.vec3_add(upPosition, currentPosition);

            distance += currentPosition.vec3_distance(prevPosition);

            prevPosition.vec3_copy(currentPosition);
        }

        return distance;
    };
}();