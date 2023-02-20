PP.DebugClassFunctionCallsCounterParams = class DebugClassFunctionCallsCounterParams {
    constructor() {
        this.myClassesByReference = [];
        this.myClassesByPath = [];

        this.myFunctionNamesToInclude = [];     // empty means every function is included
        this.myFunctionNamesToExclude = [];     // empty means no function is excluded

        this.myExcludeConstructor = false;      // constructor calls count can be a problem for some classes (like Array)
    }
};

PP.DebugClassFunctionCallsCounter = class DebugClassFunctionCallsCounter {
    constructor(params = new PP.DebugClassFunctionCallsCounterParams()) {
        this._myFunctionsCallsCounters = new Map();
        this._myBackupFunctions = [];

        this._myParams = params;

        for (let classPath of this._myParams.myClassesByPath) {
            let classReference = this._getClassReferenceFromClassPath(classPath);
            let classParentReferenceParent = this._getClassParentReferenceFromClassPath(classPath);

            this._addCallsCounter(classReference, classParentReferenceParent, true);
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

    _getClassReferenceFromClassPath(classPath) {
        let classPathSplit = classPath.split(".");
        let parent = window;
        for (let i = 0; i < classPathSplit.length - 1; i++) {
            parent = parent[classPathSplit[i]];
        }

        return parent[classPathSplit[classPathSplit.length - 1]];
    }

    _getClassParentReferenceFromClassPath(classPath) {
        let classPathSplit = classPath.split(".");
        let parent = window;
        for (let i = 0; i < classPathSplit.length - 1; i++) {
            parent = parent[classPathSplit[i]];
        }

        return parent;
    }

    _setClassConstructor(reference, referenceParent, newConstructor) {
        let backupConstructor = referenceParent[reference.name];

        referenceParent[reference.name] = newConstructor;
        referenceParent[reference.name].prototype = backupConstructor.prototype;
    }

    _addCallsCounter(reference, referenceParent, isClass) {
        let prototype = null;

        if (isClass) {
            prototype = reference.prototype;
        } else {
            prototype = reference;
        }

        let properties = Object.getOwnPropertyNames(prototype);

        for (let property of properties) {
            if (typeof prototype[property] == "function") {
                let isValidFunctionName = this._myParams.myFunctionNamesToInclude.length == 0;
                for (let functionName of this._myParams.myFunctionNamesToInclude) {
                    if (property.includes(functionName)) {
                        isValidFunctionName = true;
                        break;
                    }
                }

                if (isValidFunctionName) {
                    for (let functionName of this._myParams.myFunctionNamesToExclude) {
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
                    } else if (!this._myParams.myExcludeConstructor && isClass && referenceParent != null) {
                        this._myBackupFunctions[property] = reference;

                        this._myFunctionsCallsCounters.set(property, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCounters;

                        this._setClassConstructor(reference, referenceParent, function () {
                            functionsCallsCounters.set(property, functionsCallsCounters.get(property) + 1);
                            return new reference(...arguments);
                        });
                    }
                }
            }
        }
    }
};