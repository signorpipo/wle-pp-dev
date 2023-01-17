WL.registerComponent("pp-player-character-controller", {
}, {
    init() {
    },
    start() {
        this._myPlayerCharacterController = new PP.PlayerCharacterController();
    },
    update(dt) {
        this._myPlayerCharacterController.update(dt);
    },
    getPlayerCharacterController() {
        return this._myPlayerCharacterController;
    }
});