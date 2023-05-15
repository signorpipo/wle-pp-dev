import { Component } from "@wonderlandengine/api";
import { VisualLineParams } from "../../pp/cauldron/visual/elements/visual_line";
import { getDebugVisualManager } from "../../pp/debug/debug_globals";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { getDefaultResources } from "../../pp/pp/default_resources_globals";

export class ShowLineTestComponent extends Component {
    static TypeName = "show-line-test";
    static Properties = {};

    update(dt) {
        let visualParams = new VisualLineParams();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myMaterial = getDefaultResources().myMaterials.myFlatOpaque.clone();
        visualParams.myMaterial.color = vec4_create(0, 0, 1, 1);
        getDebugVisualManager().draw(visualParams);
    }
}