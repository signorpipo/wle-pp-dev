
import { Component, Property } from "@wonderlandengine/api";

export class VecCreateCountComponent extends Component {
    static TypeName = "vec-create-count";
    static Properties = {};

    init() {
        this._myDebugWithPP = true;

        this._myVec3CreateCall = 0;

        let oldVec3 = PP.vec3_create;
        PP.vec3_create = function vec3_create() {
            this._myVec3CreateCall++;
            return oldVec3(...arguments);
        }.bind(this);

        this._myQuatCreateCall = 0;

        let oldQuat = PP.quat_create;
        PP.quat_create = function quat_create() {
            this._myQuatCreateCall++;
            return oldQuat(...arguments);
        }.bind(this);

        this._myQuat2CreateCall = 0;

        let oldQuat2 = PP.quat2_create;
        PP.quat2_create = function quat2_create() {
            this._myQuat2CreateCall++;
            return oldQuat2(...arguments);
        }.bind(this);

        this._myMat4CreateCall = 0;

        let oldMat4 = PP.mat4_create;
        PP.mat4_create = function mat4_create() {
            this._myMat4CreateCall++;
            return oldMat4(...arguments);
        }.bind(this);

        this._myTimer = new PP.Timer(1);
    }

    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            if (this._myDebugWithPP) {
                console.error("vec3 call:", this._myVec3CreateCall);
                console.error("mat4 call:", this._myMat4CreateCall);
                console.error("quat2 call:", this._myQuat2CreateCall);
                console.error("quat call:", this._myQuatCreateCall);
                console.error("");
            }
        }
        this._myVec3CreateCall = 0;
        this._myQuatCreateCall = 0;
        this._myQuat2CreateCall = 0;
        this._myMat4CreateCall = 0;
    }
}
