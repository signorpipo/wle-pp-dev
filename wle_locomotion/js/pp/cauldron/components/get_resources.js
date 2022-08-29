WL.registerComponent('pp-get-resources', {
    _myPlane: { type: WL.Type.Mesh },
    _myCube: { type: WL.Type.Mesh },
    _mySphere: { type: WL.Type.Mesh },
    _myCone: { type: WL.Type.Mesh },
    _myCylinder: { type: WL.Type.Mesh },
    _myCircle: { type: WL.Type.Mesh },

    _myFlatOpaque: { type: WL.Type.Material },
    _myPhongOpaque: { type: WL.Type.Material },
    _myText: { type: WL.Type.Material },

}, {
    init() {
        PP.myResources.myMeshes.myPlane = PP.MeshUtils.cloneMesh(this._myPlane);
        PP.myResources.myMeshes.myCube = PP.MeshUtils.cloneMesh(this._myCube);
        PP.myResources.myMeshes.mySphere = PP.MeshUtils.cloneMesh(this._mySphere);
        PP.myResources.myMeshes.myCone = PP.MeshUtils.cloneMesh(this._myCone);
        PP.myResources.myMeshes.myCylinder = PP.MeshUtils.cloneMesh(this._myCylinder);
        PP.myResources.myMeshes.myCircle = PP.MeshUtils.cloneMesh(this._myCircle);

        PP.myResources.myMaterials.myFlatOpaque = this._myFlatOpaque.clone();
        PP.myResources.myMaterials.myPhongOpaque = this._myPhongOpaque.clone();
        PP.myResources.myMaterials.myText = this._myText.clone();
    }
});

PP.myResources = {
    myMeshes: {
        myPlane: null,
        myCube: null,
        mySphere: null,
        myCone: null,
        myCylinder: null,
        myCircle: null
    },
    myMaterials: {
        myFlatOpaque: null,
        myPhongOpaque: null,
        myText: null
    }
};