WL.registerComponent('toggle-active', {
    _myObject: { type: WL.Type.Object }
}, {
    init: function () {
    },
    start: function () {
        this._myCurrentActive = true;
    },
    update: function (dt) {
        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            this._myCurrentActive = !this._myCurrentActive;
            this._myObject.pp_setActive(this._myCurrentActive);
        }
    },
});