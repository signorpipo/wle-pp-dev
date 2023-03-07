PP.JSUtils = {
    getReferencePropertyNames: function (reference) {
        let propertyNames = Object.getOwnPropertyNames(reference);

        let prototypes = [reference.prototype, Object.getPrototypeOf(reference)];

        for (let prototype of prototypes) {
            if (prototype != null) {
                let recursivePropertyNames = this.getReferencePropertyNames(prototype);
                for (let recursivePropertyName of recursivePropertyNames) {
                    propertyNames.pp_pushUnique(recursivePropertyName);
                }
            }
        }

        return propertyNames;
    },
    getReferencePropertyDescriptor: function (reference, propertyName) {
        let propertyDescriptor = null;

        let propertyParent = this.getReferencePropertyOwnParent(reference, propertyName);

        if (propertyParent != null) {
            propertyDescriptor = Object.getOwnPropertyDescriptor(propertyParent, propertyName);
        }

        return propertyDescriptor;
    },
    getReferenceProperty: function (reference, propertyName) {
        return reference[propertyName];
    },
    getReferencePropertyOwnParent: function (reference, propertyName) {
        let parent = null;

        let parents = this.getReferencePropertyOwnParents(reference, propertyName);
        if (parents.length > 0) {
            parent = parents[0];
        }

        return parent;
    },
    getReferencePropertyOwnParents: function (reference, propertyName) {
        let parents = [];

        let possibleParents = [];

        let prototypes = [];
        prototypes.pp_pushUnique(reference);

        while (prototypes.length > 0) {
            let prototype = prototypes.shift();
            if (prototype != null) {
                possibleParents.pp_pushUnique(prototype);

                prototypes.pp_pushUnique(prototype.prototype);
                prototypes.pp_pushUnique(Object.getPrototypeOf(prototype));
            }
        }

        for (let possibleParent of possibleParents) {
            let propertyNames = Object.getOwnPropertyNames(possibleParent);
            if (propertyNames.pp_hasEqual(propertyName)) {
                parents.push(possibleParent);
            }
        }

        return parents;
    },
    getReferenceFromPath: function (path, pathStartReference = window) {
        let reference = null;

        let referenceName = this.getReferenceNameFromPath(path);
        if (referenceName != null) {
            return this.getReferenceParentFromPath(path, pathStartReference)[referenceName];
        }

        return reference;
    },
    getReferenceNameFromPath: function (path) {
        let referenceName = null;

        if (path != null) {
            let pathSplit = path.split(".");
            if (pathSplit.length > 0) {
                referenceName = pathSplit[pathSplit.length - 1];
            }
        }

        return referenceName;
    },
    getReferenceParentFromPath: function (path, pathStartReference = window) {
        let pathSplit = path.split(".");
        let currentParent = pathStartReference;
        for (let i = 0; i < pathSplit.length - 1; i++) {
            currentParent = currentParent[pathSplit[i]];
        }

        return currentParent;
    },
    overwriteReferenceProperty: function (newProperty, reference, propertyName, debugLogActive = false) {
        let success = false;

        try {
            let originalProperty = reference[propertyName];

            let isEnumerable = false;
            let isConfigurable = true;
            let isWritable = true;

            if (originalProperty != null) {
                isEnumerable = this.getReferencePropertyDescriptor(reference, propertyName).enumerable;
                isConfigurable = this.getReferencePropertyDescriptor(reference, propertyName).configurable;
                isWritable = this.getReferencePropertyDescriptor(reference, propertyName).writable;

                let currentPropertyNames = this.getReferencePropertyNames(originalProperty);
                for (let currentPropertyName of currentPropertyNames) {
                    try {
                        let isCurrentEnumerable = this.getReferencePropertyDescriptor(originalProperty, currentPropertyName).enumerable;
                        isCurrentEnumerable = typeof isCurrentEnumerable == "boolean" ? isCurrentEnumerable : false;
                        let isCurrentConfigurable = this.getReferencePropertyDescriptor(originalProperty, currentPropertyName).configurable;
                        isCurrentConfigurable = typeof isCurrentConfigurable == "boolean" ? isCurrentConfigurable : false;
                        let isCurrentWritable = this.getReferencePropertyDescriptor(originalProperty, currentPropertyName).writable;
                        isCurrentWritable = typeof isCurrentWritable == "boolean" ? isCurrentWritable : false;
                        Object.defineProperty(newProperty, currentPropertyName, {
                            value: originalProperty[currentPropertyName],
                            enumerable: isCurrentEnumerable,
                            configurable: isCurrentConfigurable,
                            writable: isCurrentWritable
                        });
                    } catch (error) {
                        if (debugLogActive) {
                            console.error("Property:", currentPropertyName, "of:", originalProperty, "can't be overwritten.\nError:", error);
                        }
                    }
                }
            }

            Object.defineProperty(reference, propertyName, {
                value: newProperty,
                enumerable: isEnumerable,
                configurable: isConfigurable,
                writable: isWritable
            });

            success = true;
        } catch (error) {
            if (debugLogActive) {
                console.error("Property:", propertyName, "of:", reference, "can't be overwritten.\nError:", error);
            }
        }

        return success;
    },
    isFunctionByName(functionParent, functionName) {
        let isFunction = false;

        try {
            isFunction = typeof functionParent[functionName] == "function" && !this.isClassByName(functionParent, functionName);
        } catch (error) { }

        return isFunction;
    },
    isClassByName(classParent, className) {
        let isClass = false;

        try {
            isClass =
                typeof classParent[className] == "function" && className != "constructor" &&
                classParent[className].prototype != null && typeof classParent[className].prototype.constructor == "function" &&
                (/^class/).test(classParent[className].toString());
        } catch (error) { }

        return isClass;
    },
    isObjectByName(objectParent, objectName) {
        let isObject = false;

        try {
            isObject = typeof objectParent[objectName] == "object";
        } catch (error) { }

        return isObject;
    }
};