
WL.registerComponent('pp-debug-pp-array-creation-calls-counter', {
    _myDelayStart: { type: WL.Type.Float, default: 0.0 },
    _myLogDelay: { type: WL.Type.Float, default: 1.0 },
    _myLogCollapsed: { type: WL.Type.Bool, default: false },
    _myLogMaxFunctionCalls: { type: WL.Type.Bool, default: false }
}, {
    init: function () {
        this._mySkipFirstUpdate = true;
        this._myStartTimer = new PP.Timer(this._myDelayStart);
        if (this._myDelayStart == 0) {
            this._myStartTimer.end();
            this._mySkipFirstUpdate = false;
            this._start();
        }
    },
    start: function () {
    },
    update: function (dt) {
        if (this._mySkipFirstUpdate) {
            this._mySkipFirstUpdate = false;
            return;
        }

        if (this._myStartTimer.isRunning()) {
            this._myStartTimer.update(dt);
            if (this._myStartTimer.isDone()) {
                this._start();
            }
        } else {
            this._myFunctionCallsCountLogger.update(dt);
            this._myFunctionCallsCounter.resetCallsCount();
        }
    },
    _start: function () {
        let arrayCreateFunctions = ["vec2_create", "vec3_create", "vec4_create", "quat_create", "quat2_create", "mat3_create", "mat4_create"];

        let functionCallsCounterParams = new PP.DebugFunctionCallsCounterParams();
        functionCallsCounterParams.myObjectsByPath = ["PP"];
        functionCallsCounterParams.myExcludeConstructor = true;
        functionCallsCounterParams.myExcludeJavascriptObjectFunctions = true;
        functionCallsCounterParams.myAddPathPrefix = true;

        functionCallsCounterParams.myFunctionNamesToInclude.push(...arrayCreateFunctions);

        this._myFunctionCallsCounter = new PP.DebugFunctionCallsCounter(functionCallsCounterParams);

        let functionCallsCountLoggerParams = new PP.DebugFunctionCallsCountLoggerParams();
        functionCallsCountLoggerParams.myCallsCounter = this._myFunctionCallsCounter;
        functionCallsCountLoggerParams.myLogTitle = "Array Creation Calls Count";

        functionCallsCountLoggerParams.myLogDelay = this._myLogDelay;
        functionCallsCountLoggerParams.myLogCollapsed = this._myLogCollapsed;
        functionCallsCountLoggerParams.myLogMaxFunctionCalls = this._myLogMaxFunctionCalls;

        this._myFunctionCallsCountLogger = new PP.DebugFunctionCallsCountLogger(functionCallsCountLoggerParams);
    },
});
