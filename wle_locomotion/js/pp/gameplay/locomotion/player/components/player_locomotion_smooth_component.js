WL.registerComponent("pp-player-locomotion-smooth", {
}, {
    init() {
    },
    start() {
        this._myPlayerLocomotionSmooth = new PP.PlayerLocomotionSmooth();
    },
    update(dt) {
        this._myPlayerLocomotionSmooth.update(dt);
    },
    getPlayerLocomotionSmooth() {
        return this._myPlayerLocomotionSmooth;
    }
});