import { Component } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { CursorTarget } from "@wonderlandengine/components";
import { Timer } from "wle-pp/cauldron/cauldron/timer.js";
import { Vector3 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { EasingFunction, MathUtils } from "wle-pp/cauldron/utils/math_utils.js";
import { vec3_create } from "wle-pp/plugin/js/extensions/array/vec_create_extension.js";

export class CursorButtonComponent extends Component {
    public static override TypeName = "pp-cursor-button";

    @property.bool(true)
    private _myScaleOnInteract!: boolean;

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

    private _onHover(): void {
        if (this._myScaleOnInteract) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1.075;
            this._myScaleDurationTimer.start();
        }
    }

    private _onUnhover(): void {
        if (this._myScaleOnInteract) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1;
            this._myScaleDurationTimer.start();
        }
    }

    private _onDown(): void {
        if (this._myScaleOnInteract) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 0.925;
            this._myScaleDurationTimer.start();
        }
    }

    private onUpWithDown(): void {
        if (this._myScaleOnInteract) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1.075;
            this._myScaleDurationTimer.start();
        }
    }

}