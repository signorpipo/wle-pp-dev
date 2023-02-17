
WL.registerComponent('vec-create-count', {
}, {
    init: function () {
        this._myDebugWithPP = true;

        this._myVec3CreateCall = 0;

        let oldVec3 = PP.vec3_create;
        PP.vec3_create = function () {
            this._myVec3CreateCall++;
            return oldVec3(...arguments);
        }.bind(this);

        this._myQuatCreateCall = 0;

        let oldQuat = PP.quat_create;
        PP.quat_create = function () {
            this._myQuatCreateCall++;
            return oldQuat(...arguments);
        }.bind(this);

        this._myQuat2CreateCall = 0;

        let oldQuat2 = PP.quat2_create;
        PP.quat2_create = function () {
            this._myQuat2CreateCall++;
            return oldQuat2(...arguments);
        }.bind(this);

        this._myMat4CreateCall = 0;

        let oldMat4 = PP.mat4_create;
        PP.mat4_create = function () {
            this._myMat4CreateCall++;
            return oldMat4(...arguments);
        }.bind(this);

        this._myTimer = new PP.Timer(1);
    },
    start: function () {
    },
    update: function (dt) {
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
    },
});
