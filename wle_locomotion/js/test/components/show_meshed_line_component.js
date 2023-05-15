import { Component } from "@wonderlandengine/api";
import { getDefaultResources } from "../../pp/pp/default_resources_globals";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { VisualLine, VisualLineParams } from "../../pp/cauldron/visual/elements/visual_line";
import { getVisualManager } from "../../pp/cauldron/visual/visual_globals";

export class ShowMeshedLineComponent extends Component {
    static TypeName = "show-meshed-line";
    static Properties = {};

    start() {
        let visualParams = new VisualLineParams();
        visualParams.myTransform = this.object.pp_getTransform();
        visualParams.myPosition = this.object.pp_getPosition();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myThickness = 0.02;
        visualParams.myRadius = 0.02;
        visualParams.myMaterial = getDefaultResources().myMaterials.myPhongOpaque.clone();
        visualParams.myMaterial.diffuseColor = vec4_create(0, 1, 0, 1);

        this._myVisualLine = new VisualLine(visualParams);
    }

    update(dt) {
        let visualParams = this._myVisualLine.getParams();
        visualParams.myTransform = this.object.pp_getTransform();
        visualParams.myPosition = this.object.pp_getPosition();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myRadius = 0.1;
        visualParams.myMesh = Math.pp_randomInt(0, 1) == 1 ? getDefaultResources().myMeshes.myCube : getDefaultResources().myMeshes.mySphere;
        visualParams.mySegmentMesh = Math.pp_randomInt(0, 10) == 1 ? getDefaultResources().myMeshes.myCube : getDefaultResources().myMeshes.mySphere;
        visualParams.myLineMesh = Math.pp_randomInt(0, 1) == 1 ? getDefaultResources().myMeshes.myCube : getDefaultResources().myMeshes.myCone;
        visualParams.myArrowMesh = Math.pp_randomInt(0, 1) == 1 ? getDefaultResources().myMeshes.myCube : getDefaultResources().myMeshes.myCone;

        //this._myVisualLine.paramsUpdated();
        getVisualManager().draw(visualParams);
    }
}