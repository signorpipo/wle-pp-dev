import { Object3D, WonderlandEngine } from "@wonderlandengine/api";
import { Globals } from "wle-pp/pp/globals.js";
import { VisualElementType } from "./visual_element_types.js";

export interface VisualElementParams {
    myType: VisualElementType;

    /** If not specified it will default to `Globals.getSceneObjects().myVisualElements` */
    myParent: Object3D;

    copy(other: Readonly<VisualElementParams>): void;
    clone(): VisualElementParams;
}

export abstract class AbstractVisualElementParams<T extends AbstractVisualElementParams<T>> implements VisualElementParams {
    public abstract myType: VisualElementType;

    public myParent: Object3D;

    constructor(engine: Readonly<WonderlandEngine> = Globals.getMainEngine()!) {
        this.myParent = Globals.getSceneObjects(engine)!.myVisualElements!;
    }

    public copy(other: Readonly<VisualElementParams>): void {
        if (other.myType != this.myType) return;

        this.myParent = other.myParent;

        this._copyHook(other as Readonly<T>);
    }

    public clone(): T {
        const clonedParams = this._new();
        clonedParams.copy(this as unknown as T);
        return clonedParams;
    }

    protected abstract _copyHook(other: Readonly<T>): void;
    protected abstract _new(): T;
}

export interface VisualElement {
    update(dt: number): void;

    setVisible(visible: boolean): void;

    refresh(): void;
    forceRefresh(): void;
    setAutoRefresh(autoRefresh: boolean): void;

    getParams(): VisualElementParams;
    setParams(params: VisualElementParams): void;
    paramsUpdated(): void;
    copyParams(params: VisualElementParams): void
}

export abstract class AbstractVisualElement<VisualElementType extends AbstractVisualElement<VisualElementType, VisualElementParamsType>, VisualElementParamsType extends AbstractVisualElementParams<VisualElementParamsType>> implements VisualElement {

    protected _myParams: VisualElementParamsType;

    protected _myVisible: boolean = false;
    protected _myAutoRefresh: boolean = true;

    protected _myDirty: boolean = false;

    protected _myDestroyed: boolean = false;

    constructor(params: VisualElementParamsType) {
        this._myParams = params;
    }

    public update(dt: number): void {
        if (this._myDirty) {
            this._refresh();

            this._myDirty = false;
        }
    }

    public setVisible(visible: boolean): void {
        if (this._myVisible != visible) {
            this._myVisible = visible;

            this._visibleChanged();
        }
    }

    public refresh(): void {
        this.update(0);
    }

    public forceRefresh(): void {
        this._refresh();
    }

    public setAutoRefresh(autoRefresh: boolean): void {
        this._myAutoRefresh = autoRefresh;
    }

    public getParams(): VisualElementParamsType {
        return this._myParams;
    }

    public setParams(params: VisualElementParams): void {
        if (params.myType != this._myParams.myType) return;

        this._myParams = params as VisualElementParamsType;
        this._markDirty();
    }

    public paramsUpdated(): void {
        this._markDirty();
    }

    public copyParams(params: VisualElementParams): void {
        if (params.myType != this._myParams.myType) return;

        this._myParams.copy(params);
        this._markDirty();
    }

    private _markDirty(): void {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    public clone(): VisualElementType {
        const clonedParams = this._myParams.clone();

        const clone = this._new(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }

    protected _prepare(): void {
        this._build();
        this.forceRefresh();

        this.setVisible(true);
    }

    protected _updateHook(dt: number): void { }

    protected _visibleChanged(): void { }

    protected abstract _build(): void;
    protected abstract _refresh(): void;
    protected _forceRefreshHook(dt: number): void { }

    protected abstract _new(params: VisualElementParamsType): VisualElementType;

    protected _destroyHook(): void { }

    public destroy(): void {
        this._myDestroyed = true;

        this._destroyHook();
    }

    public isDestroyed(): boolean {
        return this._myDestroyed;
    }
}