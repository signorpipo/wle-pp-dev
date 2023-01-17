
PP.CharacterCollisionResults = class CharacterCollisionResults {
    constructor() {
        this.myGroundSurfaceInfo = new PP.CharacterCollisionSurfaceInfo();
        this.myCeilingSurfaceInfo = new PP.CharacterCollisionSurfaceInfo();

        this.internalParams();
    }

    internalParams() {

    }

    reset() {

        this.myGroundSurfaceInfo.reset();
        this.myCeilingSurfaceInfo.reset();
    }

    copy(other) {
        this.myGroundSurfaceInfo.copy(other.myGroundSurfaceInfo);
        this.myCeilingSurfaceInfo.copy(other.myCeilingSurfaceInfo);
    }
};

PP.CharacterCollisionSurfaceInfo = class CharacterCollisionSurfaceInfo {
    constructor() {
        this.myIsOnSurface = false;
        this.mySurfaceAngle = 0;
        this.mySurfacePerceivedAngle = 0;
        this.mySurfaceNormal = PP.vec3_create();
    }

    reset() {
        this.myIsOnSurface = false;
        this.mySurfaceAngle = 0;
        this.mySurfacePerceivedAngle = 0;
        this.mySurfaceNormal.vec3_zero();
    }

    copy(other) {
        this.myIsOnSurface = other.myIsOnSurface;
        this.mySurfaceAngle = other.mySurfaceAngle;
        this.mySurfacePerceivedAngle = other.mySurfacePerceivedAngle;
        this.mySurfaceNormal.vec3_copy(other.mySurfaceNormal);
    }
};