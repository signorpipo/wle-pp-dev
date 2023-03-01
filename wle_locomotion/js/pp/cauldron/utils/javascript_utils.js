PP.JSUtils = {
    now: function () {
        window.performance.now();
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
    overwriteReferenceProperty: function (newProperty, reference, propertyName, verbose = false) {
        let oldProperty = reference[propertyName];

        let isEnumerable = false;
        let isConfigurable = true;
        let isWritable = true;

        if (oldProperty != null) {
            isEnumerable = Object.getOwnPropertyDescriptor(reference, propertyName).enumerable;
            isConfigurable = Object.getOwnPropertyDescriptor(reference, propertyName).configurable;
            isWritable = Object.getOwnPropertyDescriptor(reference, propertyName).writable;

            let currentPropertyNames = this.getReferencePropertyNames(reference);
            for (let currentPropertyName of currentPropertyNames) {
                try {
                    let isCurrentEnumerable = Object.getOwnPropertyDescriptor(oldProperty, currentPropertyName).enumerable;
                    let isCurrentConfigurable = Object.getOwnPropertyDescriptor(oldProperty, currentPropertyName).configurable;
                    let isCurrentWritable = Object.getOwnPropertyDescriptor(oldProperty, currentPropertyName).writable;
                    Object.defineProperty(newProperty, currentPropertyName, {
                        value: oldProperty[currentPropertyName],
                        enumerable: isCurrentEnumerable,
                        configurable: isCurrentConfigurable,
                        writable: isCurrentWritable
                    });
                } catch (error) {
                    if (verbose) {
                        console.error("Property:", currentPropertyName, "of:", oldProperty, "can't be overwritten.");
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
    },
    isFunctionByName(reference, propertyName) {
        let isFunction = false;

        try {
            isFunction = typeof reference[propertyName] == "function" && !this._isClass(reference, propertyName);
        } catch (error) { }

        return isFunction;
    },
    isClassByName(reference, propertyName) {
        let isClass = false;

        try {
            isClass = typeof reference[propertyName] == "function" && propertyName != "constructor" && reference[propertyName].prototype != null && typeof reference[propertyName].prototype.constructor == "function" &&
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