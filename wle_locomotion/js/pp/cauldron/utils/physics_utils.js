//#TODO creare raycast data

PP.PhysicsLayerFlags = class PhysicsLayerFlags {
    constructor() {
        this._myLayerMask = 0;
    }

    setFlagActive(indexOrName, active) {
        let index = indexOrName;
        if (isNaN(indexOrName)) {
            index = PP.PhysicsUtils.getLayerFlagNames().pp_findIndexEqual(indexOrName);
        }

        if (index >= 0 && index < PP.PhysicsUtils.getLayerFlagAmount()) {
            let mask = 1 << index;

            if (active) {
                this._myLayerMask = this._myLayerMask | mask;
            } else {
                this._myLayerMask = this._myLayerMask & ~mask;
            }
        }
    }

    isFlagActive(indexOrName) {
        let index = indexOrName;
        if (isNaN(indexOrName)) {
            index = PP.PhysicsUtils.getLayerFlagNames().pp_findIndexEqual(indexOrName);
        }

        let isActive = false;

        if (index >= 0 && index < PP.PhysicsUtils.getLayerFlagAmount()) {
            let mask = 1 << index;
            isActive = !!(this._myLayerMask & mask);
        }

        return isActive;
    }

    getMask() {
        return this._myLayerMask;
    }

    setMask(layerMask) {
        this._myLayerMask = layerMask;
    }
};

PP.RaycastSetup = class RaycastSetup {
    constructor() {
        this.myOrigin = [0, 0, 0];
        this.myDirection = [0, 0, 0];
        this.myDistance = 0;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myPhysXsToIgnore = [];
        this.myIgnoreHitsFromInside = false;
    }
};

PP.RaycastResult = class RaycastResult {
    constructor() {
        this.myRaycastSetup = null;
        this.myHits = [];

        this._myUnusedHits = [];
    }
};

PP.RaycastResultHit = class RaycastResultHit {
    constructor() {
        this.myPosition = [0, 0, 0];
        this.myNormal = [0, 0, 0];
        this.myDistance = 0;
        this.myObject = null;
    }
};

PP.PhysicsUtils = {
    _myLayerFlagAmount: 8,
    _myLayerFlagNames: ["0", "1", "2", "3", "4", "5", "6", "7"],
    setLayerFlagAmount: function (layerFlagAmount) {
        PP.PhysicsUtils._myLayerFlagAmount = layerFlagAmount;
    },
    setLayerFlagNames: function (layerFlagNames) {
        PP.PhysicsUtils._myLayerFlagNames = layerFlagNames;
    },
    getLayerFlagAmount: function () {
        return PP.PhysicsUtils._myLayerFlagAmount;
    },
    getLayerFlagNames: function () {
        return PP.PhysicsUtils._myLayerFlagNames;
    },
    raycast(raycastSetup, raycastResult = new PP.RaycastResult()) {
        let internalRaycastResult = WL.physics.rayCast(raycastSetup.myOrigin, raycastSetup.myDirection, raycastSetup.myBlockLayerFlags.getMask(), raycastSetup.myDistance);

        raycastResult.myRaycastSetup = raycastSetup;

        if (raycastResult.myHits.length > 0) {
            raycastResult._myUnusedHits.push(...raycastResult.myHits);
            raycastResult.myHits = [];

            //#TODO RIUSARE HIT SENZA SPOSTARLO SE POSSIBILE
        }

        for (let i = 0; i < internalRaycastResult.hitCount; i++) {
            let isHitValid = true;

            isHitValid = isHitValid &&
                (raycastSetup.myPhysXsToIgnore.length == 0 ||
                    !raycastSetup.myPhysXsToIgnore.pp_has(element => internalRaycastResult.objects[i].pp_equals(element)));

            isHitValid = isHitValid &&
                (!raycastSetup.myIgnoreHitsFromInside ||
                    (!raycastSetup.myOrigin.pp_equals(internalRaycastResult.locations[i]) || raycastSetup.myDirection.vec3_angle(internalRaycastResult.normals[i]) != 180));


            if (isHitValid) {
                let hit = null;

                if (raycastResult._myUnusedHits.length > 0) {
                    hit = raycastResult._myUnusedHits.pop();
                } else {
                    hit = new PP.RaycastResultHit();
                }

                hit.myPosition.vec3_copy(internalRaycastResult.locations[i]);
                hit.myNormal.vec3_copy(internalRaycastResult.normals[i]);
                hit.myDistance = internalRaycastResult.distances[i];
                hit.myObject = internalRaycastResult.objects[i];

                raycastResult.myHits.push(hit);
            }
        }

        return raycastResult;
    }
};