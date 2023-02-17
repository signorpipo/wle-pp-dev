
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

        this._myFunctionCallsCounterParams = new PP.DebugClassFunctionCallsCounterParams();
        this._myFunctionCallsCounterParams.myClasses = [
            Array, Uint8ClampedArray, Uint8Array, Uint16Array, Uint32Array, Int8Array,
            Int16Array, Int32Array, Float32Array, Float64Array];

        if (this._myDisplayOnlyFunctionThatContains.length > 0) {
            let toIncludeList = [...this._myDisplayOnlyFunctionThatContains.split(",")];
            for (let i = 0; i < toIncludeList.length; i++) {
                toIncludeList[i] = toIncludeList[i].trim();
            }
            this._myFunctionCallsCounterParams.myFunctionNamesToInclude.push(...toIncludeList);
        } else if (this._myIncludeOnlyPPExtensionFunctions) {
            this._myFunctionCallsCounterParams.myFunctionNamesToInclude.push(...prefixes);
        }

        this._myFunctionCallsCounter = new PP.DebugClassFunctionCallsCounter(this._myFunctionCallsCounterParams);

        this._myTimer = new PP.Timer(this._myLogTimer);
    },
    start: function () {
    },
    update: function (dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            let callsCounters = this._myFunctionCallsCounter.getCallsCounters(true);

            if (this._myDisplayOnlyFunctionWithAmountAbove >= 0) {
                let callsCountersClone = new Map(callsCounters);
                callsCounters = new Map();
                let keys = [...callsCountersClone.keys()];
                for (let i = 0; i < keys.length; i++) {
                    let counter = callsCountersClone.get(keys[i]);
                    if (counter > this._myDisplayOnlyFunctionWithAmountAbove) {
                        callsCounters.set(keys[i], counter);
                    }
                }
            }

            if (this._myDisplayOnlyFirstFunctions >= 0) {
                let callsCountersClone = new Map(callsCounters);
                callsCounters = new Map();
                let keys = [...callsCountersClone.keys()];
                for (let i = 0; i < this._myDisplayOnlyFirstFunctions && i < keys.length; i++) {
                    let counter = callsCountersClone.get(keys[i]);
                    callsCounters.set(keys[i], counter);
                }
            }

            if (this._myDisplayCollapsed) {
                console.log("Array Functions Counter", callsCounters);
            } else {
                let counterString = "";

                for (let entry of callsCounters.entries()) {
                    counterString += "\n" + entry[0] + ": " + entry[1];
                }

                console.log("Array Functions Counter", counterString);
            }
        }

        this._myFunctionCallsCounter.resetCallsCounters();
    },
});
