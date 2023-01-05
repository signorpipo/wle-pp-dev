WL.registerComponent('pulse-on-button', {
}, {
    init: function () {

    },
    start: function () {
    },
    update: function (dt) {
        if (PP.myLeftGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            PP.myLeftGamepad.pulse(0.5, 0.01);
        }

        if (PP.myRightGamepad.getButtonInfo(PP.GamepadButtonID.SQUEEZE).isPressEnd()) {
            PP.myRightGamepad.pulse(0.5, 0.1);
        }
    },
});