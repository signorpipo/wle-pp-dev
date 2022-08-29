WL.registerComponent('show-line-test', {
}, {
    init: function () {
    },
    start() {
    },
    update(dt) {
        let debugParams = new PP.DebugLineParams();
        debugParams.myStart = this.object.pp_getPosition();
        debugParams.myDirection = this.object.pp_getForward();
        debugParams.myLength = 0.4;
        debugParams.myColor = [0, 0, 1, 1];
        PP.myDebugManager.draw(debugParams);
    }
});