PP.DebugClassFunctionCallsCounterParams = class DebugClassFunctionCallsCounterParams {
    constructor() {
        this.myClasses = [];
        this.myFunctionNamesToInclude = []; // empty means every function is included
        this.myFunctionNamesToExclude = []; // empty means no function is excluded
    }
};

PP.DebugClassFunctionCallsCounter = class DebugClassFunctionCallsCounter {
    constructor(params = new PP.DebugClassFunctionCallsCounterParams()) {
        this._myFunctionsCallsCounters = new Map();
        this._myBackupFunctions = [];

        for (let classItem of params.myClasses) {
            let prototype = classItem.prototype;
            let properties = Object.getOwnPropertyNames(prototype);

            for (let property of properties) {
                if (typeof prototype[property] == "function" && property != "constructor") {
                    let isValidFunctionName = params.myFunctionNamesToInclude.length == 0;
                    for (let functionName of params.myFunctionNamesToInclude) {
                        if (property.includes(functionName)) {
                            isValidFunctionName = true;
                            break;
                        }
                    }

                    if (isValidFunctionName) {
                        for (let functionName of params.myFunctionNamesToExclude) {
                            if (property.includes(functionName)) {
                                isValidFunctionName = false;
                                break;
                            }
                        }
                    }

                    if (isValidFunctionName) {
                        if (property != "constructor") {
                            this._myBackupFunctions[property] = prototype[property];

                            this._myFunctionsCallsCounters.set(property, 0);
                            let functionsCallsCounters = this._myFunctionsCallsCounters;

                            let backupFunction = this._myBackupFunctions[property];

                            let backupEnumerable = prototype.propertyIsEnumerable(property);

                            prototype[property] = function () {
                                functionsCallsCounters.set(property, functionsCallsCounters.get(property) + 1);
                                return backupFunction.bind(this)(...arguments);
                            };

                            Object.defineProperty(prototype, property, { enumerable: backupEnumerable });
                        }
                    }
                }
            }
        }
    }

    resetCallsCounters() {
        for (let property of this._myFunctionsCallsCounters.keys()) {
            this._myFunctionsCallsCounters.set(property, 0);
        }
    }

    getCallsCounters(sortList = false) {
        let callsCounter = this._myFunctionsCallsCounters;

        if (sortList) {
            callsCounter = new Map([...callsCounter.entries()].sort(function (first, second) {
                return -(first[1] - second[1]);
            }));
        }

        return callsCounter;
    }
};