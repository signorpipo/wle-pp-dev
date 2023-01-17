WL.registerComponent("pp-player-head-controller", {
}, {
    init() {
    },
    start() {
        this._myPlayerHeadController = new PP.PlayerHeadController();
    },
    update(dt) {
        this._myPlayerHeadController.update(dt);
    },
    getPlayerHeadController() {
        return this._myPlayerHeadController;
    }
});