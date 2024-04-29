import { Component, Object3D } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { Cursor, CursorTarget } from "@wonderlandengine/components";
import { Timer } from "wle-pp/cauldron/cauldron/timer.js";
import { Vector3 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { EasingFunction, MathUtils } from "wle-pp/cauldron/utils/math_utils.js";
import { InputUtils } from "wle-pp/input/cauldron/input_utils.js";
import { vec3_create } from "wle-pp/plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "wle-pp/pp/globals.js";

export class CursorButtonComponent extends Component {
    public static override TypeName = "pp-cursor-button";

    @property.float(0.075)
    private _myScaleOffsetOnHover!: number;

    @property.float(-0.075)
    private _myScaleOffsetOnDown!: number;

    @property.float(0.1)
    private _myPulseIntensityOnHover!: number;

    @property.float(0)
    private _myPulseIntensityOnDown!: number;

    @property.float(0.1)
    private _myPulseIntensityOnUp!: number;

    private readonly _myCursorTarget!: CursorTarget;

    private readonly _myOriginalScaleLocal: Vector3 = vec3_create();
    private readonly _myScaleDurationTimer: Timer = new Timer(0.25, false);
    private _myScaleStartValue: number = 1;
    private _myScaleTargetValue: number = 1;

    public override start(): void {
        (this._myCursorTarget as CursorTarget) = this.object.pp_getComponent(CursorTarget)!;

        this._myCursorTarget.onHover.add(this._onHover.bind(this));
        this._myCursorTarget.onUnhover.add(this._onUnhover.bind(this));
        this._myCursorTarget.onDown.add(this._onDown.bind(this));
        this._myCursorTarget.onUpWithDown.add(this.onUpWithDown.bind(this));

        this.object.pp_getScaleLocal(this._myOriginalScaleLocal);
    }

    private static readonly _updateSV =
        {
            buttonScale: vec3_create(),
        };
    public override update(dt: number): void {
        if (this._myScaleDurationTimer.isRunning()) {
            this._myScaleDurationTimer.update(dt);

            const currentScale = MathUtils.interpolate(this._myScaleStartValue, this._myScaleTargetValue, this._myScaleDurationTimer.getPercentage(), EasingFunction.easeInOut);
            const buttonScale = CursorButtonComponent._updateSV.buttonScale;
            this.object.pp_setScaleLocal((this._myOriginalScaleLocal as any).vec3_scale(currentScale, buttonScale));
        }
    }

    private _onHover(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnHover;
            this._myScaleDurationTimer.start();
        }

        if (this._myPulseIntensityOnHover != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnHover, 0.085);
            }
        }
    }

    private _onUnhover(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0 || this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1;
            this._myScaleDurationTimer.start();
        }
    }

    private _onDown(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnDown;
            this._myScaleDurationTimer.start();
        }

        if (this._myPulseIntensityOnDown != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnDown, 0.085);
            }
        }
    }

    private onUpWithDown(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnHover;
            this._myScaleDurationTimer.start();
        }

        if (this._myPulseIntensityOnUp != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnUp, 0.085);
            }
        }
    }

}