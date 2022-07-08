//#TODO creare raycast data

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
                (raycastSetup.myPhysXComponentsToIgnore.length == 0 ||
                    !raycastSetup.myPhysXComponentsToIgnore.pp_has(physX => internalRaycastResult.objects[i].pp_equals(physX.object)));

            isHitValid = isHitValid &&
                (!raycastSetup.myIgnoreHitsInsideCollision ||
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