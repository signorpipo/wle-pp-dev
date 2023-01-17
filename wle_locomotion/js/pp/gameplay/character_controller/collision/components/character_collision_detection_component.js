WL.registerComponent("pp-character-collision-detection", {
}, {
    init() {
        PP.myCharacterCollisionDetection = new PP.CharacterCollisionDetection();
    },
    start() {
    },
    update(dt) {
        PP.myCharacterCollisionDetection.update(dt);
    }
});

PP.myCharacterCollisionDetection = null;