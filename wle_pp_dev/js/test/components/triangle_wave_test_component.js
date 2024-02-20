import { Component, Property } from "@wonderlandengine/api";
import { EasingFunction, vec3_create } from "../../pp/index.js";

export class TriangleWaveTestComponent extends Component {
    static TypeName = "triangle-wave-test";
    static Properties = {
        _myUseNormalLerp: Property.bool(false)
    };

    start() {
        this._myTimeElapsed = 0;
        this._mySign = 1;
    }

    update(dt) {
        if (this._myUseNormalLerp) {
            if (this._myTimeElapsed + this._mySign * dt > 1) {
                this._mySign = -1;
                this._myTimeElapsed = 1 - (this._myTimeElapsed + dt) % 1;
            } else if (this._myTimeElapsed + this._mySign * dt < 0) {
                this._mySign = 1;
                this._myTimeElapsed = Math.abs((this._myTimeElapsed - dt) % 1);
            } else {
                this._myTimeElapsed += this._mySign * dt;
            }

            let verticalOffset = Math.pp_interpolate(-3, 1, this._myTimeElapsed, EasingFunction.linear);
            this.object.pp_resetTransformLocal();
            this.object.pp_translateLocal(vec3_create(0, verticalOffset, 0));
        } else {
            this._myTimeElapsed += dt;
            let verticalOffset = Math.pp_interpolatePeriodic(-3, 1, this._myTimeElapsed, EasingFunction.linear);
            this.object.pp_resetTransformLocal();
            this.object.pp_translateLocal(vec3_create(0, verticalOffset, 0));
        }
    }
}