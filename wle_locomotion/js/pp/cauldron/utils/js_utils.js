PP.JSUtils = {
    getReferencePrototypes(reference) {
        let prototypes = [];

        prototypes.push(reference);

        let referenceProto = Object.getPrototypeOf(reference);
        while (referenceProto != null) {
            prototypes.pp_pushUnique(referenceProto);
            referenceProto = Object.getPrototypeOf(referenceProto);
        }

        let prototypesToCheck = [reference];
        while (prototypesToCheck.length > 0) {
            let prototypeToCheck = prototypesToCheck.shift();
            if (prototypeToCheck != null) {
                prototypes.pp_pushUnique(prototypeToCheck);

                prototypesToCheck.pp_pushUnique(Object.getPrototypeOf(prototypeToCheck));
                prototypesToCheck.pp_pushUnique(prototypeToCheck.prototype);
            }
        }

        return prototypes;
    },
    getReferencePropertyNames: function (reference) {
        let propertyNames = [];

        let prototypes = this.getReferencePrototypes(reference);

        for (let prototype of prototypes) {
            if (prototype != null) {
                let ownPropertyNames = Object.getOwnPropertyNames(prototype);
                for (let ownPropertyName of ownPropertyNames) {
                    propertyNames.pp_pushUnique(ownPropertyName);
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
        let property = undefined;

        let descriptor = this.getReferencePropertyDescriptor(reference, propertyName);
        if (descriptor != null) {
            property = descriptor.value;
        }

        return property;
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

        let possibleParents = this.getReferencePrototypes(reference);

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
    overwriteReferenceProperty: function (newProperty, reference, propertyName, overwriteOnOwnParent = true, javascriptObjectFunctionsSpecialOverwrite = false, debugLogActive = false) {
        let success = false;

        try {
            let propertyOwnParent = this.getReferencePropertyOwnParent(reference, propertyName);
            if (propertyOwnParent != null) {
                let originalPropertyDescriptor = Object.getOwnPropertyDescriptor(propertyOwnParent, propertyName);

                if (originalPropertyDescriptor != null) {
                    if (originalPropertyDescriptor.get == null && originalPropertyDescriptor.set == null && originalPropertyDescriptor.value != null) {
                        let originalProperty = originalPropertyDescriptor.value;

                        Object.setPrototypeOf(newProperty, Object.getPrototypeOf(originalProperty));

                        let currentPropertyNames = Object.getOwnPropertyNames(originalProperty);
                        for (let currentPropertyName of currentPropertyNames) {
                            try {
                                let currentPropertyDescriptor = Object.getOwnPropertyDescriptor(originalProperty, currentPropertyName);

                                Object.defineProperty(newProperty, currentPropertyName, {
                                    value: currentPropertyDescriptor.value,
                                    enumerable: currentPropertyDescriptor.enumerable,
                                    configurable: currentPropertyDescriptor.configurable,
                                    writable: currentPropertyDescriptor.writable
                                });
                            } catch (error) {
                                if (debugLogActive) {
                                    console.error("Property:", currentPropertyName, "of:", originalProperty.name, "can't be overwritten.");
                                }
                            }
                        }

                        if (javascriptObjectFunctionsSpecialOverwrite) {
                            this._javascriptObjectFunctionsSpecialOverwrite(newProperty, originalProperty);
                        }
                    }

                    let overwriteTarget = reference;
                    if (overwriteOnOwnParent) {
                        overwriteTarget = propertyOwnParent;
                    }

                    Object.defineProperty(overwriteTarget, propertyName, {
                        value: newProperty,
                        enumerable: originalPropertyDescriptor.enumerable,
                        configurable: originalPropertyDescriptor.configurable,
                        writable: originalPropertyDescriptor.writable,
                    });

                    success = true;
                }
            }
        } catch (error) {
            if (debugLogActive) {
                console.error("Property:", propertyName, "of:", reference, "can't be overwritten.");
            }
        }

        return success;
    },
    doesReferencePropertyUseAccessors(reference, propertyName) {
        let propertyUseAccessors = false;

        let propertyDescriptor = this.getReferencePropertyDescriptor(reference, propertyName);

        if (propertyDescriptor != null && (propertyDescriptor.get != null || propertyDescriptor.set != null)) {
            propertyUseAccessors = true;
        }

        return propertyUseAccessors;
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
    },
    _javascriptObjectFunctionsSpecialOverwrite(newProperty, originalProperty) {
        try {
            if (typeof newProperty == "function" && typeof originalProperty == "function") {
                let functionsToOverwrite = ["toString", "toLocaleString", "valueOf"];

                for (let functionToOverwrite of functionsToOverwrite) {
                    let propertyDescriptorToOverwrite = this.getReferencePropertyDescriptor(originalProperty, functionToOverwrite);

                    if (propertyDescriptorToOverwrite != null && propertyDescriptorToOverwrite.value != null &&
                        (propertyDescriptorToOverwrite.value == Object[functionToOverwrite])) {
                        let valueToReturn = Object[functionToOverwrite].bind(originalProperty)();
                        let overwrittenFunction = function () { return valueToReturn; };
                        this.overwriteReferenceProperty(overwrittenFunction, newProperty, functionToOverwrite, false, false);
                    }
                }
            }
        } catch (error) {
            // ignored
        }
    }
};