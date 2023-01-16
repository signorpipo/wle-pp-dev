PP.PhysicsUtils = {
    _myLayerFlagsAmount: 8,
    _myLayerFlagsNames: ["0", "1", "2", "3", "4", "5", "6", "7"],
    setLayerFlagsAmount: function (layerFlagsAmount) {
        PP.PhysicsUtils._myLayerFlagsAmount = layerFlagsAmount;
    },
    setLayerFlagsNames: function (layerFlagsNames) {
        PP.PhysicsUtils._myLayerFlagsNames = layerFlagsNames;
    },
    getLayerFlagsAmount: function () {
        return PP.PhysicsUtils._myLayerFlagsAmount;
    },
    getLayerFlagsNames: function () {
        return PP.PhysicsUtils._myLayerFlagsNames;
    },
    raycast: function () {
        let objectsEqualCallback = (first, second) => first.pp_equals(second);
        return function raycast(raycastSetup, raycastResults = new PP.RaycastResults()) {
            let internalRaycastResults = WL.physics.rayCast(raycastSetup.myOrigin, raycastSetup.myDirection, raycastSetup.myBlockLayerFlags.getMask(), raycastSetup.myDistance);

            raycastResults.myRaycastSetup = raycastSetup;

            let currentValidHitIndex = 0;
            let validHitsCount = 0;

            for (let i = 0; i < internalRaycastResults.hitCount; i++) {
                let isHitValid = true;

                isHitValid = isHitValid &&
                    (raycastSetup.myObjectsToIgnore.length == 0 ||
                        !raycastSetup.myObjectsToIgnore.pp_hasEqual(internalRaycastResults.objects[i], objectsEqualCallback));

                let isHitInsideCollision = isHitValid &&
                    internalRaycastResults.distances[i] == 0 &&
                    (raycastSetup.myOrigin.vec3_distance(internalRaycastResults.locations[i]) < 0.00001 &&
                        Math.abs(raycastSetup.myDirection.vec3_angle(internalRaycastResults.normals[i]) - 180) < 0.00001);

                isHitValid = isHitValid && (!raycastSetup.myIgnoreHitsInsideCollision || !isHitInsideCollision);

                if (isHitValid) {
                    let hit = null;

                    if (currentValidHitIndex < raycastResults.myHits.length) {
                        hit = raycastResults.myHits[currentValidHitIndex];
                    } else if (raycastResults._myUnusedHits != null && raycastResults._myUnusedHits.length > 0) {
                        hit = raycastResults._myUnusedHits.pop();
                        raycastResults.myHits.push(hit);
                    } else {
                        hit = new PP.RaycastHit();
                        raycastResults.myHits.push(hit);
                    }

                    hit.myPosition.vec3_copy(internalRaycastResults.locations[i]);
                    hit.myNormal.vec3_copy(internalRaycastResults.normals[i]);
                    hit.myDistance = internalRaycastResults.distances[i];
                    hit.myObject = internalRaycastResults.objects[i];
                    hit.myIsInsideCollision = isHitInsideCollision;

                    validHitsCount++;
                    currentValidHitIndex++;
                }
            }

            if (raycastResults.myHits.length > validHitsCount) {
                if (raycastResults._myUnusedHits == null) {
                    raycastResults._myUnusedHits = [];
                }

                let hitsToRemove = raycastResults.myHits.length - validHitsCount;
                for (let i = 0; i < hitsToRemove; i++) {
                    raycastResults._myUnusedHits.push(raycastResults.myHits.pop());
                }
            }

            return raycastResults;
        };
    }()
};