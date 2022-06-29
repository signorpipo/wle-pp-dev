CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.4;
        this.myDistanceFromGroundToIgnore = 0.01;

        this.myConeAngle = 90;
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

        if (this._myDebugActive && false) {
            let debugParams = new PP.DebugPointParams();
            debugParams.myPosition = feetPosition;
            debugParams.myRadius = 0.05;
            PP.myDebugManager.draw(debugParams);
        }

        let movementDirection = movement.vec3_normalize();

        let origin = feetPosition;
        let direction = movementDirection;
        direction.vec3_normalize(direction);
        let distance = this._myCollisionCheckParams.myRadius + movement.vec3_length();
        let raycastResult = WL.physics.rayCast(origin, direction, 255, distance);

        let fixedMovement = movement.pp_clone();
        if (raycastResult.hitCount > 0) {
            if (this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                // for now ignore what happens when u ended up inside a wall
                // you could possible check if the movement will get u outside the collision, but maybe it's just better to let u move with your head
                // besides this will probably trigger the "hide environment" thing
                // it would be interesting to see what other games do about this, but it should be ok to just wait for the player to move again in a proper space
                // since the idea is that u have entered a collision just because u moved into it yourself, while this system prevents it

            }

            let hitPoint = raycastResult.locations[0];
            let movementToHit = hitPoint.vec3_sub(feetPosition);

            let safeDistance = 0.001;
            let distanceBeforeCollision = movementToHit.vec3_length() - this._myCollisionCheckParams.myRadius - safeDistance;
            if (distanceBeforeCollision > 0) {
                fixedMovement.vec3_normalize(fixedMovement);
                fixedMovement.vec3_scale(distanceBeforeCollision, fixedMovement);
                console.error(fixedMovement.vec3_length().toFixed(4));
            } else {
                fixedMovement.vec3_scale(0, fixedMovement);
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

        /* if (this._myDebugActive) {
            let debugParams = new PP.DebugLineParams();
            debugParams.myStart = feetPosition.vec3_add([0, 0.01, 0]);
            debugParams.myDirection = fixedMovement.vec3_normalize();
            debugParams.myLength = fixedMovement.vec3_length();
            PP.myDebugManager.draw(debugParams, 0);
        } */

        // cone check to see if u can fit the new position
        let newFeetPosition = feetPosition.vec3_add(fixedMovement);
        this.positionCheck(newFeetPosition, fixedMovement);

        return fixedMovement;
    }

    _positionCheck(positionToCheck, movementDirection) {

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