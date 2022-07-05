CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.4;
        this.myDistanceFromFeetToIgnore = 0.3;
        this.myDistanceFromHeadToIgnore = 0.3;

        this.myHorizontalMovementStepAmount = 1;
        this.myHorizontalMovementRadialStepAmount = 1;
        this.myHorizontalMovementCheckDiagonal = true;
        this.myHorizontalMovementCheckStraight = false;
        this.myHorizontalMovementCheckHorizontalBorder = false;
        this.myHorizontalMovementCheckVerticalStraight = false;
        this.myHorizontalMovementCheckVerticalDiagonal = true;
        this.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;

        this.myConeAngle = 120;
        this.myConeSliceAmount = 4;
        this.myCheckConeBorder = true;
        this.myCheckConeRay = true;

        this.myFeetRadius = 0.1;
        this.mySnapOnGroundExtraDistance = 0.3;
        this.myGroundCircumferenceSliceAmount = 8;
        this.myGroundCircumferenceStepAmount = 2;
        this.myGroundCircumferenceRotationPerStep = 22.5;

        this.myCheckHeight = true;
        this.myHeightCheckStepAmount = 1;
        this.myCheckVerticalStraight = true;
        this.myCheckVerticalDiagonalRay = false;
        this.myCheckVerticalDiagonalBorder = false;
        this.myCheckVerticalDiagonalBorderRay = false;
    }
};

