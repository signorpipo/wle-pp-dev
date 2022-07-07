Direction2DTo3DConverter = class Direction2DTo3DConverter {

    constructor(isFlyEnabled = false, minAngleToFlyUp = 0, minAngleToFlyDown = null) {
        this._myIsFlyEnabled = isFlyEnabled;
        this._myMinAngleToFlyUp = minAngleToFlyUp;
        this._myMinAngleToFlyDown = minAngleToFlyDown;
        if (this._myMinAngleToFlyDown == null) {
            this._myMinAngleToFlyDown = this._myMinAngleToFlyUp;
        }

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
        this._myLastValidFlatForward.vec3_zero();
        this._myLastValidFlatRight.vec3_zero();
    }

    convert(direction2D, convertTransform, directionUp) {
        let forward = convertTransform.mat4_getForward();
        let right = convertTransform.mat4_getRight();

        // check if it is flying based on the convert transform orientation 
        let angleForwardWithDirectionUp = forward.vec3_angle(directionUp);
        let removeForwardUp = !this._myIsFlyEnabled ||
            (!this._myIsFlyingForward && (angleForwardWithDirectionUp > 90 - this._myMinAngleToFlyUp && angleForwardWithDirectionUp < 90 + this._myMinAngleToFlyDown));

        this._myIsFlyingForward = !removeForwardUp;

        let angleRightWithDirectionUp = right.vec3_angle(directionUp);
        let removeRightUp = !this._myIsFlyEnabled ||
            (!this._myIsFlyingRight && (angleRightWithDirectionUp > 90 - this._myMinAngleToFlyUp && angleRightWithDirectionUp < 90 + this._myMinAngleToFlyDown));

        this._myIsFlyingRight = !removeRightUp;

        // remove the component to prevent flying, if needed
        if (removeForwardUp || removeRightUp) {
            if (removeForwardUp) {
                //if the forward is too similar to the up (or down) take the last valid forward
                if (this._myLastValidFlatForward.vec3_length() > 0 && (forward.vec3_angle(directionUp) < this._myMinAngleToBeValid || forward.vec3_angle(directionUp.vec3_negate()) < this._myMinAngleToBeValid)) {
                    if (forward.vec3_isConcordant(this._myLastValidFlatForward)) {
                        forward.pp_copy(this._myLastValidFlatForward);
                    } else {
                        this._myLastValidFlatForward.vec3_negate(forward);
                    }
                }

                forward.vec3_removeComponentAlongAxis(directionUp, forward);
                forward.vec3_normalize(forward);
            }

            if (removeRightUp) {
                //if the right is too similar to the up (or down) take the last valid right
                if (this._myLastValidFlatRight.vec3_length() > 0 && (right.vec3_angle(directionUp) < this._myMinAngleToBeValid || right.vec3_angle(directionUp.vec3_negate()) < this._myMinAngleToBeValid)) {
                    if (right.vec3_isConcordant(this._myLastValidFlatRight)) {
                        right.pp_copy(this._myLastValidFlatRight);
                    } else {
                        this._myLastValidFlatRight.vec3_negate(right);
                    }
                }

                right.vec3_removeComponentAlongAxis(directionUp, right);
                right.vec3_normalize(right);
            }
        }


        // update last valid
        if (forward.vec3_angle(directionUp) > this._myMinAngleToBeValid && forward.vec3_angle(directionUp.vec3_negate()) > this._myMinAngleToBeValid) {
            forward.vec3_removeComponentAlongAxis(directionUp, this._myLastValidFlatForward);
        }

        if (right.vec3_angle(directionUp) > this._myMinAngleToBeValid && right.vec3_angle(directionUp.vec3_negate()) > this._myMinAngleToBeValid) {
            right.vec3_removeComponentAlongAxis(directionUp, this._myLastValidFlatRight);
        }

        // compute direction 3D
        let direction3D = right.vec3_scale(direction2D[0]).vec3_add(forward.vec3_scale(direction2D[1]));

        if (removeForwardUp && removeRightUp) {
            direction3D.vec3_removeComponentAlongAxis(directionUp, direction3D);
        }

        return direction3D;
    }

};