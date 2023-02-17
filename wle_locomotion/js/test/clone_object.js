WL.registerComponent('clone-object', {
    _myToClone: { type: WL.Type.Object }
}, {
    init: function () {

    },
    start: function () {
        this._myStarted = false;
    },
    update: function (dt) {
        if (this.cloned) {
            this.cloned.pp_getComponent("physx").simulate = true;
            this.cloned.pp_translate([-dt * 0.1, 0, 0]);
        }

        if (!this._myStarted) {
            this._myStarted = true;
            this.cloned = this._myToClone.pp_clone();
            this.cloned.pp_setParent(this);
            this.cloned.pp_translate([-2, 0, 0]);
        }
    },
});