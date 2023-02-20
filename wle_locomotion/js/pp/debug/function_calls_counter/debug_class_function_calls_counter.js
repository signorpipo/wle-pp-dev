PP.DebugClassFunctionCallsCounterParams = class DebugClassFunctionCallsCounterParams {
    constructor() {
        this.myObjectsByReference = [];
        this.myObjectsByPath = [];

        this.myClassesByReference = [];         // By Reference means by using a reference to the class, like doing PP.Timer, but also let ref = PP.Timer and use ref
        this.myClassesByPath = [];              // By Path means by using the full class path, like "PP.Timer", this is requiredneeded if u want to count the constructor

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

        let classesAndParents = this._getReferencesAndParents(this._myParams.myClassesByReference, this._myParams.myClassesByPath);

        for (let referenceAndParent of classesAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];

            this._addCallsCounter(reference, referenceParent, true);
        }

        let objectsAndParents = this._getReferencesAndParents(this._myParams.myObjectsByReference, this._myParams.myObjectsByPath);
        for (let referenceAndParent of objectsAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];

            this._addCallsCounter(reference, referenceParent, false);
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

    _getReferenceFromPath(path) {
        let pathSplit = path.split(".");
        let parent = window;
        for (let i = 0; i < pathSplit.length - 1; i++) {
            parent = parent[pathSplit[i]];
        }

        return parent[pathSplit[pathSplit.length - 1]];
    }

    _getParentReferenceFromPath(path) {
        let pathSplit = path.split(".");
        let parent = window;
        for (let i = 0; i < pathSplit.length - 1; i++) {
            parent = parent[pathSplit[i]];
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

        let propertyNames = Object.getOwnPropertyNames(prototype);

        for (let propertyName of propertyNames) {
            if (typeof prototype[propertyName] == "function" && !this._isClass(prototype[propertyName])) {
                let isValidFunctionName = this._myParams.myFunctionNamesToInclude.length == 0;
                for (let functionName of this._myParams.myFunctionNamesToInclude) {
                    if (propertyName.includes(functionName)) {
                        isValidFunctionName = true;
                        break;
                    }
                }

                if (isValidFunctionName) {
                    for (let functionName of this._myParams.myFunctionNamesToExclude) {
                        if (propertyName.includes(functionName)) {
                            isValidFunctionName = false;
                            break;
                        }
                    }
                }

                if (isValidFunctionName) {
                    if (propertyName != "constructor") {
                        this._myBackupFunctions[propertyName] = prototype[propertyName];

                        this._myFunctionsCallsCounters.set(propertyName, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCounters;

                        let backupFunction = this._myBackupFunctions[propertyName];

                        let backupEnumerable = prototype.propertyIsEnumerable(propertyName);

                        prototype[propertyName] = function () {
                            functionsCallsCounters.set(propertyName, functionsCallsCounters.get(propertyName) + 1);
                            return backupFunction.bind(this)(...arguments);
                        };

                        Object.defineProperty(prototype, propertyName, { enumerable: backupEnumerable });
                    } else if (!this._myParams.myExcludeConstructor && isClass && referenceParent != null) {
                        this._myBackupFunctions[propertyName] = reference;

                        this._myFunctionsCallsCounters.set(propertyName, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCounters;

                        this._setClassConstructor(reference, referenceParent, function () {
                            functionsCallsCounters.set(propertyName, functionsCallsCounters.get(propertyName) + 1);
                            return new reference(...arguments);
                        });
                    }
                }
            }
        }
    }

    _getClassesAndParents() {
        let equalCallback = (first, second) => first[0] == second[0];
        let referenceAndParents = [];

        for (let path of this._myParams.myClassesByPath) {
            let reference = this._getReferenceFromPath(path);
            let referenceParent = this._getParentReferenceFromPath(path);

            referenceAndParents.pp_pushUnique([reference, referenceParent], equalCallback);
        }

        for (let classReference of this._myParams.myClassesByReference) {
            referenceAndParents.pp_pushUnique([classReference, null], equalCallback);
        }

        return referenceAndParents;
    }

    _getReferencesAndParents(byReferenceList, byPathList) {
        let equalCallback = (first, second) => first[0] == second[0];
        let referenceAndParents = [];

        for (let path of byPathList) {
            let reference = this._getReferenceFromPath(path);
            let referenceParent = this._getParentReferenceFromPath(path);

            referenceAndParents.pp_pushUnique([reference, referenceParent], equalCallback);
        }

        for (let reference of byReferenceList) {
            referenceAndParents.pp_pushUnique([reference, null], equalCallback);
        }

        return referenceAndParents;
    }

    _isClass(property) {
        return typeof property == "function" && property.prototype != null && typeof property.prototype.constructor == "function" &&
            (/^class\s/).test(property.toString());
    }
};