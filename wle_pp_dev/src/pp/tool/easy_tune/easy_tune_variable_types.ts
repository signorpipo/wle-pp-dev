/**
 * Easy Tune Variables Examples
 * 
 * Number:         Globals.getEasyTuneVariables().add(new EasyTuneNumber("Float", 1.00, (newValue) => this.myFloat = newValue, true, 2, 0.1));  
 * Number Array:   Globals.getEasyTuneVariables().add(new EasyTuneNumberArray("Float Array", [1.00, 2.00, 3.00], (newValue) => this.myFloatArray.pp_copy(newValue), true, 2, 0.1));  
 * Int:            Globals.getEasyTuneVariables().add(new EasyTuneInt("Int", this.myInt, (newValue) => this.myInt = newValue, true, 1));  
 * Int Array:      Globals.getEasyTuneVariables().add(new EasyTuneIntArray("Int Array", [1, 2, 3], (newValue) => this.myIntArray.pp_copy(newValue), true, 1));  
 * Bool:           Globals.getEasyTuneVariables().add(new EasyTuneBool("Bool", this.myBool, (newValue) => this.myBool = newValue, true));  
 * Bool Array:     Globals.getEasyTuneVariables().add(new EasyTuneBoolArray("Bool Array", [false, true, false], (newValue) => this.myBoolArray.pp_copy(newValue), true));  
 * Transform:      Globals.getEasyTuneVariables().add(new EasyTuneTransform("Transform", mat4_create(), (newValue) => this.myTransform.mat4_copy(newValue), true, true, 3));
 */

// #WARN some private variables are unused because they are used by the js widget! Maybe when that will be converted to ts I will fix that to a getter
// but for now do not delete them

import { Emitter, WonderlandEngine } from "@wonderlandengine/api";
import { mat4_create } from "../../plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../pp/globals.js";
import { EasyTuneUtils } from "./easy_tune_utils.js";

export enum EasyTuneVariableType {
    NONE = 0,
    NUMBER = 1,
    BOOL = 2,
    TRANSFORM = 3
}

export class EasyTuneVariableExtraParams {
    public myAutoImportEnabled: boolean | null = null;
    public myManualImportEnabled: boolean | null = null;
    public myExportEnabled: boolean | null = null;

    constructor(autoimportEnabled: boolean | null = null, manualImportEnabled: boolean | null = null, exportEnabled: boolean | null = null) {
        this.myAutoImportEnabled = autoimportEnabled;
        this.myManualImportEnabled = manualImportEnabled;
        this.myExportEnabled = exportEnabled;
    }
}

export abstract class EasyTuneVariable {
    private readonly _myType: EasyTuneVariableType;

    private _myName: string;

    protected abstract _myValue: unknown;
    protected abstract _myDefaultValue: unknown;

    private _myShowOnWidget: boolean;
    private _myAutoImportEnabled: boolean;
    private _myManualImportEnabled: boolean;
    private _myExportEnabled: boolean;

    private _myWidgetCurrentVariable: boolean = false;

    private readonly _myValueChangedEmitter: Emitter<[unknown, EasyTuneVariable]> = new Emitter();

    protected readonly _myEngine: Readonly<WonderlandEngine>;

    constructor(type: EasyTuneVariableType, name: string, onValueChangedEventListener?: (value: unknown, easyTuneVariable: EasyTuneVariable) => void, showOnWidget: boolean = true, extraParams: Readonly<EasyTuneVariableExtraParams> = new EasyTuneVariableExtraParams(), engine: Readonly<WonderlandEngine> = Globals.getMainEngine()!) {
        this._myType = type;

        this._myName = name;

        this._myShowOnWidget = showOnWidget;
        this._myAutoImportEnabled = extraParams.myAutoImportEnabled ?? EasyTuneUtils.getAutoImportEnabledDefaultValue(engine);
        this._myManualImportEnabled = extraParams.myManualImportEnabled ?? EasyTuneUtils.getManualImportEnabledDefaultValue(engine);
        this._myExportEnabled = extraParams.myExportEnabled ?? EasyTuneUtils.getExportEnabledDefaultValue(engine);

        this._myWidgetCurrentVariable = false;

        this._myValueChangedEmitter = new Emitter();      // Signature: listener(value, easyTuneVariables)

        this._myEngine = engine;

        if (onValueChangedEventListener != null) {
            this.registerValueChangedEventListener(this, onValueChangedEventListener);
        }
    }

