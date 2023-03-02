PP.JSUtils = {
    now: function () {
        return window.performance.now();
    },
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

        propertyDescriptor = Object.getOwnPropertyDescriptor(reference, propertyName);

        if (propertyDescriptor == null && reference.prototype != null) {
            propertyDescriptor = Object.getOwnPropertyDescriptor(reference.prototype, propertyName)
        }

        if (propertyDescriptor == null && Object.getPrototypeOf(reference) != null) {
            propertyDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(reference), propertyName);
        }

        if (propertyDescriptor == null && reference.prototype != null && Object.getPrototypeOf(reference.prototype) != null) {
            propertyDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(reference.prototype), propertyName);
        }

        return propertyDescriptor;
    },
    getReferenceProperty: function (reference, propertyName) {
        let property = undefined;

        property = reference[propertyName];

        if (property === undefined && reference.prototype != null) {
            property = reference.prototype[propertyName];
        }

        if (property === undefined && Object.getPrototypeOf(reference) != null) {
            property = Object.getPrototypeOf(reference)[propertyName];
        }

        if (property === undefined && reference.prototype != null && Object.getPrototypeOf(reference.prototype) != null) {
            property = Object.getPrototypeOf(reference.prototype)[propertyName];
        }

        return property;
    },
    getReferenceFromPath: function (path, pathStartReference = window) {
        let reference = null;

        let referenceName = this.getReferenceNameFromPath(path);
        if (referenceName != null) {
            return this.getParentReferenceFromPath(path, pathStartReference)[referenceName];
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
    getParentReferenceFromPath: function (path, pathStartReference = window) {
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
                        let isCurrentConfigurable = this.getReferencePropertyDescriptor(originalProperty, currentPropertyName).configurable;
                        let isCurrentWritable = this.getReferencePropertyDescriptor(originalProperty, currentPropertyName).writable;
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
    isFunctionByName(reference, propertyName) {
        let isFunction = false;

        try {
            isFunction = typeof reference[propertyName] == "function" && !this.isClassByName(reference, propertyName);
        } catch (error) { }

        return isFunction;
    },
    isClassByName(reference, propertyName) {
        let isClass = false;

        try {
            isClass =
                typeof reference[propertyName] == "function" && propertyName != "constructor" &&
                reference[propertyName].prototype != null && typeof reference[propertyName].prototype.constructor == "function" &&
                (/^class/).test(reference[propertyName].toString());
        } catch (error) { }

        return isClass;
    },
    isObjectByName(reference, propertyName) {
        let isObject = false;

        try {
            isObject = typeof reference[propertyName] == "object";
        } catch (error) { }

        return isObject;
    }
};