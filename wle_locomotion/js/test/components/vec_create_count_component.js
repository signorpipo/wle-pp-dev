
import { Component } from "@wonderlandengine/api";
import { mat4_create, quat2_create, quat_create, vec3_create } from "../../pp/plugin/js/extensions/array_extension";
import { Timer } from "../../pp/cauldron/cauldron/timer";

export class VecCreateCountComponent extends Component {
    static TypeName = "vec-create-count";
    static Properties = {};

    init() {
        this._myDebugWithPP = true;

        this._myVec3CreateCall = 0;

        let oldVec3 = vec3_create;
        vec3_create = function vec3_create() {
            this._myVec3CreateCall++;
            return oldVec3(...arguments);
        }.bind(this);

        this._myQuatCreateCall = 0;

        let oldQuat = quat_create;
        quat_create = function quat2_create() {
            this._myQuatCreateCall++;
            return oldQuat(...arguments);
        }.bind(this);

        this._myQuat2CreateCall = 0;

        let oldQuat2 = quat2_create;
        quat2_create = function quat2_create() {
            this._myQuat2CreateCall++;
            return oldQuat2(...arguments);
        }.bind(this);

        this._myMat4CreateCall = 0;

        let oldMat4 = mat4_create;
        mat4_create = function mat4_create() {
            this._myMat4CreateCall++;
            return oldMat4(...arguments);
        }.bind(this);

        this._myTimer = new Timer(1);
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
