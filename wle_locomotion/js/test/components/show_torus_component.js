import { Component } from "@wonderlandengine/api";
import { VisualTorusParams } from "../../pp/cauldron/visual/elements/visual_torus";
import { getVisualManager } from "../../pp/cauldron/visual/visual_globals";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { getDefaultResources } from "../../pp/pp/default_resources_globals";
import { getEasyTuneVariables } from "../../pp/tool/easy_tune/easy_tune_globals";
import { EasyTuneInt, EasyTuneNumber } from "../../pp/tool/easy_tune/easy_tune_variable_types";

export class ShowTorusComponent extends Component {
    static TypeName = "show-torus";
    static Properties = {};

    start() {
        getEasyTuneVariables().add(new EasyTuneNumber("Torus Radius", 0.25, 0.1, 3));
        getEasyTuneVariables().add(new EasyTuneInt("Torus Segments", 12, 1));
        getEasyTuneVariables().add(new EasyTuneNumber("Torus Thickness", 0.05, 0.1, 3));
        getEasyTuneVariables().add(new EasyTuneNumber("Torus Extra Length Multiplier", 1, 0.1, 3));

        this._myMaterial = getDefaultResources().myMaterials.myPhongOpaque.clone();
        this._myMaterial.diffuseColor = vec4_create(1, 0.5, 0.5, 1);
    }

    update(dt) {
        let visualParams = new VisualTorusParams();
        visualParams.myRadius = getEasyTuneVariables().get("Torus Radius");
        visualParams.mySegmentsAmount = getEasyTuneVariables().get("Torus Segments");
        visualParams.mySegmentThickness = getEasyTuneVariables().get("Torus Thickness");
        visualParams.myMaterial = this._myMaterial;
        visualParams.myParent = this.object;
        visualParams.myIsLocal = true;
        getVisualManager().draw(visualParams, 0);
    }
}