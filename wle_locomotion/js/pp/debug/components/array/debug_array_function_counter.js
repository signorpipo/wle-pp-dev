
WL.registerComponent('pp-debug-array-function-counter', {
    _myIncludeOnlyPPExtensionFunctions: { type: WL.Type.Bool, default: false },
    _myLogTimer: { type: WL.Type.Float, default: 1.0 },
    _myDisplayCollapsed: { type: WL.Type.Bool, default: false },
    _myDisplayOnlyFirstFunctions: { type: WL.Type.Int, default: -1 },
    _myDisplayOnlyFunctionWithAmountAbove: { type: WL.Type.Int, default: -1 },
    _myDisplayOnlyFunctionThatContains: { type: WL.Type.String, default: "" }
}, {
    init: function () {
        let classes = [Array, Uint8ClampedArray, Uint8Array, Uint16Array, Uint32Array, Int8Array,
            Int16Array, Int32Array, Float32Array, Float64Array];
        let prefixes = ["pp_", "vec_", "vec2_", "vec3_", "vec4_", "quat_", "quat2_", "mat3_", "mat4_", "_pp_", "_vec_", "_quat_",];

        this._myFunctionsCounters = [];
        this._myBackupFunctions = [];

        for (let classItem of classes) {
            let prototype = classItem.prototype;
            let properties = Object.getOwnPropertyNames(prototype);

            for (let property of properties) {
                if (this._myDisplayOnlyFunctionThatContains.length == 0 || property.includes(this._myDisplayOnlyFunctionThatContains)) {
                    if (typeof prototype[property] == "function") {

                        let isExtensionFunction = false;
                        if (this._myIncludeOnlyPPExtensionFunctions) {
                            for (let prefix of prefixes) {
                                if (property.startsWith(prefix)) {
                                    isExtensionFunction = true;
                                    break;
                                }
                            }
                        }

                        if (!this._myIncludeOnlyPPExtensionFunctions || isExtensionFunction) {
                            if (property != "constructor") {
                                this._myBackupFunctions[property] = prototype[property];

                                let functionCounterPair = [property, 0];
                                this._myFunctionsCounters.push(functionCounterPair);

                                let backupFunction = this._myBackupFunctions[property];

                                prototype[property] = function () {
                                    functionCounterPair[1]++;
                                    return backupFunction.bind(this)(...arguments);
                                };

                                Object.defineProperty(prototype, property, { enumerable: false });
                            }
                        }
                    }
                }
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

                if (this._myDisplayOnlyFunctionWithAmountAbove >= 0) {
                    let keepRemoving = false;
                    do {
                        let index = functionsCountersClone.findIndex((element) => element[1] <= this._myDisplayOnlyFunctionWithAmountAbove);
                        if (index >= 0) {
                            functionsCountersClone.splice(index, 1);
                            keepRemoving = true;
                        } else {
                            keepRemoving = false;
                        }
                    } while (keepRemoving);
                }

                if (this._myDisplayOnlyFirstFunctions >= 0) {
                    functionsCountersClone.length = this._myDisplayOnlyFirstFunctions;
                }

                console.log("Array Function Counter", functionsCountersClone);
            } else {
                let counterString = "";
                let amount = 0;

                if (this._myDisplayOnlyFirstFunctions < 0 || this._myDisplayOnlyFirstFunctions > amount) {
                    for (let functionCounterPair of this._myFunctionsCounters) {
                        if (functionCounterPair[1] > this._myDisplayOnlyFunctionWithAmountAbove) {
                            counterString += "\n" + functionCounterPair[0] + ": " + functionCounterPair[1];
                        }

                        amount++;
                        if (this._myDisplayOnlyFirstFunctions >= 0 && this._myDisplayOnlyFirstFunctions <= amount) {
                            break;
                        }
                    }
                }

                console.log("Array Function Counter", counterString);
            }
        }

        for (let functionCounterPair of this._myFunctionsCounters) {
            functionCounterPair[1] = 0;
        }
    },
});
