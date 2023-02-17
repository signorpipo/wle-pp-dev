
WL.registerComponent('pp-debug-array-creation-counter', {
    _myLogTimer: { type: WL.Type.Float, default: 1.0 },
    _myDisplayCollapsed: { type: WL.Type.Bool, default: false }
}, {
    init: function () {
        this._myArrayTypes = ["vec2", "vec3", "vec4", "quat", "quat2", "mat3", "mat4"];

        this._myArrayTypesCounters = [];

        this._myBackupFunctions = [];
        for (let arrayType of this._myArrayTypes) {
            if (PP[arrayType + "_create"] != null) {
                this._myBackupFunctions[arrayType] = PP[arrayType + "_create"];

                let arrayTypePair = [arrayType, 0];
                this._myArrayTypesCounters.push(arrayTypePair);

                let backupFunction = this._myBackupFunctions[arrayType];

                PP[arrayType + "_create"] = function () {
                    arrayTypePair[1]++;
                    return backupFunction(...arguments);
                };
            }
        }

        this._myTimer = new PP.Timer(this._myLogTimer);
    },
    start: function () {
    },
    update: function (dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            this._myArrayTypesCounters.sort(function (first, second) {
                return -(first[1] - second[1]);
            });

            if (this._myDisplayCollapsed) {
                let arrayTypesCountersClone = this._myArrayTypesCounters.slice(0);
                for (let i = 0; i < arrayTypesCountersClone.length; i++) {
                    arrayTypesCountersClone[i] = arrayTypesCountersClone[i].slice(0);
                }

                console.log("Array Creation Counter", arrayTypesCountersClone);
            } else {
                let errorString = "";
                for (let arrayType of this._myArrayTypesCounters) {
                    errorString += "\n" + arrayType[0] + ": " + arrayType[1];
                }
                console.log("Array Creation Counter", errorString);
            }
        }

        for (let arrayType of this._myArrayTypesCounters) {
            arrayType[1] = 0;
        }
    },
});
