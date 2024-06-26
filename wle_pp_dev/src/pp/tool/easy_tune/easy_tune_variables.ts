import { EasyTuneVariable } from "./easy_tune_variable_types.js";

export class EasyTuneVariables {

    private readonly _myVariables: Map<string, EasyTuneVariable> = new Map();

    public add(variable: EasyTuneVariable, overwriteCurrentOne = false): void {
        if (overwriteCurrentOne || !this._myVariables.has(variable.getName())) {
            this._myVariables.set(variable.getName(), variable);
        }
    }

    public remove(variableName: string): void {
        this._myVariables.delete(variableName);
    }

    public get(variableName: string) {
        const variable = this._myVariables.get(variableName);
        if (variable != null) {
            return variable.getValue();
        }

        return null;
    }

    public set(variableName: string, value, resetDefaultValue: boolean = false): void {
        const variable = this._myVariables.get(variableName);
        if (variable != null) {
            variable.setValue(value, resetDefaultValue);
        }
    }

    public has(variableName: string): boolean {
        return this._myVariables.has(variableName);
    }

    public length(): number {
        return this._myVariables.size;
    }

    public isWidgetCurrentVariable(variableName: string): boolean {
        const variable = this._myVariables.get(variableName);
        if (variable != null) {
            return variable.isWidgetCurrentVariable();
        }

        return false;
    }

    public getEasyTuneVariable(variableName: string): EasyTuneVariable | null {
        return this._myVariables.get(variableName) ?? null;
    }

    public getEasyTuneVariablesList(): EasyTuneVariable[] {
        return Array.from(this._myVariables.values());
    }

    public getEasyTuneVariablesNames(): string[] {
        return Array.from(this._myVariables.keys());
    }

    public changeEasyTuneVariableName(oldName: string, newName: string): void {
        const variable = this._myVariables.get(oldName);
        if (variable != null) {
            this._myVariables.delete(oldName);
            this._myVariables.set(newName, variable);
            variable.setName(newName);
        }
    }

    public fromJSON(json: string, resetDefaultValue: boolean = false, manualImport: boolean = false): void {
        const objectJSON = JSON.parse(json);

        for (const variable of this._myVariables.values()) {
            if ((variable.isManualImportEnabled() && manualImport) || (variable.isAutoImportEnabled() && !manualImport)) {
                const variableName = variable.getName();
                if (Object.hasOwn(objectJSON, variableName)) {
                    const variableValueJSON = objectJSON[variableName];
                    variable.fromJSON(variableValueJSON, resetDefaultValue);
                }
            }
        }
    }

    public toJSON(): string {
        const objectJSON: Record<string, string> = {};

        for (const variable of this._myVariables.values()) {
            if (variable.isExportEnabled()) {
                objectJSON[variable.getName()] = variable.toJSON();
            }
        }

        return JSON.stringify(objectJSON);
    }

    public registerValueChangedEventListener(variableName: string, id: unknown, callback: (value, easyTuneVariable: EasyTuneVariable) => void): void {
        this._myVariables.get(variableName)!.registerValueChangedEventListener(id, callback);
    }

    public unregisterValueChangedEventListener(variableName: string, id: unknown): void {
        this._myVariables.get(variableName)!.unregisterValueChangedEventListener(id);
    }
}