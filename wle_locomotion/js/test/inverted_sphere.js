WL.registerComponent('inverted-sphere', {
}, {
    init: function () {

    },
    start: function () {
        this._myInvertedSphereObject = this.object.pp_addObject();

        let invertedSphere = PP.MeshUtils.invertMesh(PP.myDefaultResources.myMeshes.mySphere);

        let meshComponet = this._myInvertedSphereObject.pp_addComponent("mesh");
        meshComponet.mesh = invertedSphere;
        meshComponet.material = PP.myDefaultResources.myMaterials.myFlatOpaque;
        meshComponet.material.color = [1, 0, 0, 1];

        this._myInvertedSphereObject.pp_setScale(0.2);
    },
    update: function (dt) {
    },
});