    public getName(): string {
        return this._myName;
    }

    public setName(name: string): this {
        if (this._myName != name) {
            this._myName = name;
            EasyTuneUtils.refreshWidget(this._myEngine);
        }

        return this;
    }

    public getType(): EasyTuneVariableType {
        return this._myType;
    }

    public isWidgetCurrentVariable(): boolean {
        return this._myWidgetCurrentVariable;
    }

    public setWidgetCurrentVariable(widgetCurrentVariable: boolean): this {
        this._myWidgetCurrentVariable = widgetCurrentVariable;
        return this;
    }

    public getValue(): unknown {
        return this._myValue;
    }

    public setValue(value: unknown, resetDefaultValue: boolean = false): this {
        const valueChanged = this._myValue != value;

        this._myValue = value;

        if (resetDefaultValue) {
            this.setDefaultValue(value);
        }

        EasyTuneUtils.refreshWidget(this._myEngine);

        if (valueChanged) {
            this._notifyValueChanged();
        }

        return this;
    }

    public getDefaultValue(): unknown {
        return this._myDefaultValue;
    }

    public setDefaultValue(value: unknown): this {
        this._myDefaultValue = value;
        return this;
    }

    public isShownOnWidget(): boolean {
        return this._myShowOnWidget;
    }

    public setShowOnWidget(showOnWidget: boolean): this {
        this._myShowOnWidget = showOnWidget;
        return this;
    }

    public isManualImportEnabled(): boolean {
        return this._myManualImportEnabled;
    }

    public isAutoImportEnabled(): boolean {
        return this._myAutoImportEnabled;
    }

    public isExportEnabled(): boolean {
        return this._myExportEnabled;
    }

    public setManualImportEnabled(enabled: boolean): this {
        this._myManualImportEnabled = enabled;
        return this;
    }

    public setAutoImportEnabled(enabled: boolean): this {
        this._myAutoImportEnabled = enabled;
        return this;
    }

    public setExportEnabled(enabled: boolean): this {
        this._myExportEnabled = enabled;
        return this;
    }

    public setEasyTuneVariableExtraParams(extraParams: Readonly<EasyTuneVariableExtraParams>): this {
        this.setAutoImportEnabled(extraParams.myAutoImportEnabled ?? EasyTuneUtils.getAutoImportEnabledDefaultValue(this._myEngine));
        this.setManualImportEnabled(extraParams.myManualImportEnabled ?? EasyTuneUtils.getManualImportEnabledDefaultValue(this._myEngine));
        this.setExportEnabled(extraParams.myExportEnabled ?? EasyTuneUtils.getExportEnabledDefaultValue(this._myEngine));

        return this;
    }

    public fromJSON(valueJSON: string, resetDefaultValue: boolean = false): this {
        this.setValue(JSON.parse(valueJSON), resetDefaultValue);
        return this;
    }

    public toJSON(): string {
        return JSON.stringify(this.getValue());
    }

    public registerValueChangedEventListener(id: unknown, listener: (value: unknown, easyTuneVariable: EasyTuneVariable) => void): this {
        this._myValueChangedEmitter.add(listener, { id: id });
        return this;
    }

    public unregisterValueChangedEventListener(id: unknown): this {
        this._myValueChangedEmitter.remove(id);
        return this;
    }

    protected _notifyValueChanged(): void {
        this._myValueChangedEmitter.notify(this.getValue(), this);
    }
}

export abstract class EasyTuneVariableTyped<T> extends EasyTuneVariable {
    protected abstract override _myValue: T;
    protected abstract override _myDefaultValue: T;

