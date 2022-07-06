WL.registerComponent('character-spawner', {
    _myRoomSize: { type: WL.Type.Float, default: 1.0 },
    _myRoomHeight: { type: WL.Type.Float, default: 1.0 },
    _myAmount: { type: WL.Type.Int, default: 1.0 },
    _myTallPrototype: { type: WL.Type.Object },
    _myShortPrototype: { type: WL.Type.Object }

}, {
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

            character.pp_setPositionLocal([randomX, y, randomZ]);

            character.pp_setActive(true);
        }
    }
});