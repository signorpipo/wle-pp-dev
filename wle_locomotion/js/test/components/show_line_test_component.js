import { Component } from "@wonderlandengine/api";
import { VisualLineParams } from "../../pp/cauldron/visual/elements/visual_line";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { Globals } from "../../pp/pp/globals";

export class ShowLineTestComponent extends Component {
    static TypeName = "show-line-test";
    static Properties = {};

    update(dt) {
        let visualParams = new VisualLineParams();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myMaterial = Globals.getDefaultResources(this.engine).myMaterials.myFlatOpaque.clone();
        visualParams.myMaterial.color = vec4_create(0, 0, 1, 1);
        Globals.getDebugVisualManager(this.engine).draw(visualParams);
    }
}