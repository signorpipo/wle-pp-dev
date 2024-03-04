import { Object3D } from "@wonderlandengine/api";

export class SceneObjects {

    public myScene: Object3D | null;

    public myCauldron: Object3D | null;
    public myDynamics: Object3D | null;
    public myParticles: Object3D | null;
    public myVisualElements: Object3D | null;
    public myTools: Object3D | null;

    public myPlayerObjects: PlayerObjects;

    constructor() {
        this.myScene = null;

        this.myCauldron = null;
        this.myDynamics = null;
        this.myParticles = null;
        this.myVisualElements = null;
        this.myTools = null;

        this.myPlayerObjects = new PlayerObjects();
    }
}

export class PlayerObjects {

    public myPlayer: Object3D | null;

    public myCauldron: Object3D | null;
    public myReferenceSpace: Object3D | null;

    public myCameraNonXR: Object3D | null;

    public myEyes = [];
    public myEyeLeft: Object3D | null;
    public myEyeRight: Object3D | null;

    public myHands = [];
    public myHandLeft: Object3D | null;
    public myHandRight: Object3D | null;

    public myHead: Object3D | null;
    public myHeadDebugs: Object3D | null;

    constructor() {
        this.myPlayer = null;

        this.myCauldron = null;
        this.myReferenceSpace = null;

        this.myCameraNonXR = null;

        this.myEyes = [];
        this.myEyeLeft = null;
        this.myEyeRight = null;

        this.myHands = [];
        this.myHandLeft = null;
        this.myHandRight = null;

        this.myHead = null;
        this.myHeadDebugs = null;
    }
}