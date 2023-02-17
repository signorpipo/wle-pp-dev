
WL.registerComponent('pp-debug-array-creation-counter', {
    _myLogTimer: { type: WL.Type.Float, default: 1.0 },
    _myDisplayCollapsed: { type: WL.Type.Bool, default: false }
}, {
    init: function () {
        this._myArrayTypes = ["vec2", "vec3", "vec4", "quat", "quat2", "mat3", "mat4"];

        this._myFunctionsCounters = [];

        this._myBackupFunctions = [];
        for (let arrayType of this._myArrayTypes) {
            if (PP[arrayType + "_create"] != null) {
                this._myBackupFunctions[arrayType] = PP[arrayType + "_create"];

                let functionCounterPair = [arrayType, 0];
                this._myFunctionsCounters.push(functionCounterPair);

                let backupFunction = this._myBackupFunctions[arrayType];

                PP[arrayType + "_create"] = function () {
                    functionCounterPair[1]++;
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

            this._myFunctionsCounters.sort(function (first, second) {
                return -(first[1] - second[1]);
            });

            if (this._myDisplayCollapsed) {
                let functionsCountersClone = this._myFunctionsCounters.slice(0);
                for (let i = 0; i < functionsCountersClone.length; i++) {
                    functionsCountersClone[i] = functionsCountersClone[i].slice(0);
                }

                console.log("Array Creation Counter", functionsCountersClone);
            } else {
                let counterString = "";
                for (let functionCounterPair of this._myFunctionsCounters) {
                    counterString += "\n" + functionCounterPair[0] + ": " + functionCounterPair[1];
                }
                console.log("Array Creation Counter", counterString);
            }
        }

        for (let functionCounterPair of this._myFunctionsCounters) {
            functionCounterPair[1] = 0;
        }
    },
});