    constructor(type: EasyTuneVariableType, name: string, onValueChangedEventListener?: (value: unknown, easyTuneVariable: EasyTuneVariable) => void, showOnWidget?: boolean, extraParams?: Readonly<EasyTuneVariableExtraParams>, engine?: Readonly<WonderlandEngine>) {
        super(type, name, onValueChangedEventListener, showOnWidget, extraParams, engine);
    }

    public override getValue(): T {
        return this.getValue();
    }

    public override setValue(value: T, resetDefaultValue?: boolean): this {
        return this.setValue(value, resetDefaultValue);
    }

    public override getDefaultValue(): T {
        return this.getDefaultValue();
    }

    public override setDefaultValue(value: T): this {
        return this.setDefaultValue(value);
    }

    public override registerValueChangedEventListener(id: unknown, listener: (value: T, easyTuneVariable: EasyTuneVariable) => void): this {
        return this.registerValueChangedEventListener(id, listener);
    }

    public override unregisterValueChangedEventListener(id: unknown): this {
        return this.unregisterValueChangedEventListener(id);
    }
}

export abstract class EasyTuneVariableArray<T> extends EasyTuneVariableTyped<T[]> {
    protected override _myValue!: T[];
    protected override _myDefaultValue!: T[];

    constructor(type: EasyTuneVariableType, name: string, value: T[], onValueChangedEventListener?: (value: unknown, easyTuneVariable: EasyTuneVariable) => void, showOnWidget?: boolean, extraParams?: Readonly<EasyTuneVariableExtraParams>, engine?: Readonly<WonderlandEngine>) {
        super(type, name, onValueChangedEventListener, showOnWidget, extraParams, engine);

        this.setValue(value, true);
    }

    public override setValue(value: T[], resetDefaultValue: boolean = false): this {
        const valueChanged = this._myValue != null && !this._myValue.pp_equals(value);

        if (this._myValue == null) {
            this._myValue = value.pp_clone();
        } else {
            this._myValue.pp_copy(value);
        }

        if (resetDefaultValue) {
            this.setDefaultValue(value);
        }

        EasyTuneUtils.refreshWidget(this._myEngine);

        if (valueChanged) {
            this._notifyValueChanged();
        }

        return this;
    }

    public override setDefaultValue(value: T[]): this {
        if (this._myDefaultValue == null) {
            this._myDefaultValue = value.pp_clone();
        } else {
            this._myDefaultValue.pp_copy(value);
        }

        return this;
    }
}


// NUMBER

export class EasyTuneNumberArray extends EasyTuneVariableArray<number> {

    private _myDecimalPlaces: number;
    private _myStepPerSecond: number;

    private _myDefaultStepPerSecond: number;

    private _myMin: number;
    private _myMax: number;

    private _myEditAllValuesTogether: boolean;

    constructor(name: string, value: number[], onValueChangedEventListener?: (value: unknown, easyTuneVariable: EasyTuneVariable) => void, showOnWidget?: boolean, decimalPlaces: number = 3, stepPerSecond: number = 1, min: number = -Number.MAX_VALUE, max: number = Number.MAX_VALUE, editAllValuesTogether: boolean = false, extraParams?: Readonly<EasyTuneVariableExtraParams>, engine?: Readonly<WonderlandEngine>) {
        super(EasyTuneVariableType.NUMBER, name, value, onValueChangedEventListener, showOnWidget, extraParams, engine);

        this._myDecimalPlaces = decimalPlaces;
        this._myStepPerSecond = stepPerSecond;

        this._myDefaultStepPerSecond = this._myStepPerSecond;

        this._myMin = min;
        this._myMax = max;

        this._myEditAllValuesTogether = editAllValuesTogether;

        this._clampValue(true);
    }

    public setMax(max: number): this {
        this._myMax = max;
        this._clampValue(false);
        return this;
    }

    public setMin(min: number): this {
        this._myMin = min;
        this._clampValue(false);
        return this;
    }

