PP.EasyTuneVariables = class EasyTuneVariables {
    constructor() {
        this._myVariables = new Map();
    }

    add(variable) {
        this._myVariables.set(variable.myName, variable);
    }

    remove(variableName) {
        this._myVariables.delete(variableName);
    }

    get(variableName) {
        let variable = this._myVariables.get(variableName);
        if (variable) {
            return variable.getValue();
        }

        return null;
    }

    set(variableName, value, resetDefaultValue = false) {
        let variable = this._myVariables.get(variableName);
        if (variable) {
            variable.setValue(value, resetDefaultValue);
        }
    }

    isActive(variableName) {
        let variable = this._myVariables.get(variableName);
        if (variable) {
            return variable.myIsActive;
        }

        return false;
    }

    getEasyTuneVariable(variableName) {
        return this._myVariables.get(variableName);
    }

    fromJSON(json, resetDefaultValue = false) {
        let objectJSON = JSON.parse(json);

        for (let variable of this._myVariables.values()) {
            let variableValueJSON = objectJSON[variable.myName];
            if (variableValueJSON !== undefined) {
                variable.fromJSON(variableValueJSON, resetDefaultValue);
            }
        }
    }

    toJSON() {
        let objectJSON = {};

        for (let variable of this._myVariables.values()) {
            objectJSON[variable.myName] = variable.toJSON();
        }

        return JSON.stringify(objectJSON);
    }

    registerValueChangedEventListener(variableName, callbackID, callback) {
        this._myVariables.get(variableName).registerValueChangedEventListener(callbackID, callback);
    }

    unregisterValueChangedEventListener(variableName, callbackID, callback) {
        this._myVariables.get(variableName).unregisterValueChangedEventListener(callbackID);
    }
};