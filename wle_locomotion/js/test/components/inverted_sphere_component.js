import { Component } from "@wonderlandengine/api";
import { MeshUtils } from "../../pp/cauldron/utils/mesh_utils";
import { vec4_create } from "../../pp/plugin/js/extensions/array_extension";
import { getDefaultResources } from "../../pp/pp/default_resources_globals";

export class InvertedSphereComponent extends Component {
    static TypeName = "inverted-sphere";
    static Properties = {};

    start() {
        this._myInvertedSphereObject = this.object.pp_addObject();

        let invertedSphere = MeshUtils.invert(getDefaultResources().myMeshes.mySphere);

        let meshComponet = this._myInvertedSphereObject.pp_addComponent("mesh");
        meshComponet.mesh = invertedSphere;
        meshComponet.material = getDefaultResources().myMaterials.myFlatOpaque;
        meshComponet.material.color = vec4_create(1, 0, 0, 1);

        this._myInvertedSphereObject.pp_setScale(0.2);
    }
}