import { Component, Property } from "@wonderlandengine/api";

export class CharacterSpawnerComponent extends Component {
    static TypeName = "character-spawner";
    static Properties = {
        _myRoomSize: Property.float(1.0),
        _myRoomHeight: Property.float(1.0),
        _myAmount: Property.int(1.0),
        _myTallPrototype: Property.object(),
        _myShortPrototype: Property.object()

    };

    start() {
        this._myRootObject = this.object.pp_addObject();

        for (let i = 0; i < this._myAmount; i++) {
            let spawnTall = Math.pp_randomBool();

            let character = null;

            if (spawnTall) {
                character = this._myTallPrototype.pp_clone();
            } else {
                character = this._myShortPrototype.pp_clone();
            }

            character.pp_setParent(this._myRootObject);
            let randomX = Math.pp_random(-this._myRoomSize, this._myRoomSize);
            let randomZ = Math.pp_random(-this._myRoomSize, this._myRoomSize);
            let y = this._myRoomHeight;

            character.pp_setPositionLocal(PP.vec3_create(randomX, y, randomZ));

            character.pp_setActive(true);
        }
    }
}