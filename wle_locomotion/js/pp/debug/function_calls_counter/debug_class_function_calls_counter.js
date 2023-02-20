PP.DebugClassFunctionCallsCounterParams = class DebugClassFunctionCallsCounterParams {
    constructor() {
        this.myObjectsByReference = [];         // You can specify to count the call on a specific object instance
        this.myObjectsByPath = [];              // If you want you can specify the instance by path, but it means it must be reachable from window

        this.myClassesByReference = [];         // By Reference means by using a reference to the class, like doing PP.Timer, but also let ref = PP.Timer and use ref
        this.myClassesByPath = [];              // By Path means by using the full class path, like "PP.Timer", this is requiredneeded if u want to count the constructor

        this.myFunctionsByPath = [];            // You can also count the call to a specific function, but it must be reachable from window, no reference way

        this.myFunctionNamesToInclude = [];     // empty means every function is included
        this.myFunctionNamesToExclude = [];     // empty means no function is excluded

        this.myExcludeConstructor = false;      // constructor calls count can be a problem for some classes (like Array)
        this.myExcludeJavascriptObjectFunctions = false;
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
        let counterTarget = null;

        if (isClass) {
            counterTarget = reference.prototype;
        } else {
            counterTarget = reference;
        }

        let propertyNames = this._getAllPropertyNames(reference);

        for (let propertyName of propertyNames) {
            if (typeof counterTarget[propertyName] == "function" && !this._isClass(counterTarget[propertyName])) {
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
                        this._myBackupFunctions[propertyName] = counterTarget[propertyName];

                        this._myFunctionsCallsCounters.set(propertyName, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCounters;

                        let backupFunction = this._myBackupFunctions[propertyName];

                        let backupEnumerable = counterTarget.propertyIsEnumerable(propertyName);

                        counterTarget[propertyName] = function () {
                            functionsCallsCounters.set(propertyName, functionsCallsCounters.get(propertyName) + 1);
                            return backupFunction.bind(this)(...arguments);
                        };

                        Object.defineProperty(counterTarget, propertyName, { enumerable: backupEnumerable });
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

    _getAllPropertyNames(reference) {
        let properties = Object.getOwnPropertyNames(reference);

        let prototype = reference.prototype;
        if (prototype == null) {
            prototype = Object.getPrototypeOf(reference);
        }

        if (prototype != null && (!this._myParams.myExcludeJavascriptObjectFunctions || prototype != Object.prototype)) {
            let recursivePropertyNames = this._getAllPropertyNames(prototype);
            for (let recursivePropertyName of recursivePropertyNames) {
                properties.pp_pushUnique(recursivePropertyName);
            }
        }

        return properties;
    }
};