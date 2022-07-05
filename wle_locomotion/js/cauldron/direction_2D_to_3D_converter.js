Direction2DTo3DConverter = class Direction2DTo3DConverter {

    constructor(isFlyEnabled = false, minAngleToFly = 0) {
        this._myIsFlyEnabled = isFlyEnabled;
        this._myMinAngleToFly = minAngleToFly;

        this._myIsFlyingForward = false;
        this._myIsFlyingRight = false;

        this._myLastValidFlatForward = PP.vec3_create();
        this._myLastValidFlatRight = PP.vec3_create();

        //Setup
        this._myMinAngleToBeValid = 5;
    }

    startFlying() {
        this._myIsFlyingForward = true;
        this._myIsFlyingRight = true;
    }

    stopFlying() {
        this._myIsFlyingForward = false;
        this._myIsFlyingRight = false;
    }

    reset() {
        this.stopFlying();
        this._myLastValidFlatForward = null;
        this._myLastValidFlatForward = null;
    }

    convert(direction2D, convertTransform, directionUp) {
        let forward = convertTransform.mat4_getForward();
        let right = convertTransform.mat4_getRight();

        // check if it is flying based on the convert transform orientation 
        let angleForwardWithDirectionUp = forward.vec3_angle(directionUp);
        let removeForwardUp = !this._myIsFlyEnabled ||
            (!this._myIsFlyingForward && (angleForwardWithDirectionUp > 90 - this._myMinAngleToFly && angleForwardWithDirectionUp < 90 + this._myMinAngleToFly));

        this._myIsFlyingForward = !removeForwardUp;

        let angleRightWithDirectionUp = right.vec3_angle(directionUp);
        let removeRightUp = !this._myIsFlyEnabled ||
            (!this._myIsFlyingRight && (angleRightWithDirectionUp > 90 - this._myMinAngleToFly && angleRightWithDirectionUp < 90 + this._myMinAngleToFly));

        this._myIsFlyingRight = !removeRightUp;

        // remove the component to prevent flying, if needed
        if (removeForwardUp || removeRightUp) {
            if (removeForwardUp) {
                //if the forward is too similar to the up (or down) take the last valid forward
                if (this._myLastValidFlatForward && (forward.vec3_angle(directionUp) < this._myMinAngleToBeValid || forward.vec3_angle(directionUp.vec3_negate()) < this._myMinAngleToBeValid)) {
                    if (forward.vec3_isConcordant(this._myLastValidFlatForward)) {
                        forward.pp_copy(this._myLastValidFlatForward);
                    } else {
                        this._myLastValidFlatForward.vec3_negate(forward);
                    }
                }
            }

            if (removeRightUp) {
                //if the right is too similar to the up (or down) take the last valid right
                if (this._myLastValidFlatRight && (right.vec3_angle(directionUp) < this._myMinAngleToBeValid || right.vec3_angle(directionUp.vec3_negate()) < this._myMinAngleToBeValid)) {
                    if (right.vec3_isConcordant(this._myLastValidFlatRight)) {
                        right.pp_copy(this._myLastValidFlatRight);
                    } else {
                        this._myLastValidFlatRight.vec3_negate(right);
                    }
                }
            }

            if (removeForwardUp) {
                forward.vec3_removeComponentAlongAxis(directionUp, forward);
            }

            if (removeRightUp) {
                right.vec3_removeComponentAlongAxis(directionUp, right);
            }
        }

        forward.vec3_normalize(forward);
        right.vec3_normalize(right);

        // update last valid
        if (forward.vec3_angle(directionUp) > this._myMinAngleToBeValid && forward.vec3_angle(directionUp.vec3_negate()) > this._myMinAngleToBeValid) {
            this._myLastValidFlatForward = forward.vec3_removeComponentAlongAxis(directionUp);
        }

        if (right.vec3_angle(directionUp) > this._myMinAngleToBeValid && right.vec3_angle(directionUp.vec3_negate()) > this._myMinAngleToBeValid) {
            this._myLastValidFlatRight = right.vec3_removeComponentAlongAxis(directionUp);
        }

        // compute direction 3D
        let direction3D = right.vec3_scale(direction2D[0]).vec3_add(forward.vec3_scale(direction2D[1]));

        if (removeForwardUp && removeRightUp) {
            direction3D.vec3_removeComponentAlongAxis(directionUp, direction3D);
        }

        return direction3D;
    }

};