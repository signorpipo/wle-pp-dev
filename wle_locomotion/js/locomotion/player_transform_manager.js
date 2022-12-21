PlayerTransformManagerParams = class PlayerTransformManagerParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myHeadRadius = 0;
        this.myHeadCollisionCheckComplexityLevel = 0; // 1,2,3

        // this.myDistanceToStartApplyGravityWhenLeaning = 0; // this should be moved outisde, that is, if it is leaning stop gravity
    }
};

// update this before to check the new valid transform and if the head new trnsform is fine, then update movements, so that they will use the proper transform

PlayerTransformManager = class PlayerTransformManager {
    constructor(params) {
        this._myParams = params;
        this._myHeadCollisionCheckParams = new CollisionCheckParams();

        this._myFeetTransformMatrix = PP.mat4_create();
        this._myFeetTransformQuat = PP.quat2_create();

        this._myIsBodyColliding = false;
        this._myIsHeadColliding = false;
        this._myIsLeaning = false;
    }

    start() {

    }

    update(dt) {
        // check if new head is ok and update the data
    }

    getResults() {
        return this._myResults;
    }

    resetRealFeetToValid() {

    }

    resetValidFeetToReal() {

    }

    move(movement) {

    }

    teleport(position) {

    }

    getPlayer() {
        return this._myParams.myPlayerHeadManager.getPlayer();
    }

    getCurrentHead() {
        return this._myParams.myPlayerHeadManager.getCurrentHead();
    }

    getHeadHeight() {
        return this._myParams.myPlayerHeadManager.getHeadHeight();
    }

    canRotateVertically() {
        return this._myParams.myPlayerHeadManager.canRotateVertically();
    }

    getFeetTransformQuat(outFeetTransformQuat = PP.quat2_create()) {
    }

    getFeetPosition(outFeetPosition = PP.vec3_create()) {
    }

    isBodyColliding() {
        return this._myIsBodyColliding;
    }

    isHeadColliding() {
        return this._myIsHeadColliding;
    }

    isLeaning() {
        return this._myIsLeaning;
    }

    getDistanceToRealFeet() {

    }

    getDistanceToRealHead() { // should be like get distance to last valid head position

    }

    getPlayerHeadManager() {
        this._myParams.myPlayerHeadManager;
    }
};