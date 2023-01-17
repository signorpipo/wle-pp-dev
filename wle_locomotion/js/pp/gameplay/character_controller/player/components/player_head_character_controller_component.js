WL.registerComponent("pp-player-head-character-controller", {
}, {
    init() {
    },
    start() {
        this._myPlayerHeadCharacterController = new PP.PlayerHeadCharacterController();
    },
    update(dt) {
        this._myPlayerHeadCharacterController.update(dt);
    },
    getPlayerHeadCharacterController() {
        return this._myPlayerHeadCharacterController;
    }
});