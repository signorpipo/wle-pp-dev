import { Component, Type } from '@wonderlandengine/api';

PP.CharacterCollisionDetectionComponent = class CharacterCollisionDetectionComponent extends Component {
    static TypeName = 'pp-character-collision-detection';
    static Properties = {};

    init() {
        PP.myCharacterCollisionDetection = new PP.CharacterCollisionDetection();
    }

    start() {
    }

    update(dt) {
        PP.myCharacterCollisionDetection.update(dt);
    }
};

WL.registerComponent(PP.CharacterCollisionDetectionComponent);

PP.myCharacterCollisionDetection = null;