
WL.registerComponent('pp-debug-array-creation-calls-counter', {
    _myLogDelay: { type: WL.Type.Float, default: 1.0 },
    _myLogCollapsed: { type: WL.Type.Bool, default: false },
}, {
    init: function () {
        let arrayCreateFunctions = ["vec2_create", "vec3_create", "vec4_create", "quat_create", "quat2_create", "mat3_create", "mat4_create"];

        let functionCallsCounterParams = new PP.DebugFunctionCallsCounterParams();
        functionCallsCounterParams.myClassesByPath = ["PP"];
        functionCallsCounterParams.myExcludeConstructor = true;

        functionCallsCounterParams.myFunctionNamesToInclude.push(...arrayCreateFunctions);

        this._myFunctionCallsCounter = new PP.DebugFunctionCallsCounter(functionCallsCounterParams);

        let functionCallsCountLoggerParams = new PP.DebugFunctionCallsCountLoggerParams();
        functionCallsCountLoggerParams.myCallsCounter = this._myFunctionCallsCounter;
        functionCallsCountLoggerParams.myLogTitle = "Array Creation Calls Count";

        functionCallsCountLoggerParams.myLogDelay = this._myLogDelay;
        functionCallsCountLoggerParams.myLogCollapsed = this._myLogCollapsed;

        this._myFunctionCallsCountLogger = new PP.DebugFunctionCallsCountLogger(functionCallsCountLoggerParams);
    },
    start: function () {
    },
    update: function (dt) {
        this._myFunctionCallsCountLogger.update(dt);
        this._myFunctionCallsCounter.resetCallsCount();
    },
});