    public override toJSON(): string {
        return this.getValue().vec_toString();
    }

    private _clampValue(resetDefaultValue: boolean): void {
        const clampedValue = this._myValue.vec_clamp(this._myMin, this._myMax);

        if (!resetDefaultValue) {
            const clampedDefaultValue = this.getDefaultValue().vec_clamp(this._myMin, this._myMax);
            const defaultValueChanged = !clampedDefaultValue.vec_equals(this.getDefaultValue(), 0.00001);
            if (defaultValueChanged) {
                this.setDefaultValue(clampedDefaultValue);
            }
        }

        this.setValue(clampedValue, resetDefaultValue);
    }
}

export class EasyTuneNumber extends EasyTuneVariableTyped<number> {

    protected override _myValue!: number;
    protected override _myDefaultValue!: number;

    private _myDecimalPlaces: number;
    private _myStepPerSecond: number;

    private _myDefaultStepPerSecond: number;

    private _myMin: number;
    private _myMax: number;

    constructor(name: string, value: number, onValueChangedEventListener?: (value: unknown, easyTuneVariable: EasyTuneVariable) => void, showOnWidget?: boolean, decimalPlaces: number = 3, stepPerSecond: number = 1, min: number = -Number.MAX_VALUE, max: number = Number.MAX_VALUE, editAllValuesTogether: boolean = false, extraParams?: Readonly<EasyTuneVariableExtraParams>, engine?: Readonly<WonderlandEngine>) {
        super(EasyTuneVariableType.NUMBER, name, onValueChangedEventListener, showOnWidget, extraParams, engine);

        this.setValue(value, true);

        this._myDecimalPlaces = decimalPlaces;
        this._myStepPerSecond = stepPerSecond;

        this._myDefaultStepPerSecond = this._myStepPerSecond;

        this._myMin = min;
        this._myMax = max;

        this._clampValue(true);
    }

    public setMax(max: number): this {
        this._myMax = max;
        this._clampValue(false);
        return this;
    }

    public setMin(min: number): this {
        this._myMin = min;
        this._clampValue(false);
        return this;
    }

    public override toJSON(): string {
        return JSON.stringify(this.getValue());
    }

    private _clampValue(resetDefaultValue: boolean): void {
        const clampedValue = this._myValue.vec_clamp(this._myMin, this._myMax);

        if (!resetDefaultValue) {
            const clampedDefaultValue = this.getDefaultValue().vec_clamp(this._myMin, this._myMax);
            const defaultValueChanged = !clampedDefaultValue.vec_equals(this.getDefaultValue(), 0.00001);
            if (defaultValueChanged) {
                EasyTuneVariableArray.prototype.setDefaultValue.call(this, clampedDefaultValue);
            }
        }

        EasyTuneVariableArray.prototype.setValue.call(this, clampedValue, resetDefaultValue);
    }
}

export class EasyTuneInt extends EasyTuneNumber {

    constructor(name, value, onValueChangedEventListener, showOnWidget, stepPerSecond, min, max, extraParams, engine) {
        super(name, value, onValueChangedEventListener, showOnWidget, 0, stepPerSecond, min, max, extraParams, engine);
    }
}

export class EasyTuneIntArray extends EasyTuneNumberArray {

    constructor(name, value, onValueChangedEventListener, showOnWidget, stepPerSecond, min, max, editAllValuesTogether, extraParams, engine) {
        let roundedValue = value.pp_clone();

        for (let i = 0; i < value.length; i++) {
            roundedValue[i] = Math.round(roundedValue[i]);
        }

        super(name, roundedValue, onValueChangedEventListener, showOnWidget, 0, stepPerSecond, min != null ? Math.round(min) : null, max != null ? Math.round(max) : max, editAllValuesTogether, extraParams, engine);
    }
}

// BOOL

export class EasyTuneBoolArray extends EasyTuneVariableArray {

    constructor(name, value, onValueChangedEventListener, showOnWidget, extraParams, engine) {
        super(name, EasyTuneVariableType.BOOL, value, onValueChangedEventListener, showOnWidget, extraParams, engine);
    }
}

