import { Component } from "@wonderlandengine/api";
import { MeshUtils } from "../../pp/cauldron/wl/utils/mesh_utils.js";
import { vec4_create } from "../../pp/plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../pp/pp/globals.js";

export class InvertedSphereComponent extends Component {
    static TypeName = "inverted-sphere";

    start() {
        this._myInvertedSphereObject = this.object.pp_addChild();

        let invertedSphere = MeshUtils.invert(Globals.getDefaultResources(this.engine).myMeshes.mySphere);

        let meshComponet = this._myInvertedSphereObject.pp_addComponent("mesh");
        meshComponet.mesh = invertedSphere;
        meshComponet.material = Globals.getDefaultResources(this.engine).myMaterials.myFlatOpaque;
        meshComponet.material.color = vec4_create(1, 0, 0, 1);

        this._myInvertedSphereObject.pp_setScale(0.2);
    }
}