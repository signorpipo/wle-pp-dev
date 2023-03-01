PP.DebugFunctionOverwriterParams = class DebugFunctionOverwriterParams {
    constructor() {
        this.myObjectsByReference = [];         // You can specify to count the call on a specific object instance
        this.myObjectsByPath = [];              // If you want you can specify the instance by path, but it means it must be reachable from window

        this.myClassesByReference = [];         // By Reference means by using a reference to the class, like doing PP.Timer, but also let ref = PP.Timer and use ref
        this.myClassesByPath = [];              // By Path means by using the full class path, like "PP.Timer", this is requiredneeded if u want to count the constructor

        this.myFunctionsByPath = [];
        // You can also count the call to a specific function, but it must be reachable from window, no reference way
        // It's mostly for global functions, which could be tracked anyway using window as object reference

        this.myExcludeConstructors = false;      // constructor calls count can be a problem for some classes (like Array)
        this.myExcludeJavascriptObjectFunctions = false;

        this.myFunctionNamesToInclude = [];     // empty means every function is included, can be a regex
        this.myFunctionNamesToExclude = [];     // empty means no function is excluded, can be a regex

        // these can be used if u want to have a bit more control on function name filtering
        this.myFunctionPathsToInclude = [];         // empty means every function is included, can be a regex
        this.myFunctionPathsToExclude = [];         // empty means no function is excluded, can be a regex

        this.myObjectAddObjectDescendantsDepthLevel = 0;        // you can specify if you want to also count the OBJECT descendants of the objects you have specified
        this.myObjectAddClassDescendantsDepthLevel = 0;       // you can specify if you want to also count the CLASS descendants of the objects you have specified
        // the depth level specify how deep in the hierarchy, level 0 means no recursion, 1 only children, 2 also grand children, and so on
        // -1 to select all the hierarchy

        // these filters are only useful if u are doing recursion
        this.myObjectNamesToInclude = [];           // empty means every object is included, can be a regex
        this.myObjectNamesToExclude = [];           // empty means no object is excluded, can be a regex

        this.myClassNamesToInclude = [];            // empty means every class is included, can be a regex
        this.myClassNamesToExclude = [];            // empty means no class is excluded, can be a regex

        this.myObjectPathsToInclude = [];           // empty means every object is included, can be a regex
        this.myObjectPathsToExclude = [];           // empty means no object is excluded, can be a regex

        this.myClassPathsToInclude = [];            // empty means every class is included, can be a regex
        this.myClassPathsToExclude = [];            // empty means no class is excluded, can be a regex

        // Tricks
        // - you can specify an object/class/function as a pair [object, "name"] instead of just object
        //   and the name, if not null, will be used as path instead of the default one
        //   WARNING: this means that there is a specific case, an array of 2 elements with a string, which can't be tracked if you don't put it inside an array like above

        this.myDebugLogActive = false;
    }
};

