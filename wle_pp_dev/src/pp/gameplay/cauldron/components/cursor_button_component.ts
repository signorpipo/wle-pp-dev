import { Component, Material, MeshComponent, Object3D, TextComponent } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { Cursor, CursorTarget } from "@wonderlandengine/components";
import { Timer } from "wle-pp/cauldron/cauldron/timer.js";
import { Vector3, Vector4 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { ColorUtils } from "wle-pp/cauldron/utils/color_utils.js";
import { EasingFunction, MathUtils } from "wle-pp/cauldron/utils/math_utils.js";
import { FlatMaterial, PhongMaterial } from "wle-pp/cauldron/wl/type_definitions/material_type_definitions.js";
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

    @property.float(-0.1)
    private _myColorBrigthnessOffsetOnHover!: number;

    @property.float(0)
    private _myColorBrigthnessOffsetOnDown!: number;

    private readonly _myCursorTarget!: CursorTarget;

    private readonly _myOriginalScaleLocal: Vector3 = vec3_create();
    private readonly _myScaleChangeTimer: Timer = new Timer(0.25, false);
    private _myScaleStartValue: number = 1;
    private _myScaleTargetValue: number = 1;

    private _myColorBrightnessOffsetStartValue: number = 0;
    private _myColorBrightnessOffsetCurrentValue: number = 0;
    private _myColorBrightnessOffsetTargetValue: number = 0;
    private readonly _myColorBrightnessChangeTimer: Timer = new Timer(0.25, false);

    private _myFlatMaterialOriginalColors: [FlatMaterial, Vector4][] = [];
    private _myPhongMaterialOriginalColors: [PhongMaterial, Vector4][] = [];

    public override start(): void {
        (this._myCursorTarget as CursorTarget) = this.object.pp_getComponent(CursorTarget)!;

        this._myCursorTarget.onHover.add(this._onHover.bind(this));
        this._myCursorTarget.onUnhover.add(this._onUnhover.bind(this));
        this._myCursorTarget.onDown.add(this._onDown.bind(this));
        this._myCursorTarget.onUpWithDown.add(this.onUpWithDown.bind(this));

        this.object.pp_getScaleLocal(this._myOriginalScaleLocal);

        const meshComponents = this.object.pp_getComponents(MeshComponent);
        for (const meshComponent of meshComponents) {
            meshComponent.material = meshComponent.material?.clone();

            const phongMaterial = meshComponent.material as PhongMaterial;
            if (phongMaterial.diffuseColor != null) {
                this._myPhongMaterialOriginalColors.push([phongMaterial, phongMaterial.diffuseColor.vec4_clone()]);
            } else {
                const flatMaterial = meshComponent.material as FlatMaterial;
                if (flatMaterial.color != null) {
                    this._myFlatMaterialOriginalColors.push([flatMaterial, flatMaterial.color.vec4_clone()]);
                }
            }
        }

        const textComponents = this.object.pp_getComponents(TextComponent);
        for (const textComponent of textComponents) {
            textComponent.material = textComponent.material?.clone();

            const flatMaterial = textComponent.material as FlatMaterial;
            if (flatMaterial.color != null) {
                this._myFlatMaterialOriginalColors.push([flatMaterial, flatMaterial.color.vec4_clone()]);
            }
        }
    }

    private static readonly _updateSV =
        {
            buttonScale: vec3_create(),
        };
    public override update(dt: number): void {
        if (this._myScaleChangeTimer.isRunning()) {
            this._myScaleChangeTimer.update(dt);

            const currentScale = MathUtils.interpolate(this._myScaleStartValue, this._myScaleTargetValue, this._myScaleChangeTimer.getPercentage(), EasingFunction.easeInOut);
            const buttonScale = CursorButtonComponent._updateSV.buttonScale;
            this.object.pp_setScaleLocal((this._myOriginalScaleLocal as any).vec3_scale(currentScale, buttonScale));
        }

        if (this._myColorBrightnessChangeTimer.isRunning()) {
            this._myColorBrightnessChangeTimer.update(dt);

            this._myColorBrightnessOffsetCurrentValue = MathUtils.interpolate(this._myColorBrightnessOffsetStartValue, this._myColorBrightnessOffsetTargetValue, this._myColorBrightnessChangeTimer.getPercentage(), EasingFunction.easeInOut);

            for (const [material, originalColor] of this._myPhongMaterialOriginalColors) {
                const hsvColor = ColorUtils.rgbToHSV(originalColor);
                hsvColor[2] = MathUtils.clamp(hsvColor[2] + this._myColorBrightnessOffsetCurrentValue, 0, 1);
                material.diffuseColor = ColorUtils.hsvToRGB(hsvColor);
            }

            for (const [material, originalColor] of this._myFlatMaterialOriginalColors) {
                const hsvColor = ColorUtils.rgbToHSV(originalColor);
                hsvColor[2] = MathUtils.clamp(hsvColor[2] + this._myColorBrightnessOffsetCurrentValue, 0, 1);
                material.color = ColorUtils.hsvToRGB(hsvColor);
            }
        }
    }

    private _onHover(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0 || this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnHover;
            this._myScaleChangeTimer.start();
        }

        if (this._myPulseIntensityOnHover != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnHover, 0.085);
            }
        }

        if (this._myColorBrigthnessOffsetOnHover != 0 || this._myColorBrigthnessOffsetOnDown != 0) {
            this._myColorBrightnessOffsetStartValue = this._myColorBrightnessOffsetCurrentValue;
            this._myColorBrightnessOffsetTargetValue = this._myColorBrigthnessOffsetOnHover;
            this._myColorBrightnessChangeTimer.start();
        }
    }

    private _onUnhover(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0 || this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1;
            this._myScaleChangeTimer.start();
        }


        if (this._myColorBrigthnessOffsetOnHover != 0 || this._myColorBrigthnessOffsetOnDown != 0) {
            this._myColorBrightnessOffsetStartValue = this._myColorBrightnessOffsetCurrentValue;
            this._myColorBrightnessOffsetTargetValue = 0;
            this._myColorBrightnessChangeTimer.start();
        }
    }

    private _onDown(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0 || this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnDown;
            this._myScaleChangeTimer.start();
        }

        if (this._myPulseIntensityOnDown != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnDown, 0.085);
            }
        }

        if (this._myColorBrigthnessOffsetOnHover != 0 || this._myColorBrigthnessOffsetOnDown != 0) {
            this._myColorBrightnessOffsetStartValue = this._myColorBrightnessOffsetCurrentValue;
            this._myColorBrightnessOffsetTargetValue = this._myColorBrigthnessOffsetOnDown;
            this._myColorBrightnessChangeTimer.start();
        }
    }

    private onUpWithDown(objectHovered: Object3D, cursorComponent: Cursor): void {
        if (this._myScaleOffsetOnHover != 0 || this._myScaleOffsetOnDown != 0) {
            this._myScaleStartValue = this.object.pp_getScaleLocal()[0];
            this._myScaleTargetValue = 1 + this._myScaleOffsetOnHover;
            this._myScaleChangeTimer.start();
        }

        if (this._myPulseIntensityOnUp != 0) {
            const handedness = InputUtils.getHandednessByString(cursorComponent.handedness as string);
            if (handedness != null) {
                Globals.getGamepads()![handedness].pulse(this._myPulseIntensityOnUp, 0.085);
            }
        }

        if (this._myColorBrigthnessOffsetOnHover != 0 || this._myColorBrigthnessOffsetOnDown != 0) {
            this._myColorBrightnessOffsetStartValue = this._myColorBrightnessOffsetCurrentValue;
            this._myColorBrightnessOffsetTargetValue = this._myColorBrigthnessOffsetOnHover;
            this._myColorBrightnessChangeTimer.start();
        }
    }

}