CollisionCheck = class CollisionCheck {
    constructor() {
        //config like radius, distance to snap, check cone angle...
        //floor group, wall group

        this._myCollisionCheckParams = new CollisionCheckParams();

        this._myIsOnGround = true;

        this._myDebugActive = false;
    }

    fixMovement(movement) {
        if (movement.vec3_length() < 0.000001) {
            return movement;
        }

        let up = PP.myPlayerObjects.myPlayer.pp_getUp();
        let feetPosition = this._getPlayerFeetPosition();
        let height = this._getPlayerHeight();
        height = height - 0.00001;

        // if height is negative swap feet with head position

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(up);
        let verticalMovement = movement.vec3_componentAlongAxis(up);

        //feetPosition = feetPosition.vec3_add(horizontalMovement.vec3_normalize().vec3_scale(0.5));
        //height = height / 2;
        //horizontalMovement.vec3_scale(5, horizontalMovement);

        //this._myDebugActive = true;

        let fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, up);

        let newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement);

        let forward = fixedHorizontalMovement.vec3_normalize();
        if (fixedHorizontalMovement.vec3_length() < 0.000001) {
            forward = PP.myPlayerObjects.myPlayer.pp_getForward();
        }

        //this._myDebugActive = false;

        let fixedVerticalMovement = this._verticalCheck(verticalMovement, newFeetPosition, height, up, forward);

        let fixedMovement = [0, 0, 0];
        if (fixedVerticalMovement != null) {
            fixedMovement = fixedHorizontalMovement.vec3_add(fixedVerticalMovement);
        }

        feetPosition.vec3_add(fixedMovement, newFeetPosition);

        this._groundCheck(newFeetPosition, up, forward);

        return fixedMovement;
    }

    _groundCheck(feetPosition, up, forward) {
        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward);

        this._myIsOnGround = false;

        let startOffset = up.vec3_scale(0.0001);
        let endOffset = startOffset.vec3_negate();
        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let startPosition = currentPosition.vec3_add(startOffset);
            let endPosition = currentPosition.vec3_add(endOffset);

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

            if (raycastResult.hitCount > 0) {
                this._myIsOnGround = true;
                break;
            }
        }
    }

    _verticalCheck(verticalMovement, feetPosition, height, up, forward) {
        let fixedMovement = this._verticalMovementFix(verticalMovement, feetPosition, height, up, forward);

        let newFeetPosition = feetPosition.vec3_add(fixedMovement);
        let canStay = this._verticalPositionCheck(newFeetPosition, height, up, forward);
        if (!canStay) {
            fixedMovement = null;
        }

        return fixedMovement;
    }

    _verticalMovementFix(verticalMovement, feetPosition, height, up, forward) {
        let fixedMovement = null;

        let isMovementDownward = !verticalMovement.vec3_isConcordant(up) || Math.abs(verticalMovement.vec3_length() < 0.000001);

        let startOffset = null;
        let endOffset = null;
        if (isMovementDownward) {
            startOffset = up.vec3_scale(this._myCollisionCheckParams.myDistanceFromFeetToIgnore + 0.00001);
            endOffset = verticalMovement.pp_clone();
        } else {
            startOffset = up.vec3_scale(height).vec3_add(up.vec3_scale(-this._myCollisionCheckParams.myDistanceFromHeadToIgnore - 0.00001));
            endOffset = up.vec3_scale(height).vec3_add(verticalMovement);
        }

        if (isMovementDownward && this._myIsOnGround) {
            endOffset.vec3_add(up.vec3_scale(-this._myCollisionCheckParams.mySnapOnGroundExtraDistance), endOffset);
        }

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward);

        let verticalDirection = up;
        if (!isMovementDownward) {
            verticalDirection = verticalDirection.vec3_negate();
        }

        let furtherOnVerticalDirectionPosition = null;

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let origin = currentPosition.vec3_add(startOffset);
            let direction = currentPosition.vec3_add(endOffset).vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

            if (raycastResult.hitCount > 0 && !this._isRaycastResultInsideWall(origin, direction, raycastResult)) {
                if (furtherOnVerticalDirectionPosition != null) {
                    if (raycastResult.locations[0].vec3_isFurtherAlongAxis(furtherOnVerticalDirectionPosition, verticalDirection)) {
                        furtherOnVerticalDirectionPosition.vec3_copy(raycastResult.locations[0]);
                    }
                } else {
                    furtherOnVerticalDirectionPosition = raycastResult.locations[0].pp_clone();
                }
            }
        }

        if (furtherOnVerticalDirectionPosition != null) {
            if (isMovementDownward) {
                fixedMovement = furtherOnVerticalDirectionPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);
            } else {
                fixedMovement = furtherOnVerticalDirectionPosition.vec3_sub(feetPosition.vec3_add(up.vec3_scale(height))).vec3_componentAlongAxis(up);
            }
        } else {
            fixedMovement = verticalMovement;
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _verticalPositionCheck(feetPosition, height, up, forward) {
        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward);

        let isVerticalPositionOk = true;

        let smallHeightFixOffset = up.vec3_scale(0.00001);
        let heightOffset = up.vec3_scale(height);
        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let startPosition = currentPosition.vec3_add(smallHeightFixOffset);
            let endPosition = startPosition.vec3_add(heightOffset);

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

            if (raycastResult.hitCount > 0) {
                isVerticalPositionOk = false;
                break;
            }
        }

        return isVerticalPositionOk;
    }

    _getVerticalCheckPositions(feetPosition, up, forward) {
        let checkPositions = [];
        checkPositions.push(feetPosition);

        let radiusStep = this._myCollisionCheckParams.myFeetRadius / this._myCollisionCheckParams.myGroundCircumferenceStepAmount;
        let sliceAngle = 360 / this._myCollisionCheckParams.myGroundCircumferenceSliceAmount;
        let currentStepRotation = 0;
        for (let i = 0; i < this._myCollisionCheckParams.myGroundCircumferenceStepAmount; i++) {
            let currentRadius = radiusStep * (i + 1);

            let currentDirection = forward.vec3_rotateAxis(currentStepRotation, up);
            for (let j = 0; j < this._myCollisionCheckParams.myGroundCircumferenceSliceAmount; j++) {
                let sliceDirection = currentDirection.vec3_rotateAxis(sliceAngle * j, up);
                checkPositions.push(feetPosition.vec3_add(sliceDirection.vec3_scale(currentRadius)));
            }

            currentStepRotation += this._myCollisionCheckParams.myGroundCircumferenceRotationPerStep;
        }

        return checkPositions;
    }

    _horizontalCheck(movement, feetPosition, height, up) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(this._myCollisionCheckParams.myDistanceFromFeetToIgnore + 0.00001));
        let fixedHeight = Math.max(0, height - this._myCollisionCheckParams.myDistanceFromFeetToIgnore - 0.00001);

        let canMove = this._horizontalMovementCheck(movement, fixedFeetPosition, fixedHeight, up);

        let fixedMovement = [0, 0, 0];
        if (canMove) {
            let newFixedFeetPosition = fixedFeetPosition.vec3_add(movement);
            let canStay = this._horizontalPositionCheck(newFixedFeetPosition, fixedHeight, up, movement.vec3_normalize());
            if (canStay) {
                fixedMovement = movement;
            }
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _horizontalMovementCheck(movement, feetPosition, height, up) {
        let coneAngle = Math.min(this._myCollisionCheckParams.myConeAngle, 180);
        let movementDirection = movement.vec3_normalize();

        let checkPositions = [];

        let steplength = this._myCollisionCheckParams.myRadius / this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount;

        // left
        {
            let radialDirection = movementDirection.vec3_rotateAxis(coneAngle / 2, up);
            for (let i = 0; i < this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount; i++) {
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
            for (let i = 1; i <= this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount; i++) {
                let currentStep = i * steplength;
                let currentRadialPosition = radialDirection.vec3_scale(currentStep);
                let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                checkPositions.push(currentCheckPosition);
            }
        }


        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (this._myCollisionCheckParams.myCheckHeight && this._myCollisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = this._myCollisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / this._myCollisionCheckParams.myHeightCheckStepAmount);
        }

        let movementStep = movement.vec3_scale(1 / this._myCollisionCheckParams.myHorizontalMovementStepAmount);

        for (let m = 0; m < this._myCollisionCheckParams.myHorizontalMovementStepAmount; m++) {
            for (let i = 0; i <= heightStepAmount; i++) {
                let currentHeightOffset = heightStep.vec3_scale(i);
                for (let j = 0; j < checkPositions.length; j++) {
                    let firstPosition = checkPositions[j].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                    if (j < checkPositions.length - 1) {
                        let secondPosition = checkPositions[j + 1].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                        if (this._myCollisionCheckParams.myHorizontalMovementCheckDiagonal) {
                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);

                                let origin = secondPosition;
                                let direction = firstMovementPosition.vec3_sub(secondPosition);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstMovementPosition;
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

                            {
                                let secondMovementPosition = secondPosition.vec3_add(movementStep);

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
                        }

                        if (this._myCollisionCheckParams.myHorizontalMovementCheckHorizontalBorder) {
                            {
                                let origin = secondPosition;
                                let direction = firstPosition.vec3_sub(origin);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstPosition;
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

                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);

                                let origin = secondPosition.vec3_add(movementStep);
                                let direction = firstMovementPosition.vec3_sub(origin);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstMovementPosition;
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

                        // check height
                        if (i > 0) {
                            if (this._myCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonal) {
                                {
                                    let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                    let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                                    let origin = secondHeightPosition;
                                    let direction = firstMovementPosition.vec3_sub(secondHeightPosition);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = firstMovementPosition;
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

                                {
                                    let secondMovementPosition = secondPosition.vec3_add(movementStep);
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

                            if (this._myCollisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal) {
                                {
                                    let secondHeightPosition = secondPosition.vec3_sub(heightStep);

                                    let origin = secondHeightPosition;
                                    let direction = firstPosition.vec3_sub(origin);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = firstPosition;
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

                                {
                                    let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                    let origin = firstHeightPosition;
                                    let direction = secondPosition.vec3_sub(origin);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = secondPosition;
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

                                {
                                    let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                    let secondHeightMovementPosition = secondPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                    let origin = secondHeightMovementPosition;
                                    let direction = firstMovementPosition.vec3_sub(origin);

                                    if (!direction.vec3_isConcordant(movementDirection)) {
                                        direction.vec3_negate(direction);
                                        origin = firstMovementPosition;
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

                                {
                                    let secondMovementPosition = secondPosition.vec3_add(movementStep);
                                    let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                    let origin = firstHeightMovementPosition;
                                    let direction = secondMovementPosition.vec3_sub(origin);

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
                    }

                    if (this._myCollisionCheckParams.myHorizontalMovementCheckStraight) {
                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);

                            let origin = firstPosition;
                            let direction = firstMovementPosition.vec3_sub(origin);
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

                    // check height
                    if (i > 0) {
                        if (this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraight) {
                            {
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstPosition.vec3_sub(origin);

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
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                let firstHeightMovementPosition = firstMovementPosition.vec3_sub(heightStep);

                                let origin = firstHeightMovementPosition;
                                let direction = firstMovementPosition.vec3_sub(origin);

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

                        if (this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal) {
                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstMovementPosition.vec3_sub(origin);

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
                                let firstHeightMovementPosition = firstPosition.vec3_sub(heightStep).vec3_add(movementStep);

                                let origin = firstPosition;
                                let direction = firstHeightMovementPosition.vec3_sub(origin);

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
                }

                if (!isHorizontalCheckOk) {
                    break;
                }
            }
        }

        return isHorizontalCheckOk;
    }

    _horizontalPositionCheck(feetPosition, height, up, forward) {
        let radialPositions = [];
        let sliceAngle = this._myCollisionCheckParams.myConeAngle / this._myCollisionCheckParams.myConeSliceAmount;
        let startAngle = -this._myCollisionCheckParams.myConeAngle / 2;
        for (let i = 0; i < this._myCollisionCheckParams.myConeSliceAmount + 1; i++) {
            let currentAngle = startAngle + i * sliceAngle;

            let radialDirection = forward.vec3_rotateAxis(-currentAngle, up);
            radialPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(this._myCollisionCheckParams.myRadius)));
        }

        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (this._myCollisionCheckParams.myCheckHeight && this._myCollisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = this._myCollisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / this._myCollisionCheckParams.myHeightCheckStepAmount);
        }

        let flatFeetPosition = feetPosition.vec3_removeComponentAlongAxis(up);
        for (let i = 0; i <= heightStepAmount; i++) {
            let currentHeightOffset = heightStep.vec3_scale(i);
            let basePosition = feetPosition.vec3_add(currentHeightOffset);
            let previousBasePosition = basePosition.vec3_sub(heightStep);

            if (i != 0) {
                let furtherOnUpPosition = null;

                for (let j = 0; j <= radialPositions.length; j++) {
                    let currentRadialPosition = null;
                    let previousRadialPosition = null;
                    if (j == radialPositions.length) {
                        currentRadialPosition = basePosition;
                        previousRadialPosition = previousBasePosition;
                    } else {
                        currentRadialPosition = radialPositions[j].vec3_add(currentHeightOffset);
                        previousRadialPosition = currentRadialPosition.vec3_sub(heightStep);
                    }

                    if (this._myCollisionCheckParams.myCheckVerticalStraight) {
                        let origin = previousRadialPosition;
                        let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);

                        let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                        if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                            if (furtherOnUpPosition != null) {
                                let hitUpComponent = raycastResult.locations[0].vec3_componentAlongAxis(up);
                                let closestUpComponent = furtherOnUpPosition.vec3_componentAlongAxis(up);
                                if (hitUpComponent.vec3_isFurtherAlongAxis(closestUpComponent, up)) {
                                    furtherOnUpPosition = flatFeetPosition.vec3_add(hitUpComponent);
                                }
                            } else {
                                furtherOnUpPosition = flatFeetPosition.vec3_add(raycastResult.locations[0].vec3_componentAlongAxis(up));
                            }

                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    if (j < radialPositions.length) {
                        if (this._myCollisionCheckParams.myCheckVerticalDiagonalRay ||
                            (this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRay && (j == 0 || j == radialPositions.length - 1))) {
                            {
                                let origin = previousBasePosition;
                                let direction = currentRadialPosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                                if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let origin = previousRadialPosition;
                                let direction = basePosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                                if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (j > 0) {
                            if (this._myCollisionCheckParams.myCheckVerticalDiagonalBorder) {
                                let previousCurrentRadialPosition = radialPositions[j - 1].vec3_add(currentHeightOffset);
                                let previousPreviousRadialPosition = previousCurrentRadialPosition.vec3_sub(heightStep);

                                {
                                    let origin = previousPreviousRadialPosition;
                                    let direction = currentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                                    if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }

                                {
                                    let origin = previousRadialPosition;
                                    let direction = previousCurrentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                                    if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (furtherOnUpPosition != null) {
                    basePosition = furtherOnUpPosition;
                    currentHeightOffset = basePosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);
                }
            }

            if (isHorizontalCheckOk) {
                for (let j = 0; j < radialPositions.length; j++) {
                    let currentRadialPosition = radialPositions[j].vec3_add(currentHeightOffset);

                    if (this._myCollisionCheckParams.myCheckConeRay) {
                        let origin = basePosition;
                        let direction = currentRadialPosition.vec3_sub(basePosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);

                        let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                        if (raycastResult.hitCount > 0) {
                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    if (j > 0) {
                        if (this._myCollisionCheckParams.myCheckConeBorder) {
                            let previousRadialPosition = radialPositions[j - 1].vec3_add(currentHeightOffset);
                            let origin = previousRadialPosition;
                            let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                            if (!direction.vec3_isConcordant(forward)) {
                                direction.vec3_negate(direction);
                                origin = currentRadialPosition;
                            }
                            let distance = direction.vec3_length();
                            direction.vec3_normalize(direction);

                            let raycastResult = this._raycastAndDebug(origin, direction, 255, distance);

                            if (this._isRaycastResultValid(raycastResult, origin, direction)) {
                                isHorizontalCheckOk = false;
                                break;
                            }
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

        let heightDisplacement = headPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(playerUp);
        let height = heightDisplacement.vec3_length();
        if (!playerUp.vec3_isConcordant(heightDisplacement)) {
            height = 0;
        }

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