PP.DebugFunctionOverwriter = class DebugFunctionOverwriter {
    constructor(params = new PP.DebugFunctionOverwriterParams()) {
        this._myParams = params;

        this._myPropertiesAlreadyOverwritten = new Map();
    }

    overwrite() {
        let classesAndParents = this._getReferencesAndParents(this._myParams.myClassesByReference, this._myParams.myClassesByPath, true);
        let objectsAndParents = this._getReferencesAndParents(this._myParams.myObjectsByReference, this._myParams.myObjectsByPath, false);
        let functionsAndParents = this._getReferencesAndParents([], this._myParams.myFunctionsByPath, false);

        this._objectAddDescendants(objectsAndParents, classesAndParents);

        for (let referenceAndParent of classesAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];
            let referencePath = referenceAndParent[3];
            let referenceNameForFilter = referenceAndParent[4];

            this._overwriteReferenceFunctions(reference, referenceParent, referenceName, referencePath, referenceNameForFilter, true);
        }

        for (let referenceAndParent of objectsAndParents) {
            let reference = referenceAndParent[0];
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];
            let referencePath = referenceAndParent[3];
            let referenceNameForFilter = referenceAndParent[4];

            this._overwriteReferenceFunctions(reference, referenceParent, referenceName, referencePath, referenceNameForFilter, false);
        }

        for (let referenceAndParent of functionsAndParents) {
            let referenceParent = referenceAndParent[1];
            let referenceName = referenceAndParent[2];
            let referencePath = referenceAndParent[3];

            this._overwriteFunction(referenceParent, referenceName, null, null, referencePath, false, true);
        }
    }

    // Hooks

    _getOverwrittenFunction(reference, propertyName, referencePath, isClass, isFunction) {
        return reference[propertyName];
    }

    _getOverwrittenConstructor(reference, propertyName, referencePath, isClass, isFunction) {
        return reference[propertyName];
    }

    _onOverwriteSuccess(reference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction, isConstructor) {

    }

    _onOverwriteFailure(reference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction, isConstructor) {

    }

    // Hooks end

    _overwriteReferenceFunctions(reference, referenceParent, referenceName, referencePath, referenceNameForFilter, isClass) {
        let includePathList = this._myParams.myObjectPathsToInclude;
        let excludePathList = this._myParams.myObjectPathsToExclude;
        let includeNameList = this._myParams.myObjectNamesToInclude;
        let excludeNameList = this._myParams.myObjectNamesToExclude;
        if (isClass) {
            includePathList = this._myParams.myClassPathsToInclude;
            excludePathList = this._myParams.myClassPathsToExclude;
            includeNameList = this._myParams.myClassNamesToInclude;
            excludeNameList = this._myParams.myClassNamesToExclude;
        }

        let isValidReferencePath = this._filterName(referencePath, includePathList, excludePathList);
        let isValidReferenceName = this._filterName(referenceNameForFilter, includeNameList, excludeNameList);
        if (isValidReferencePath && isValidReferenceName) {
            let propertyNames = PP.JSUtils.getReferencePropertyNames(reference);
            for (let propertyName of propertyNames) {
                let overwriteTargetReference = null;

                let referenceParentForConstructor = null;
                let referenceNameForConstructor = null;

                if (isClass) {
                    overwriteTargetReference = reference.prototype;
                    try {
                        if (overwriteTargetReference[propertyName] == null) {
                            overwriteTargetReference = reference;
                        }
                    } catch (e) { }

                    referenceParentForConstructor = referenceParent;
                    referenceNameForConstructor = referenceName;
                } else {
                    overwriteTargetReference = reference;
                }

                this._overwriteFunction(overwriteTargetReference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, false);
            }
        }
    }

    _overwriteFunction(reference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction) {
        if (PP.JSUtils.isFunctionByName(reference, propertyName)) {
            let isValidFunctionName = this._filterName(propertyName, this._myParams.myFunctionNamesToInclude, this._myParams.myFunctionNamesToExclude);
            let isValidFunctionPath = this._filterName((referencePath != null ? referencePath + "." : "") + propertyName, this._myParams.myFunctionPathsToInclude, this._myParams.myFunctionPathsToExclude);
            if (isValidFunctionName && isValidFunctionPath) {
                if (!this._myPropertiesAlreadyOverwritten.has(propertyName)) {
                    this._myPropertiesAlreadyOverwritten.set(propertyName, []);
                }

                let isPropertyCountedAlready = this._myPropertiesAlreadyOverwritten.get(propertyName).pp_hasEqual(reference);
                if (!isPropertyCountedAlready) {

                    let overwriteSuccess = false;
                    let isConstructor = false;
                    if (propertyName != "constructor") {
                        try {
                            let newFunction = this._getOverwrittenFunction(reference, propertyName, referencePath, isClass, isFunction);
                            if (newFunction != reference[propertyName]) {
                                overwriteSuccess = PP.JSUtils.overwriteReferenceProperty(newFunction, reference, propertyName, this._myParams.myDebugLogActive);
                            } else {
                                overwriteSuccess = true;
                            }
                        } catch (error) {
                        }
                    } else if (!this._myParams.myExcludeConstructors && isClass && referenceParentForConstructor != null &&
                        [referenceNameForConstructor] != null && referenceParentForConstructor[referenceNameForConstructor].prototype != null) {
                        isConstructor = true;

                        try {
                            let newConstructor = this._getOverwrittenConstructor(referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction);
                            if (newConstructor != referenceParentForConstructor[referenceNameForConstructor]) {
                                overwriteSuccess = PP.JSUtils.overwriteReferenceProperty(newConstructor, referenceParentForConstructor, referenceNameForConstructor, this._myParams.myDebugLogActive);
                            } else {
                                overwriteSuccess = true;
                            }
                        } catch (error) {
                        }
                    }

                    if (overwriteSuccess) {
                        this._myPropertiesAlreadyOverwritten.get(propertyName).push(reference);
                        this._onOverwriteSuccess(reference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction, isConstructor);
                    } else {
                        this._onOverwriteFailure(reference, propertyName, referenceParentForConstructor, referenceNameForConstructor, referencePath, isClass, isFunction, isConstructor);
                    }
                }
            }
        }
    }

    _getReferencesAndParents(byReferenceList, byPathList, isClass) {
        let referenceAndParents = [];

        let equalCallback = (first, second) => first[0] == second[0];

        for (let pathPair of byPathList) {
            let path = pathPair;
            let referenceName = "";
            let referencePath = pathPair;
            let referenceNameForFilter = "";

            if (pathPair != null && Array.isArray(pathPair) && pathPair.length != null && pathPair.length == 2 && typeof pathPair[1] == "string") {
                path = pathPair[0];
                referencePath = pathPair[1];
            }

            referenceName = PP.JSUtils.getReferenceNameFromPath(path);
            referenceNameForFilter = PP.JSUtils.getReferenceNameFromPath(referencePath);

            let reference = PP.JSUtils.getReferenceFromPath(path);
            let referenceParent = PP.JSUtils.getParentReferenceFromPath(path);

            if (reference != null) {
                referenceAndParents.pp_pushUnique([reference, referenceParent, referenceName, referencePath, referenceNameForFilter], equalCallback);
            }
        }

        for (let referencePair of byReferenceList) {
            let reference = referencePair;
            let referenceName = "";
            let referencePath = "";
            let referenceNameForFilter = "";

            if (referencePair != null && referencePair.length != null && referencePair.length == 2 && typeof referencePair[1] == "string") {
                reference = referencePair[0];
                referencePath = referencePair[1];
                referenceNameForFilter = PP.JSUtils.getReferenceNameFromPath(referencePath);
            } else {
                referencePath = isClass ? reference.name : null;
                referenceNameForFilter = isClass ? reference.name : null;
            }

            if (isClass) {
                referenceName = reference.name;
            } else {
                referenceName = PP.JSUtils.getReferenceNameFromPath(referencePath);
            }

            if (reference != null) {
                referenceAndParents.pp_pushUnique([reference, null, referenceName, referencePath, referenceNameForFilter], equalCallback);
            }
        }

        return referenceAndParents;
    }

    _objectAddDescendants(objectsAndParents, classesAndParents) {
        let equalCallback = (first, second) => first[0] == second[0];

        let objectsToVisit = [];
        for (let objectAndParent of objectsAndParents) {
            objectsToVisit.pp_pushUnique([objectAndParent[0], 0, objectAndParent[3]], equalCallback);
        }

        while (objectsToVisit.length > 0) {
            let objectToVisit = objectsToVisit.shift();

            let object = objectToVisit[0];
            let objectLevel = objectToVisit[1];
            let objectPath = objectToVisit[2];

            if ((
                objectLevel + 1 <= this._myParams.myObjectAddObjectDescendantsDepthLevel || this._myParams.myObjectAddObjectDescendantsDepthLevel == -1) ||
                objectLevel + 1 <= this._myParams.myObjectAddClassDescendantsDepthLevel || this._myParams.myObjectAddClassDescendantsDepthLevel == -1) {

                let propertyNames = PP.JSUtils.getReferencePropertyNames(object);

                for (let propertyName of propertyNames) {
                    try {
                        if (object[propertyName] == null) {
                            continue;
                        }
                    } catch (error) {
                        continue;
                    }

                    let currentPath = "";
                    let currentName = "";
                    if (objectPath != null) {
                        if (objectPath == "_WL._components" && (object[propertyName]._type != null)) {
                            currentName = "[" + propertyName + "]" + "{\"" + object[propertyName]._type + "\"}";
                            currentPath = objectPath + currentName;
                        } else if (objectPath == "_WL._componentTypes" && (object[propertyName].TypeName != null)) {
                            currentName = object[propertyName].TypeName;
                            currentPath = objectPath + "[\"" + currentName + "\"]";
                        } else {
                            currentName = propertyName;
                            currentPath = objectPath + "." + currentName;
                        }
                    } else {
                        currentName = propertyName;
                        currentPath = currentName;
                    }

                    let isClass = PP.JSUtils.isClassByName(object, propertyName);
                    let isObject = PP.JSUtils.isObjectByName(object, propertyName);

                    let includePathList = this._myParams.myObjectPathsToInclude;
                    let excludePathList = this._myParams.myObjectPathsToExclude;
                    let includeNameList = this._myParams.myObjectNamesToInclude;
                    let excludeNameList = this._myParams.myObjectNamesToExclude;
                    if (isClass) {
                        includePathList = this._myParams.myClassPathsToInclude;
                        excludePathList = this._myParams.myClassPathsToExclude;
                        includeNameList = this._myParams.myClassNamesToInclude;
                        excludeNameList = this._myParams.myClassNamesToExclude;
                    }

                    let isValidReferencePath = this._filterName(currentPath, includePathList, excludePathList);
                    let isValidReferenceName = this._filterName(propertyName, includeNameList, excludeNameList);
                    if (isValidReferencePath && isValidReferenceName) {
                        if (isObject && (objectLevel + 1 <= this._myParams.myObjectAddObjectDescendantsDepthLevel || this._myParams.myObjectAddObjectDescendantsDepthLevel == -1)) {
                            objectsAndParents.pp_pushUnique([object[propertyName], object, propertyName, currentPath, currentName], equalCallback);
                        }

                        if (isClass && (objectLevel + 1 <= this._myParams.myObjectAddClassDescendantsDepthLevel || this._myParams.myObjectAddClassDescendantsDepthLevel == -1)) {
                            classesAndParents.pp_pushUnique([object[propertyName], object, propertyName, currentPath, currentName], equalCallback);
                        }

                        if (isObject) {
                            objectsToVisit.pp_pushUnique([object[propertyName], objectLevel + 1, currentPath], equalCallback);
                        }
                    }
                }
            }
        }
    }

    _filterName(name, includeList, excludeList) {
        let isValidName = includeList.length == 0;
        for (let includeName of includeList) {
            if (name.match(new RegExp(includeName)) != null) {
                isValidName = true;
                break;
            }
        }

        if (isValidName) {
            for (let excludeName of excludeList) {
                if (name.match(new RegExp(excludeName)) != null) {
                    isValidName = false;
                    break;
                }
            }
        }

        return isValidName;
    }
};
