WL.registerComponent("pp-character-controller", {
}, {
    init() {
    },
    start() {
        this._myCharacterController = new PP.CharacterController();
    },
    update(dt) {
        this._myCharacterController.update(dt);
    },
    getCharacterController() {
        return this._myCharacterController;
    }
});