WL.registerComponent("pp-player-locomotion-gravity", {
}, {
    init() {
    },
    start() {
        this._myPlayerLocomotionGravity = new PP.PlayerLocomotionGravity();
    },
    update(dt) {
        this._myPlayerLocomotionGravity.update(dt);
    },
    getPlayerLocomotionGravity() {
        return this._myPlayerLocomotionGravity;
    }
});