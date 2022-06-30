CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.4;
        this.myDistanceFromGroundToIgnore = 0.01;

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

        // feet height is on the player up position
        // the height is defined by the distance between player and head on player up


        // compute feet position of the head

        // check if is ok straight from current and new feet + radius, otherwise get the hit position and see if there is the chance of moving less
        // on new feet check if there is enough space in the cone toward the movement direction

        // if is ok, move

        //later snap to the ground

        let feetPosition = this._getFeetPosition(player, head);

        let fixedMovement = [0, 0, 0];

        if (this._movementCheck(feetPosition, movement)) {
            // cone check to see if u can fit the new position
            let newFeetPosition = feetPosition.vec3_add(movement);
            if (!this._positionCheck(newFeetPosition, movement.vec3_normalize(), player)) {
                fixedMovement.vec3_scale(0, fixedMovement);
            } else {
                fixedMovement = movement;
            }
        }

        return fixedMovement;
    }

    _movementCheck(feetPosition, movement) {
        let isMovementOk = true;

        let origin = feetPosition;
        let direction = movement.vec3_normalize();
        direction.vec3_normalize(direction);
        let distance = /*this._myCollisionCheckParams.myRadius + */movement.vec3_length();
        let raycastResult = WL.physics.rayCast(origin, direction, 255, distance);

        //let fixedMovement = movement.pp_clone();

        if (raycastResult.hitCount > 0) {
            if (this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                // for now ignore what happens when u ended up inside a wall
                // you could possible check if the movement will get u outside the collision, but maybe it's just better to let u move with your head
                // besides this will probably trigger the "hide environment" thing
                // it would be interesting to see what other games do about this, but it should be ok to just wait for the player to move again in a proper space
                // since the idea is that u have entered a collision just because u moved into it yourself, while this system prevents it

            }

            /*
            let hitPoint = raycastResult.locations[0];
            let movementToHit = hitPoint.vec3_sub(feetPosition);

            let safeDistance = 0.001;
            let distanceBeforeCollision = movementToHit.vec3_length() - this._myCollisionCheckParams.myRadius - safeDistance;
            if (distanceBeforeCollision > 0) {
                fixedMovement.vec3_normalize(fixedMovement);
                fixedMovement.vec3_scale(distanceBeforeCollision, fixedMovement);
            } else {
                fixedMovement.vec3_scale(0, fixedMovement);
            }*/

            isMovementOk = false;
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

        return isMovementOk;
    }

    _positionCheck(positionToCheck, movementDirection, player) {
        let positionIsOk = true;

        let sliceAngle = this._myCollisionCheckParams.myConeAngle / this._myCollisionCheckParams.myConeSliceAmount;

        //radial check
        let playerUp = player.pp_getUp();
        let startAngle = -this._myCollisionCheckParams.myConeAngle / 2;
        let previousEnd = null;
        for (let i = 0; i < this._myCollisionCheckParams.myConeSliceAmount + 1; i++) {
            let currentAngle = startAngle + i * sliceAngle;

            let origin = positionToCheck;
            let direction = movementDirection.vec3_rotateAxis(-currentAngle, playerUp);
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

        feetPosition.vec3_add(playerUp.vec3_scale(this._myCollisionCheckParams.myDistanceFromGroundToIgnore), feetPosition);

        return feetPosition;
    }

    _isRaycastResultInsideWall(raycastOrigin, raycastDirection, raycastResult) {
        let hitOnOrigin = raycastOrigin.pp_equals(raycastResult.locations[0]);
        let normalOppositeDirection = raycastDirection.vec3_negate().vec3_normalize().pp_equals(raycastResult.normals[0]);

        return hitOnOrigin && normalOppositeDirection;
    }
};