WL.registerComponent("pp-player-locomotion-rotate", {
}, {
    init() {
    },
    start() {
        this._myPlayerLocomotionRotate = new PP.PlayerLocomotionRotate();
    },
    update(dt) {
        this._myPlayerLocomotionRotate.update(dt);
    },
    getPlayerLocomotionRotate() {
        return this._myPlayerLocomotionRotate;
    }
});