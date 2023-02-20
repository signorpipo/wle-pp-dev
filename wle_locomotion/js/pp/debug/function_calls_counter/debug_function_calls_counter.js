PP.DebugFunctionCallsCounterParams = class DebugFunctionCallsCounterParams {
    constructor() {
        this.myObjectsByReference = [];         // You can specify to count the call on a specific object instance
        this.myObjectsByPath = [];              // If you want you can specify the instance by path, but it means it must be reachable from window

        this.myClassesByReference = [];         // By Reference means by using a reference to the class, like doing PP.Timer, but also let ref = PP.Timer and use ref
        this.myClassesByPath = [];              // By Path means by using the full class path, like "PP.Timer", this is requiredneeded if u want to count the constructor

        this.myFunctionsByPath = [];
        // You can also count the call to a specific function, but it must be reachable from window, no reference way
        // It's mostly for global functions, which could be tracked anyway using window as object reference

        this.myFunctionNamesToInclude = [];     // empty means every function is included
        this.myFunctionNamesToExclude = [];     // empty means no function is excluded

        this.myExcludeConstructor = false;      // constructor calls count can be a problem for some classes (like Array)
        this.myExcludeJavascriptObjectFunctions = false;

        this.myObjectRecursionDepthLevelforObjects = 0;     // you can specify if you want to also count the children OBJECTS of the objects you have specified
        this.myObjectRecursionDepthLevelforClasses = 0;     // you can specify if you want to also count the children CLASSES of the objects you have specified
        // the depth level specify how deep in the hierarchy, level 0 means no recursion, 1 only children, 2 also grand children, and so on
        // -1 to select all the hierarchy
    }
};

