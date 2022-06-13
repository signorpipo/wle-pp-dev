WL.registerComponent('toggle-require-mouse-down', {
}, {
    init: function () {
    },
    start() {
        this._myTimer = new PP.Timer(3);
        this._myMouseLook = this.object.pp_getComponent("mouse-look");
    },
    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            this._myMouseLook.requireMouseDown = !this._myMouseLook.requireMouseDown;
        }
    }
});