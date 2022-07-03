CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.4;
        this.myDistanceFromGroundToIgnore = 0.2;

        this.myFeetRadius = 0.1;
        this.myGroundCheckUpOffset = 0.3;
        this.myGroundCheckDistance = 0.3;
        this.myGroundRaycastAmount = 8;

        this.myConeAngle = 120;
        this.myConeSliceAmount = 4;
    }
};

CollisionCheck = class CollisionCheck {
    constructor() {
        //config like radius, distance to snap, check cone angle...
        //floor group, wall group

        this._myCollisionCheckParams = new CollisionCheckParams();

        this._myDebugActive = true;
    }

    fixMovement(movement) {
        if (movement.vec3_length() == 0) {
            return movement;
        }

        let player = PP.myPlayerObjects.myPlayer;
        let head = PP.myPlayerObjects.myHead;

        let feetPosition = this._getFeetPosition(player, head);

        let fixedMovement = this._movementFix(feetPosition.pp_clone(), movement, player);

        if (fixedMovement.vec3_length() > 0) {
            // cone check to see if u can fit the new position
            let newFeetPosition = feetPosition.vec3_add(fixedMovement);
            let fixedFeetPosition = this._groundFix(newFeetPosition, fixedMovement.vec3_normalize(), player);
            if (!this._positionCheck(fixedFeetPosition, fixedMovement.vec3_normalize(), player)) {
                fixedMovement.vec3_scale(0, fixedMovement);
            } else {
                fixedFeetPosition.vec3_sub(feetPosition, fixedMovement);
            }
        }

        return fixedMovement;
    }

    _movementFix(feetPosition, movement, player) {
        // flat movement has to be performable as a whole (the position check will fail anyway)
        // up movement can be checked and just reduced if it hits before, so that it performs just what is able to
        // in the end this could be done for the whole movement anyway

        let movementDirection = movement.vec3_normalize();
        let playerUp = player.pp_getUp();
        let movementRight = movement.vec3_cross(playerUp).vec3_normalize();
        let movementUp = movementRight.vec3_cross(movementDirection).vec3_normalize();

        let offsetPositionToCheck = feetPosition.vec3_add(playerUp.vec3_scale(this._myCollisionCheckParams.myDistanceFromGroundToIgnore));

        let minMovementLength = movement.vec3_length();
        let sliceAngle = this._myCollisionCheckParams.myConeAngle / this._myCollisionCheckParams.myConeSliceAmount;
        let startAngle = -this._myCollisionCheckParams.myConeAngle / 2;
        for (let i = 0; i < this._myCollisionCheckParams.myConeSliceAmount + 1; i++) {
            let currentAngle = startAngle + i * sliceAngle;

            let coneRelativePosition = movementDirection.
                vec3_rotateAxis(-currentAngle, movementUp).vec3_scale(this._myCollisionCheckParams.myRadius * 1.25);

            let origin = offsetPositionToCheck.vec3_add(coneRelativePosition.vec3_componentAlongAxis(movementRight));
            let direction = movementDirection;
            let distance = movement.vec3_length();
            let raycastResult = WL.physics.rayCast(origin, direction, 255, distance);

            if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now

                let hitPoint = raycastResult.locations[0];
                let movementToHit = hitPoint.vec3_sub(origin);

                if (movementToHit.vec3_length() > 0.0001) {
                    if (movementToHit.vec3_length() < minMovementLength) {
                        minMovementLength = movementToHit.vec3_length();
                    }
                } else {
                    minMovementLength = 0;
                    break;
                }
            }

            if (this._myDebugActive) {
                let debugParams = new PP.DebugRaycastParams();
                debugParams.myOrigin = origin;
                debugParams.myDirection = direction;
                debugParams.myDistance = distance;
                debugParams.myNormalLength = 0.2;
                debugParams.myThickness = 0.005;
                debugParams.myRaycastResult = raycastResult;
                PP.myDebugManager.draw(debugParams, 0);
            }
        }

        return movement.vec3_normalize().vec3_scale(minMovementLength);
    }

    _groundFix(feetPosition, movementDirection, player) {
        let fixedFeedPosition = feetPosition.pp_clone();

        let playerUp = player.pp_getUp();

        let maxHeight = null;

        //radial check
        let sliceAngle = 360 / this._myCollisionCheckParams.myGroundRaycastAmount;
        let startAngle = 0;
        for (let i = -1; i < this._myCollisionCheckParams.myGroundRaycastAmount; i++) {
            let origin = feetPosition.pp_clone();
            if (i >= 0) {
                let currentAngle = startAngle + i * sliceAngle;
                origin.vec3_add(movementDirection.vec3_rotateAxis(-currentAngle, playerUp).vec3_scale(this._myCollisionCheckParams.myFeetRadius), origin);
            }

            let end = origin.vec3_add(playerUp.vec3_scale(-this._myCollisionCheckParams.myGroundCheckDistance));
            origin.vec3_add(playerUp.vec3_scale(this._myCollisionCheckParams.myGroundCheckUpOffset), origin);
            let direction = end.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);
            let radialRaycastResult = WL.physics.rayCast(origin, direction, 255, distance);

            if (this._myDebugActive) {
                let debugParams = new PP.DebugRaycastParams();
                debugParams.myOrigin = origin;
                debugParams.myDirection = direction;
                debugParams.myDistance = distance;
                debugParams.myNormalLength = 0.2;
                debugParams.myThickness = 0.005;
                debugParams.myRaycastResult = radialRaycastResult;
                PP.myDebugManager.draw(debugParams, 0);
            }

            if (radialRaycastResult.hitCount > 0) {
                let hitPosition = radialRaycastResult.locations[0];
                let hitHeight = hitPosition.vec3_componentAlongAxis(playerUp);
                if (maxHeight == null || hitHeight.vec3_isFurtherAlongAxis(maxHeight, playerUp)) {
                    maxHeight = hitHeight;
                }
            }
        }

        if (maxHeight != null) {
            // always snap up, but snap down only if is already on ground and the movement is not upward
            // if the movement is down ward and it was not on the ground already, just let it fall
            fixedFeedPosition.vec3_removeComponentAlongAxis(playerUp, fixedFeedPosition);
            fixedFeedPosition.vec3_add(maxHeight, fixedFeedPosition);
        }

        return fixedFeedPosition;
    }

    _positionCheck(positionToCheck, movementDirection, player) {
        let positionIsOk = true;

        let playerUp = player.pp_getUp();
        let flatMovementDirection = movementDirection.vec3_removeComponentAlongAxis(playerUp);
        let offsetPositionToCheck = positionToCheck.vec3_add(playerUp.vec3_scale(this._myCollisionCheckParams.myDistanceFromGroundToIgnore));

        //radial check
        let sliceAngle = this._myCollisionCheckParams.myConeAngle / this._myCollisionCheckParams.myConeSliceAmount;
        let startAngle = -this._myCollisionCheckParams.myConeAngle / 2;
        let previousEnd = null;
        for (let i = 0; i < this._myCollisionCheckParams.myConeSliceAmount + 1; i++) {
            let currentAngle = startAngle + i * sliceAngle;

            let origin = offsetPositionToCheck;
            let direction = flatMovementDirection.vec3_rotateAxis(-currentAngle, playerUp);
            let distance = this._myCollisionCheckParams.myRadius;
            let radialRaycastResult = WL.physics.rayCast(origin, direction, 255, distance);

            if (this._myDebugActive) {
                let debugParams = new PP.DebugRaycastParams();
                debugParams.myOrigin = origin;
                debugParams.myDirection = direction;
                debugParams.myDistance = distance;
                debugParams.myNormalLength = 0.2;
                debugParams.myThickness = 0.005;
                debugParams.myRaycastResult = radialRaycastResult;
                PP.myDebugManager.draw(debugParams, 0);
            }

            if (radialRaycastResult.hitCount > 0) {
                positionIsOk = false;
                break;
            }

            let currentEnd = origin.vec3_add(direction.vec3_scale(distance));
            if (previousEnd != null) {
                let origin = previousEnd;
                let direction = currentEnd.vec3_sub(previousEnd);
                let distance = direction.vec3_length();
                direction.vec3_normalize(direction);
                let edgeRaycastResult = WL.physics.rayCast(origin, direction, 255, distance);

                if (this._myDebugActive) {
                    let debugParams = new PP.DebugRaycastParams();
                    debugParams.myOrigin = origin;
                    debugParams.myDirection = direction;
                    debugParams.myDistance = distance;
                    debugParams.myNormalLength = 0.2;
                    debugParams.myThickness = 0.005;
                    debugParams.myRaycastResult = edgeRaycastResult;
                    PP.myDebugManager.draw(debugParams, 0);
                }

                if (edgeRaycastResult.hitCount > 0) {
                    positionIsOk = false;
                    break;
                }
            }

            previousEnd = currentEnd;
        }

        return positionIsOk;
    }

    _getFeetPosition(player, head) {
        let playerUp = player.pp_getUp();
        let headPosition = head.pp_getPosition();
        let flatHeadPosition = headPosition.vec3_removeComponentAlongAxis(playerUp);

        let playerPosition = player.pp_getPosition();
        let feetPosition = flatHeadPosition.vec3_add(playerPosition.vec3_componentAlongAxis(playerUp));

        return feetPosition;
    }

    _isRaycastResultInsideWall(raycastOrigin, raycastDirection, raycastResult) {
        let hitOnOrigin = raycastOrigin.pp_equals(raycastResult.locations[0]);
        let normalOppositeDirection = raycastDirection.vec3_negate().vec3_normalize().pp_equals(raycastResult.normals[0]);

        return hitOnOrigin && normalOppositeDirection;
    }
};