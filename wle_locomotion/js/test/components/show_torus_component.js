import { Component } from "@wonderlandengine/api";
import { VisualTorusParams } from "../../pp/cauldron/visual/elements/visual_torus";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { Globals } from "../../pp/pp/globals";
import { EasyTuneInt, EasyTuneNumber } from "../../pp/tool/easy_tune/easy_tune_variable_types";

export class ShowTorusComponent extends Component {
    static TypeName = "show-torus";
    static Properties = {};

    start() {
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Radius", 0.25, 0.1, 3));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneInt("Torus Segments", 12, 1));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Thickness", 0.05, 0.1, 3));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Extra Length Multiplier", 1, 0.1, 3));

        this._myMaterial = Globals.getDefaultResources(this.engine).myMaterials.myPhongOpaque.clone();
        this._myMaterial.diffuseColor = vec4_create(1, 0.5, 0.5, 1);
    }

    update(dt) {
        let visualParams = new VisualTorusParams();
        visualParams.myRadius = Globals.getEasyTuneVariables(this.engine).get("Torus Radius");
        visualParams.mySegmentsAmount = Globals.getEasyTuneVariables(this.engine).get("Torus Segments");
        visualParams.mySegmentThickness = Globals.getEasyTuneVariables(this.engine).get("Torus Thickness");
        visualParams.myMaterial = this._myMaterial;
        visualParams.myParent = this.object;
        visualParams.myIsLocal = true;
        Globals.getVisualManager(this.engine).draw(visualParams, 0);
    }
}