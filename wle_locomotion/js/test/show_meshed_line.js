WL.registerComponent('show-meshed-line', {
}, {
    init: function () {
    },
    start() {
        let visualParams = new PP.VisualLineParams();
        visualParams.myTransform = this.object.pp_getTransform();
        visualParams.myPosition = this.object.pp_getPosition();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myThickness = 0.02;
        visualParams.myRadius = 0.02;
        visualParams.myMaterial = PP.myDefaultResources.myMaterials.myPhongOpaque.clone();
        visualParams.myMaterial.diffuseColor = [0, 1, 0, 1];

        this._myVisualLine = new PP.VisualLine(visualParams);
    },
    update(dt) {
        let visualParams = this._myVisualLine.getParams();
        visualParams.myTransform = this.object.pp_getTransform();
        visualParams.myPosition = this.object.pp_getPosition();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myRadius = 0.1;
        visualParams.myMesh = Math.pp_randomInt(0, 1) == 1 ? PP.myDefaultResources.myMeshes.myCube : PP.myDefaultResources.myMeshes.mySphere;
        visualParams.mySegmentMesh = Math.pp_randomInt(0, 10) == 1 ? PP.myDefaultResources.myMeshes.myCube : PP.myDefaultResources.myMeshes.mySphere;
        visualParams.myArrowMesh = Math.pp_randomInt(1, 1) == 1 ? PP.myDefaultResources.myMeshes.myCube : PP.myDefaultResources.myMeshes.myCone;

        this._myVisualLine.paramsUpdated();
    }
});