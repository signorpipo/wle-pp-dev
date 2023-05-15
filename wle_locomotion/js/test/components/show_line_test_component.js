import { Component, Type } from "@wonderlandengine/api";

export class ShowLineTestComponent extends Component {
    static TypeName = "show-line-test";
    static Properties = {};

    update(dt) {
        let visualParams = new PP.VisualLineParams();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
        visualParams.myMaterial.color = PP.vec4_create(0, 0, 1, 1);
        PP.myDebugVisualManager.draw(visualParams);
    }
}