PP.DebugFunctionCallsCounter = class DebugFunctionCallsCounter {
    constructor(params = new PP.DebugFunctionCallsCounterParams()) {
        this._myFunctionsCallsCount = new Map();
        this._myBackupFunctions = [];
        this._myPropertiesAlreadyCounted = new Map();

        this._myParams = params;

        let objectsAndParents = this._getReferencesAndParents(this._myParams.myObjectsByReference, this._myParams.myObjectsByPath);
        let classesAndParents = this._getReferencesAndParents(this._myParams.myClassesByReference, this._myParams.myClassesByPath);

        this._objectRecursion(objectsAndParents, classesAndParents);

        for (let referenceAndParent of classesAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];

            this._addCallsCounter(reference, referenceParent, referenceName, true);
        }

        for (let referenceAndParent of objectsAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];

            this._addCallsCounter(reference, referenceParent, referenceName, false);
        }

        let functionsAndParents = this._getReferencesAndParents([], this._myParams.myFunctionsByPath);
        for (let referenceAndParent of functionsAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];

            this._addFunctionCallsCounter(referenceParent, referenceName, null, null, null, false);
        }
    }

    resetCallsCount() {
        for (let property of this._myFunctionsCallsCount.keys()) {
            this._myFunctionsCallsCount.set(property, 0);
        }
    }

    getCallsCount(sortList = false) {
        let callsCount = this._myFunctionsCallsCount;

        if (sortList) {
            callsCount = new Map([...callsCount.entries()].sort(function (first, second) {
                return -(first[1] - second[1]);
            }));
        }

        return callsCount;
    }

    _getReferenceFromPath(path) {
        let pathSplit = path.split(".");
        let parent = window;
        for (let i = 0; i < pathSplit.length - 1; i++) {
            parent = parent[pathSplit[i]];
        }

        return parent[pathSplit[pathSplit.length - 1]];
    }

    _getReferenceNameFromPath(path) {
        let pathSplit = path.split(".");

        if (pathSplit.length > 0) {
            return pathSplit[pathSplit.length - 1];
        }

        return "";
    }

    _getParentReferenceFromPath(path) {
        let pathSplit = path.split(".");
        let parent = window;
        for (let i = 0; i < pathSplit.length - 1; i++) {
            parent = parent[pathSplit[i]];
        }

        return parent;
    }

    _setClassConstructor(referenceName, referenceParent, newConstructor) {
        let backupConstructor = referenceParent[referenceName];

        referenceParent[referenceName] = newConstructor;
        referenceParent[referenceName].prototype = backupConstructor.prototype;
    }

    _addCallsCounter(reference, referenceParent, referenceName, isClass) {
        let counterTarget = null;

        if (isClass) {
            counterTarget = reference.prototype;
        } else {
            counterTarget = reference;
        }

        let propertyNames = this._getAllPropertyNames(reference);

        for (let propertyName of propertyNames) {
            this._addFunctionCallsCounter(counterTarget, propertyName, reference, referenceParent, referenceName, isClass);
        }
    }

    _addFunctionCallsCounter(counterTarget, propertyName, reference, referenceParent, referenceName, isClass) {
        if (this._isFunction(counterTarget, propertyName)) {
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
                if (!this._myPropertiesAlreadyCounted.has(propertyName)) {
                    this._myPropertiesAlreadyCounted.set(propertyName, []);
                }

                let isPropertyCountedAlready = this._myPropertiesAlreadyCounted.get(propertyName).pp_hasEqual(counterTarget);
                if (!isPropertyCountedAlready) {
                    if (propertyName != "constructor") {
                        this._myBackupFunctions[propertyName] = counterTarget[propertyName];

                        this._myFunctionsCallsCount.set(propertyName, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCount;

                        let backupFunction = this._myBackupFunctions[propertyName];

                        let backupEnumerable = counterTarget.propertyIsEnumerable(propertyName);

                        try {
                            counterTarget[propertyName] = function () {
                                functionsCallsCounters.set(propertyName, functionsCallsCounters.get(propertyName) + 1);
                                return backupFunction.bind(this)(...arguments);
                            };

                            Object.defineProperty(counterTarget, propertyName, { enumerable: backupEnumerable });
                        } catch (error) {
                        }
                    } else if (!this._myParams.myExcludeConstructor && isClass && referenceParent != null) {
                        this._myBackupFunctions[propertyName] = reference;

                        this._myFunctionsCallsCount.set(propertyName, 0);
                        let functionsCallsCounters = this._myFunctionsCallsCount;

                        this._setClassConstructor(referenceName, referenceParent, function () {
                            functionsCallsCounters.set(propertyName, functionsCallsCounters.get(propertyName) + 1);
                            return new reference(...arguments);
                        });
                    }

                    this._myPropertiesAlreadyCounted.get(propertyName).push(counterTarget);
                }
            }
        }
    }

    _getReferencesAndParents(byReferenceList, byPathList) {
        let equalCallback = (first, second) => first[0] == second[0];
        let referenceAndParents = [];

        for (let path of byPathList) {
            let reference = this._getReferenceFromPath(path);
            let referenceParent = this._getParentReferenceFromPath(path);

            referenceAndParents.pp_pushUnique([reference, referenceParent, this._getReferenceNameFromPath(path)], equalCallback);
        }

        for (let reference of byReferenceList) {
            referenceAndParents.pp_pushUnique([reference, null, reference.name], equalCallback);
        }

        return referenceAndParents;
    }

    _isFunction(reference, propertyName) {
        let isFunction = false;

        try {
            isFunction = typeof reference[propertyName] == "function" && !this._isClass(reference, propertyName);
        } catch (error) { }

        return isFunction;
    }

    _isClass(reference, propertyName) {
        let isClass = false;

        try {
            isClass = typeof reference[propertyName] == "function" && propertyName != "constructor" && reference[propertyName].prototype != null && typeof reference[propertyName].prototype.constructor == "function" &&
                (/^class/).test(reference[propertyName].toString());
        } catch (error) { }

        return isClass;
    }


    _isObject(reference, propertyName) {
        return typeof reference[propertyName] == "object";
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

    _objectRecursion(objectsAndParents, classesAndParents) {
        let equalCallback = (first, second) => first[0] == second[0];

        let objectsToVisit = [];
        for (let objectAndParent of objectsAndParents) {
            objectsToVisit.pp_pushUnique([objectAndParent[0], 0], equalCallback);
        }

        while (objectsToVisit.length > 0) {
            let objectToVisit = objectsToVisit.shift();

            let object = objectToVisit[0];
            let objectLevel = objectToVisit[1];

            if ((
                objectLevel + 1 <= this._myParams.myObjectRecursionDepthLevelforObjects || this._myParams.myObjectRecursionDepthLevelforObjects == -1) ||
                objectLevel + 1 <= this._myParams.myObjectRecursionDepthLevelforClasses || this._myParams.myObjectRecursionDepthLevelforClasses == -1) {

                let propertyNames = this._getAllPropertyNames(reference);

                for (let propertyName of propertyNames) {
                    let isClass = this._isClass(object, propertyName);
                    let isObject = this._isObject(object, propertyName);

                    if (isObject && (objectLevel + 1 <= this._myParams.myObjectRecursionDepthLevelforObjects || this._myParams.myObjectRecursionDepthLevelforObjects == -1)) {
                        objectsToVisit.pp_pushUnique([object[propertyName], objectLevel + 1], equalCallback);

                        objectsAndParents.pp_pushUnique([object[propertyName], object, object[propertyName].name], equalCallback);
                    }

                    if (isClass && (objectLevel + 1 <= this._myParams.myObjectRecursionDepthLevelforClasses || this._myParams.myObjectRecursionDepthLevelforClasses == -1)) {
                        classesAndParents.pp_pushUnique([object[propertyName], object, object[propertyName].name], equalCallback);
                    }
                }
            }
        }
    }
};