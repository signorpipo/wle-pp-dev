import { Globals } from "../../../pp/globals.js";
import { EasyTuneUtils } from "../easy_tune_utils.js";

export class EasyObjectTuner {

    constructor(object, variableName, setAsWidgetCurrentVariable, useTuneTarget, engine = Globals.getMainEngine()) {
        this._myObject = object;
        this._myUseTuneTarget = useTuneTarget;
        this._mySetAsWidgetCurrentVariable = setAsWidgetCurrentVariable;

        let easyObject = this._myObject;
        if (this._myUseTuneTarget) {
            easyObject = Globals.getEasyTuneTarget(engine);
        }

        let variableNamePrefix = this._getVariableNamePrefix();

        if (variableName == "") {
            let objectName = easyObject.pp_getName();
            if (objectName != "") {
                this._myInitialEasyTuneVariableName = variableNamePrefix.concat(objectName);
            } else {
                this._myInitialEasyTuneVariableName = variableNamePrefix.concat(easyObject.pp_getID());
            }
        } else {
            this._myInitialEasyTuneVariableName = variableName;
        }

        this._myEasyTuneVariable = null;

        this._myManualVariableUpdate = false;

        this._myEngine = engine;
    }

    getEasyTuneVariable() {
        return this._myEasyTuneVariable;
    }

    start() {
        this._myEasyTuneVariable = this._createEasyTuneVariable(this._myInitialEasyTuneVariableName);
        Globals.getEasyTuneVariables(this._myEngine).add(this._myEasyTuneVariable);

        if (this._mySetAsWidgetCurrentVariable) {
            EasyTuneUtils.setWidgetCurrentVariable(this._myInitialEasyTuneVariableName, this._myEngine);
        }

        let easyObject = this._myObject;
        if (this._myUseTuneTarget) {
            easyObject = Globals.getEasyTuneTarget(this._myEngine);
        }
        this._myPrevEasyObject = easyObject;

        if (easyObject != null) {
            let value = this._getObjectValue(easyObject);
            this._myEasyTuneVariable.setValue(value, true);
        }

        this._myEasyTuneVariable.registerValueChangedEventListener(this, function (newValue) {
            if (this._myManualVariableUpdate) return;

            let easyObject = this._myObject;
            if (this._myUseTuneTarget) {
                easyObject = Globals.getEasyTuneTarget(this._myEngine);
            }

            if (easyObject != null) {
                this._updateObjectValue(easyObject, newValue);
            }
        }.bind(this));
    }

    update(dt) {
        let easyObject = this._myObject;
        if (this._myUseTuneTarget) {
            easyObject = Globals.getEasyTuneTarget(this._myEngine);
        }

        let value = null;
        if (easyObject != null) {
            value = this._getObjectValue(easyObject);
        } else {
            value = this._getDefaultValue();
        }

        if (value != null) {
            const currentValue = this._myEasyTuneVariable.getValue();
            if (!this._areValueEqual(currentValue, value)) {
                this._myManualVariableUpdate = true;
                this._myEasyTuneVariable.setValue(value, this._myPrevEasyObject != easyObject);
                this._myPrevEasyObject = easyObject;

                this._myManualVariableUpdate = false;
            }
        }
    }
}