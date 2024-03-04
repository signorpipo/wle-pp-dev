import { Material, Mesh } from "@wonderlandengine/api";

export class DefaultResources {

    public myMeshes: DefaultResourcesMeshes;
    public myMaterials: DefaultResourcesMaterials;

    constructor() {
        this.myMeshes = new DefaultResourcesMeshes();
        this.myMaterials = new DefaultResourcesMaterials();
    }
}

export class DefaultResourcesMeshes {

    public myPlane: Mesh | null;
    public myCube: Mesh | null;
    public mySphere: Mesh | null;
    public myCone: Mesh | null;
    public myCylinder: Mesh | null;
    public myCircle: Mesh | null;

    public myInvertedCube: Mesh | null;
    public myInvertedSphere: Mesh | null;
    public myInvertedCone: Mesh | null;
    public myInvertedCylinder: Mesh | null;

    public myDoubleSidedPlane: Mesh | null;
    public myDoubleSidedCube: Mesh | null;
    public myDoubleSidedSphere: Mesh | null;
    public myDoubleSidedCone: Mesh | null;
    public myDoubleSidedCylinder: Mesh | null;
    public myDoubleSidedCircle: Mesh | null;

    constructor() {
        this.myPlane = null;
        this.myCube = null;
        this.mySphere = null;
        this.myCone = null;
        this.myCylinder = null;
        this.myCircle = null;

        this.myInvertedCube = null;
        this.myInvertedSphere = null;
        this.myInvertedCone = null;
        this.myInvertedCylinder = null;

        this.myDoubleSidedPlane = null;
        this.myDoubleSidedCube = null;
        this.myDoubleSidedSphere = null;
        this.myDoubleSidedCone = null;
        this.myDoubleSidedCylinder = null;
        this.myDoubleSidedCircle = null;
    }
}

export class DefaultResourcesMaterials {

    public myFlatOpaque: Material | null;
    public myFlatTransparentNoDepth: Material | null;
    public myPhongOpaque: Material | null;
    public myText: Material | null;

    constructor() {
        this.myFlatOpaque = null;
        this.myFlatTransparentNoDepth = null; // For now the pipeline needs to be the last one to make this work properly
        this.myPhongOpaque = null;
        this.myText = null;
    }
}