PP.DebugClassFunctionCallsCounterParams = class DebugClassFunctionCallsCounterParams {
    constructor() {
        this.myClassNames = [];

        this.myFunctionNamesToInclude = [];     // empty means every function is included
        this.myFunctionNamesToExclude = [];     // empty means no function is excluded

        this.myExcludeConstructor = false;      // constructor calls count can be a problem for some classes (like Array)
    }
};

PP.DebugClassFunctionCallsCounter = class DebugClassFunctionCallsCounter {
    constructor(params = new PP.DebugClassFunctionCallsCounterParams()) {
        this._myFunctionsCallsCounters = new Map();
        this._myBackupFunctions = [];

        for (let className of params.myClassNames) {
            let classItem = this._getClassFromName(className);

            // aggiungere che se è un oggetto istanziato allora modifica l'oggetto e non il prototipo
            let prototype = classItem.prototype;
            if (prototype == null) {
                prototype = classItem;
            }
            let properties = Object.getOwnPropertyNames(prototype);

            for (let property of properties) {
                if (typeof prototype[property] == "function") {
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
                        } else if (!params.myExcludeConstructor && classItem.prototype != null) {
                            this._myBackupFunctions[property] = classItem;

                            this._myFunctionsCallsCounters.set(property, 0);
                            let functionsCallsCounters = this._myFunctionsCallsCounters;

                            this._setClassConstructor(className, function () {
                                functionsCallsCounters.set(property, functionsCallsCounters.get(property) + 1);
                                return new classItem(...arguments);
                            });
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

    _getClassFromName(className) {
        let classPath = className.split(".");
        let parent = window;
        for (let i = 0; i < classPath.length - 1; i++) {
            parent = parent[classPath[i]];
        }

        return parent[classPath[classPath.length - 1]];
    }

    _setClassConstructor(className, newConstructor) {
        let classPath = className.split(".");
        let parent = window;
        for (let i = 0; i < classPath.length - 1; i++) {
            parent = parent[classPath[i]];
        }

        let backupConstructor = parent[classPath[classPath.length - 1]];

        parent[classPath[classPath.length - 1]] = newConstructor;
        parent[classPath[classPath.length - 1]].prototype = backupConstructor.prototype;
    }
};