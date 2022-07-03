CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.4;
        this.myDistanceFromGroundToIgnore = 0.2;

        this.myHorizontalMovementRadialSliceAmount = 1;

        this.myFeetRadius = 0.1;
        this.myGroundCheckUpOffset = 0.3;
        this.myGroundCheckDistance = 0.3;
        this.myGroundRaycastAmount = 8;

        this.myConeAngle = 120;
        this.myConeSliceAmount = 4;

        this.myCheckHeight = true;
        this.myHeightCheckStepAmount = 1;
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

        let up = PP.myPlayerObjects.myPlayer.pp_getUp();
        let feetPosition = this._getPlayerFeetPosition();
        let height = this._getPlayerHeight();

        feetPosition = feetPosition.vec3_add(movement.vec3_normalize().vec3_scale(0.5));
        height = height / 2;

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(up);
        let verticalMovement = movement.vec3_componentAlongAxis(up);
        horizontalMovement.vec3_scale(1, horizontalMovement);
        let fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, up);

        /*
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
        */

        return fixedHorizontalMovement;
    }

    _horizontalCheck(movement, feetPosition, height, up) {
        let fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(this._myCollisionCheckParams.myDistanceFromGroundToIgnore));
        let fixedHeight = Math.max(0, height - this._myCollisionCheckParams.myDistanceFromGroundToIgnore);
        let canMove = this._horizontalMovementCheck(movement, fixedFeetPosition, fixedHeight, up);

        if (canMove) {
            return movement;
        }

        return [0, 0, 0];
    }

    _horizontalMovementCheck(movement, feetPosition, height, up) {
        let coneAngle = Math.min(this._myCollisionCheckParams.myConeAngle, 180);
        let movementDirection = movement.vec3_normalize();

        let checkPositions = [];

        let steplength = this._myCollisionCheckParams.myRadius / this._myCollisionCheckParams.myHorizontalMovementRadialSliceAmount;

        // left
        {
            let radialDirection = movementDirection.vec3_rotateAxis(coneAngle / 2, up);
            for (let i = 0; i < this._myCollisionCheckParams.myHorizontalMovementRadialSliceAmount; i++) {
                let currentStep = this._myCollisionCheckParams.myRadius - i * steplength;
                let currentRadialPosition = radialDirection.vec3_scale(currentStep);
                let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                checkPositions.push(currentCheckPosition);
            }
        }

        checkPositions.push(feetPosition);

        // right
        {
            let radialDirection = movementDirection.vec3_rotateAxis(-coneAngle / 2, up);
            for (let i = 1; i <= this._myCollisionCheckParams.myHorizontalMovementRadialSliceAmount; i++) {
                let currentStep = i * steplength;
                let currentRadialPosition = radialDirection.vec3_scale(currentStep);
                let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                checkPositions.push(currentCheckPosition);
            }
        }


        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        if (this._myCollisionCheckParams.myCheckHeight) {
            heightStepAmount = this._myCollisionCheckParams.myHeightCheckStepAmount;
        }

        let heightStep = up.vec3_scale(height / this._myCollisionCheckParams.myHeightCheckStepAmount);
        for (let i = 0; i <= heightStepAmount; i++) {
            let currentHeightOffset = heightStep.vec3_scale(i);
            for (let j = 0; j < checkPositions.length - 1; j++) {
                let firstPosition = checkPositions[j].vec3_add(currentHeightOffset);
                let secondPosition = checkPositions[j + 1].vec3_add(currentHeightOffset);

                if (j >= (checkPositions.length - 1) / 2) {
                    let temp = firstPosition;
                    firstPosition = secondPosition;
                    secondPosition = temp;
                }

                {
                    let firstMovementPosition = firstPosition.vec3_add(movement);

                    let origin = secondPosition;
                    let direction = firstMovementPosition.vec3_sub(secondPosition);
                    let distance = direction.vec3_length();
                    direction.vec3_normalize(direction);
                    let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                    if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                        // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                        isHorizontalCheckOk = false;
                        break;
                    }
                }

                {
                    let secondMovementPosition = secondPosition.vec3_add(movement);

                    let origin = firstPosition;
                    let direction = secondMovementPosition.vec3_sub(firstPosition);

                    if (!direction.vec3_isConcordant(movementDirection)) {
                        direction.vec3_negate(direction);
                        origin = secondMovementPosition;
                    }

                    let distance = direction.vec3_length();
                    direction.vec3_normalize(direction);
                    let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                    if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                        // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                        isHorizontalCheckOk = false;
                        break;
                    }
                }

                // check height
                if (i > 0) {
                    {
                        let firstMovementPosition = firstPosition.vec3_add(movement);
                        let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                        let origin = secondHeightPosition;
                        let direction = firstMovementPosition.vec3_sub(secondHeightPosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);
                        let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                        if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                            // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    {
                        let secondMovementPosition = secondPosition.vec3_add(movement);
                        let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                        let origin = firstHeightPosition;
                        let direction = secondMovementPosition.vec3_sub(firstHeightPosition);

                        if (!direction.vec3_isConcordant(movementDirection)) {
                            direction.vec3_negate(direction);
                            origin = secondMovementPosition;
                        }

                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);
                        let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                        if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                            // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                            isHorizontalCheckOk = false;
                            break;
                        }
                    }
                }
            }

            if (!isHorizontalCheckOk) {
                break;
            }
        }

        return isHorizontalCheckOk;
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

    _getPlayerFeetPosition() {
        let player = PP.myPlayerObjects.myPlayer;
        let head = PP.myPlayerObjects.myHead;

        let playerUp = player.pp_getUp();
        let headPosition = head.pp_getPosition();
        let flatHeadPosition = headPosition.vec3_removeComponentAlongAxis(playerUp);

        let playerPosition = player.pp_getPosition();
        let feetPosition = flatHeadPosition.vec3_add(playerPosition.vec3_componentAlongAxis(playerUp));

        return feetPosition;
    }

    _getPlayerHeight() {
        let player = PP.myPlayerObjects.myPlayer;
        let head = PP.myPlayerObjects.myHead;

        let playerUp = player.pp_getUp();
        let headPosition = head.pp_getPosition();
        let flatHeadPosition = headPosition.vec3_removeComponentAlongAxis(playerUp);

        let playerPosition = player.pp_getPosition();
        let feetPosition = flatHeadPosition.vec3_add(playerPosition.vec3_componentAlongAxis(playerUp));

        let height = headPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(playerUp).vec3_length();

        return height;
    }

    _isRaycastResultValid(raycastResult, raycastOrigin, raycastDirection) {
        return raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(raycastOrigin, raycastDirection, raycastResult);
    }

    _isRaycastResultInsideWall(raycastOrigin, raycastDirection, raycastResult) {
        let hitOnOrigin = raycastOrigin.pp_equals(raycastResult.locations[0]);
        let normalOppositeDirection = raycastDirection.vec3_negate().vec3_normalize().pp_equals(raycastResult.normals[0]);

        return hitOnOrigin && normalOppositeDirection;
    }

    _raycastAndDebug(origin, direction, group, distance) {
        let raycastResult = WL.physics.rayCast(origin, direction, group, distance);

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

        return raycastResult;
    }
};