WL.registerComponent("pp-player-hand-character-controller", {
}, {
    init() {
    },
    start() {
        this._myPlayerHandCharacterController = new PP.PlayerHandCharacterController();
    },
    update(dt) {
        this._myPlayerHandCharacterController.update(dt);
    },
    getPlayerHandCharacterController() {
        return this._myPlayerHandCharacterController;
    }
});