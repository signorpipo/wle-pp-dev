WL.registerComponent("pp-debug-transform", {
}, {
    init: function () {
    },
    start: function () {
        this._myDebugTransform = new PP.DebugTransform();
        this._myDebugTransform.setVisible(true);
    },
    update: function (dt) {
        this._myDebugTransform.setTransform(this.object.pp_getTransform());
    }
});