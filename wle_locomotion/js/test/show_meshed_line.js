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
        visualParams.myMaterial.diffuseColor = PP.vec4_create(0, 1, 0, 1);

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
        visualParams.myLineMesh = Math.pp_randomInt(0, 1) == 1 ? PP.myDefaultResources.myMeshes.myCube : PP.myDefaultResources.myMeshes.myCone;
        visualParams.myArrowMesh = Math.pp_randomInt(0, 1) == 1 ? PP.myDefaultResources.myMeshes.myCube : PP.myDefaultResources.myMeshes.myCone;

        //this._myVisualLine.paramsUpdated();
        PP.myVisualManager.draw(visualParams);
    }
});

VisualElementCustomParams = class VisualElementCustomParams extends PP.VisualLineParams {
    constructor() {
        super();
        this.myStart = PP.vec3_create();
        this.myDirection = PP.vec3_create(0, 0, 1);
        this.myLength = 0;

        this.myThickness = 0.005;

        this.myMesh = null;         // the mesh is scaled along up axis, null means it will default on PP.myDefaultResources.myMeshes.myCylinder

        this.myMaterial = null;     // null means it will default on PP.myDefaultResources.myMaterials.myFlatOpaque
        this.myColor = null;        // if this is set and material is null, it will use the default flat opaque material with this color

        this.myParent = null;       // if this is set the parent will not be the visual root anymore, the positions will be local to this object

        this.myType = 20;
    }
};