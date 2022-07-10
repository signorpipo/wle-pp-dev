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

        let currentFreeHitIndex = 0;
        let validHitCount = 0;

        for (let i = 0; i < internalRaycastResult.hitCount; i++) {
            let isHitValid = true;

            isHitValid = isHitValid &&
                (raycastSetup.myPhysXComponentsToIgnore.length == 0 ||
                    !raycastSetup.myPhysXComponentsToIgnore.pp_has(physX => internalRaycastResult.objects[i].pp_equals(physX.object)));

            let isHitInsideCollision = isHitValid &&
                (raycastSetup.myOrigin.pp_equals(internalRaycastResult.locations[i]) &&
                    raycastSetup.myDirection.vec3_angle(internalRaycastResult.normals[i]) == 180);

            isHitValid = isHitValid && (!raycastSetup.myIgnoreHitsInsideCollision || !isHitInsideCollision);

            if (isHitValid) {
                let hit = null;
                let reusedFromHits = false;

                if (currentFreeHitIndex < raycastResult.myHits.length) {
                    hit = raycastResult.myHits[currentFreeHitIndex];
                    reusedFromHits = true;
                    currentFreeHitIndex++;
                } else if (raycastResult._myUnusedHits != null && raycastResult._myUnusedHits.length > 0) {
                    hit = raycastResult._myUnusedHits.pop();
                } else {
                    hit = new PP.RaycastResultHit();
                }

                hit.myPosition.vec3_copy(internalRaycastResult.locations[i]);
                hit.myNormal.vec3_copy(internalRaycastResult.normals[i]);
                hit.myDistance = internalRaycastResult.distances[i];
                hit.myObject = internalRaycastResult.objects[i];
                hit.myIsInsideCollision = isHitInsideCollision;

                if (!reusedFromHits) {
                    raycastResult.myHits.push(hit);
                }

                validHitCount++;
            }
        }

        if (raycastResult.myHits.length > validHitCount) {
            if (raycastResult._myUnusedHits == null) {
                raycastResult._myUnusedHits = [];
            }

            for (let i = 0; i < raycastResult.myHits.length - validHitCount; i++) {
                raycastResult._myUnusedHits.push(raycastResult.myHits.pop());
            }
        }

        return raycastResult;
    }
};