export class EasyTuneBool extends EasyTuneBoolArray {

    constructor(name, value, onValueChangedEventListener, showOnWidget, extraParams, engine) {
        super(name, [value], onValueChangedEventListener, showOnWidget, extraParams, engine);

        this._myTempValue = [0];
        this._myTempDefaultValue = [0];
    }

    getValue() {
        return super.getValue()[0];
    }

    setValue(value, resetDefaultValue = false) {
        this._myTempValue[0] = value;
        return super.setValue(this._myTempValue, resetDefaultValue);
    }

    getDefaultValue() {
        return super.getDefaultValue()[0];
    }

    setDefaultValue(value) {
        this._myTempDefaultValue[0] = value;
        return super.setDefaultValue(this._myTempValue);
    }
}

// EASY TUNE EASY TRANSFORM

export class EasyTuneTransform extends EasyTuneVariable {

    constructor(name, value, onValueChangedEventListener, showOnWidget, scaleAsOne = true, decimalPlaces = 3, positionStepPerSecond = 1, rotationStepPerSecond = 50, scaleStepPerSecond = 1, extraParams, engine) {
        super(name, EasyTuneVariableType.TRANSFORM, onValueChangedEventListener, showOnWidget, extraParams, engine);

        this._myDecimalPlaces = decimalPlaces;

        this._myPosition = value.mat4_getPosition();
        this._myRotation = value.mat4_getRotationDegrees();
        this._myScale = value.mat4_getScale();

        let decimalPlacesMultiplier = Math.pow(10, this._myDecimalPlaces);
        for (let i = 0; i < 3; i++) {
            this._myScale[i] = Math.max(this._myScale[i], 1 / decimalPlacesMultiplier);
        }

        this._myScaleAsOne = scaleAsOne;

        this._myPositionStepPerSecond = positionStepPerSecond;
        this._myRotationStepPerSecond = rotationStepPerSecond;
        this._myScaleStepPerSecond = scaleStepPerSecond;

        this._myDefaultPosition = this._myPosition.vec3_clone();
        this._myDefaultRotation = this._myRotation.vec3_clone();
        this._myDefaultScale = this._myScale.vec3_clone();

        this._myDefaultPositionStepPerSecond = this._myPositionStepPerSecond;
        this._myDefaultRotationStepPerSecond = this._myRotationStepPerSecond;
        this._myDefaultScaleStepPerSecond = this._myScaleStepPerSecond;

        this._myTransform = mat4_create();
        this._myTransform.mat4_setPositionRotationDegreesScale(this._myPosition, this._myRotation, this._myScale);

        this._myTempTransform = mat4_create();
    }

    getValue() {
        this._myTransform.mat4_setPositionRotationDegreesScale(this._myPosition, this._myRotation, this._myScale);
        return this._myTransform;
    }

    setValue(value, resetDefaultValue = false) {
        this._myTempTransform.mat4_setPositionRotationDegreesScale(this._myPosition, this._myRotation, this._myScale);

        value.mat4_getPosition(this._myPosition);
        value.mat4_getRotationDegrees(this._myRotation);
        value.mat4_getScale(this._myScale);

        this._myTransform.mat4_setPositionRotationDegreesScale(this._myPosition, this._myRotation, this._myScale);

        let valueChanged = !this._myTempTransform.pp_equals(this._myTransform);

        if (resetDefaultValue) {
            EasyTuneTransform.prototype.setDefaultValue.call(this, value);
        }

        EasyTuneUtils.refreshWidget(this._myEngine);

        if (valueChanged) {
            this._notifyValueChanged();
        }

        return this;
    }

    setDefaultValue(value) {
        this._myDefaultPosition = value.mat4_getPosition();
        this._myDefaultRotation = value.mat4_getRotationDegrees();
        this._myDefaultScale = value.mat4_getScale();

        return this;
    }

    toJSON() {
        return this.getValue().vec_toString();
    }
}