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

        this._myUnusedHits = null;
    }

    isColliding(ignoreHitsInsideCollision = false) {
        return ignoreHitsInsideCollision ? this.getHitsOutsideCollision().length > 0 : this.myHits.length > 0;
    }

    getHitsInsideCollision() {
        let hits = [];

        for (let hit of this.myHits) {
            if (hit.isHitInsideCollision(this.myRaycastSetup)) {
                hits.push(hit);
            }
        }

        return hits;
    }

    getHitsOutsideCollision() {
        let hits = [];

        for (let hit of this.myHits) {
            if (!hit.isHitInsideCollision(this.myRaycastSetup)) {
                hits.push(hit);
            }
        }

        return hits;
    }
};

PP.RaycastResultHit = class RaycastResultHit {
    constructor() {
        this.myPosition = [0, 0, 0];
        this.myNormal = [0, 0, 0];
        this.myDistance = 0;
        this.myObject = null;
    }

    isValid() {
        return this.myObject != null;
    }

    isHitInsideCollision(raycastSetup) {
        let isHitInsideCollision = raycastSetup.myOrigin.pp_equals(this.myPosition) && raycastSetup.myDirection.vec3_angle(this.myNormal) == 180;
        return isHitInsideCollision;
    }

    copy(hit) {
        this.myPosition.vec3_copy(hit.myPosition);
        this.myNormal.vec3_copy(hit.myNormal);
        this.myDistance = hit.myDistance;
        this.myObject = hit.myObject;
    }

    reset() {
        this.myPosition.vec3_zero();
        this.myNormal.vec3_zero();
        this.myDistance = 0;
        this.myObject = null;
    }
};