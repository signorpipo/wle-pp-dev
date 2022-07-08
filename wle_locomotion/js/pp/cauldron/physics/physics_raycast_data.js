PP.RaycastSetup = class RaycastSetup {
    constructor() {
        this.myOrigin = [0, 0, 0];
        this.myDirection = [0, 0, 0];
        this.myDistance = 0;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myPhysXComponentsToIgnore = [];
        this.myIgnoreHitsInsideCollision = false;
    }
};

PP.RaycastResult = class RaycastResult {
    constructor() {
        this.myRaycastSetup = null;
        this.myHits = [];

        this._myUnusedHits = [];
    }

    areHitsInsideCollision() {
        let areHitsInsideCollision = this.myHits.length > 0;

        for (let hit of this.myHits) {
            if (!hit.isHitInsideCollision(this.myRaycastSetup)) {
                areHitsInsideCollision = false;
                break;
            }
        }

        return areHitsInsideCollision;
    }
};

PP.RaycastResultHit = class RaycastResultHit {
    constructor() {
        this.myPosition = [0, 0, 0];
        this.myNormal = [0, 0, 0];
        this.myDistance = 0;
        this.myObject = null;
    }

    isHitInsideCollision(raycastSetup) {
        let isHitInsideCollision = raycastSetup.myOrigin.pp_equals(this.myPosition) && raycastSetup.myDirection.vec3_angle(this.myNormal) == 180;
        return isHitInsideCollision;
    }
};