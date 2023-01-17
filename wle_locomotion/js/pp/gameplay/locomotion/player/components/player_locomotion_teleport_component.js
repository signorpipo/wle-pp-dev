WL.registerComponent("pp-player-locomotion-teleport", {
}, {
    init() {
    },
    start() {
        this._myPlayerLocomotionTeleport = new PP.PlayerLocomotionTeleport();
    },
    update(dt) {
        this._myPlayerLocomotionTeleport.update(dt);
    },
    getPlayerLocomotionTeleport() {
        return this._myPlayerLocomotionTeleport;
    }
});