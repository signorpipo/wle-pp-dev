import { Component } from "@wonderlandengine/api";
import { VisualTorusParams } from "../../pp/cauldron/visual/elements/visual_torus.js";
import { vec4_create } from "../../pp/plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../pp/pp/globals.js";
import { EasyTuneInt, EasyTuneNumber } from "../../pp/tool/easy_tune/easy_tune_variable_types.js";

export class ShowTorusComponent extends Component {
    static TypeName = "show-torus";

    start() {
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Radius", 0.25, null, true, 3, 0.1, undefined, undefined, undefined, this.engine));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneInt("Torus Segments", 12, null, true, 1, undefined, undefined, undefined, this.engine));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Thickness", 0.05, null, true, 3, 0.1, undefined, undefined, undefined, this.engine));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Torus Extra Length Multiplier", 1, null, true, 3, 0.1, undefined, undefined, undefined, this.engine));

        this._myMaterial = Globals.getDefaultResources(this.engine).myMaterials.myPhongOpaque.clone();
        this._myMaterial.diffuseColor = vec4_create(1, 0.5, 0.5, 1);
    }

    update(dt) {
        let visualParams = new VisualTorusParams(this.engine);
        visualParams.myRadius = Globals.getEasyTuneVariables(this.engine).get("Torus Radius");
        visualParams.mySegmentsAmount = Globals.getEasyTuneVariables(this.engine).get("Torus Segments");
        visualParams.mySegmentThickness = Globals.getEasyTuneVariables(this.engine).get("Torus Thickness");
        visualParams.myMaterial = this._myMaterial;
        visualParams.myParent = this.object;
        visualParams.myIsLocal = true;
        Globals.getVisualManager(this.engine).draw(visualParams, 0);
    }
}