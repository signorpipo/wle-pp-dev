CollisionCheckParams = class CollisionCheckParams {
    constructor() {
        this.myRadius = 0.3;
        this.myDistanceFromFeetToIgnore = 0.3; // could be percentage of the height
        this.myDistanceFromHeadToIgnore = 0.1;

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
        this.myGroundFixDistanceFromFeet = 0.3;
        this.myGroundFixDistanceFromHead = 0.1;

        this.myCheckHeight = true;
        this.myHeightCheckStepAmount = 1;
        this.myCheckVerticalStraight = true;
        this.myCheckVerticalDiagonalRay = false;
        this.myCheckVerticalDiagonalBorder = false;
        this.myCheckVerticalDiagonalBorderRay = false;

        this.myHeight = 1;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this.myPhysXsToIgnore = [];

        this.myDebugActive = false;
    }
};

CollisionRuntimeParams = class CollisionRuntimeParams {
    constructor() {
        this.myIsOnGround = false;
    }
};

CollisionCheck = class CollisionCheck {
    constructor() {

        this._myRaycastSetup = new PP.RaycastSetup();
        this._myRaycastResult = new PP.RaycastResult();
    }

    fixMovement(movement, transformQuat, collisionCheckParams, collisionRuntimeParams) {
        let up = transformQuat.quat2_getUp();
        let feetPosition = transformQuat.quat2_getPosition();
        let height = collisionCheckParams.myHeight;
        height = height - 0.00001; // this makes it easier to setup things at the same exact height of a character so that it can go under it

        // if height is negative swap feet with head position

        let horizontalMovement = movement.vec3_removeComponentAlongAxis(up);
        if (horizontalMovement.vec3_length() < 0.000001) {
            horizontalMovement.vec3_zero();
        }
        let verticalMovement = movement.vec3_componentAlongAxis(up);
        if (verticalMovement.vec3_length() < 0.000001) {
            verticalMovement.vec3_zero();
        }

        //feetPosition = feetPosition.vec3_add(horizontalMovement.vec3_normalize().vec3_scale(0.5));
        //height = height / 2;
        //horizontalMovement.vec3_scale(5, horizontalMovement);

        //collisionCheckParams.myDebugActive = true;

        let fixedHorizontalMovement = this._horizontalCheck(horizontalMovement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams);

        let newFeetPosition = feetPosition.vec3_add(fixedHorizontalMovement);

        let forward = fixedHorizontalMovement.vec3_normalize();
        if (fixedHorizontalMovement.vec3_length() < 0.000001) {
            forward = PP.myPlayerObjects.myPlayer.pp_getForward();
        }

        //collisionCheckParams.myDebugActive = false;

        let fixedVerticalMovement = this._verticalCheck(verticalMovement, newFeetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);

        let fixedMovement = [0, 0, 0];
        if (fixedVerticalMovement != null) {
            fixedMovement = fixedHorizontalMovement.vec3_add(fixedVerticalMovement);
        }

        feetPosition.vec3_add(fixedMovement, newFeetPosition);

        this._groundCheck(newFeetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        return fixedMovement;
    }

    _groundCheck(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        collisionRuntimeParams.myIsOnGround = false;

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

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.myHits.length > 0) {
                collisionRuntimeParams.myIsOnGround = true;
                break;
            }
        }
    }

    _verticalCheck(verticalMovement, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let verticalDirection = verticalMovement.vec3_normalize();
        if (verticalMovement.vec3_length() < 0.00001) {
            verticalDirection = up.vec3_negate();
        }

        let fixedMovement = this._verticalMovementFix(verticalMovement, verticalDirection, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);
        if (fixedMovement.pp_equals(verticalMovement)) {
            let oppositeDirection = verticalDirection.vec3_negate();
            let newFeetPosition = feetPosition.vec3_add(fixedMovement);
            let additionalMovement = this._verticalMovementFix([0, 0, 0], oppositeDirection, newFeetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams);
            if (additionalMovement.vec3_isConcordant(verticalDirection)) {
                fixedMovement.vec3_add(additionalMovement, fixedMovement);
            }
        }

        let newFeetPosition = feetPosition.vec3_add(fixedMovement);

        let isMovementDownward = !verticalMovement.vec3_isConcordant(up) || Math.abs(verticalMovement.vec3_length() < 0.000001);
        let canStay = this._verticalPositionCheck(newFeetPosition, isMovementDownward, height, up, forward, collisionCheckParams, collisionRuntimeParams);
        if (!canStay) {
            fixedMovement = null;
        }

        return fixedMovement;
    }

    _verticalMovementFix(verticalMovement, verticalDirection, feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let fixedMovement = null;

        let isMovementDownward = !verticalDirection.vec3_isConcordant(up);

        let startOffset = null;
        let endOffset = null;
        if (isMovementDownward) {
            startOffset = up.vec3_scale(collisionCheckParams.myGroundFixDistanceFromFeet + 0.00001);
            endOffset = verticalMovement.pp_clone();
        } else {
            startOffset = up.vec3_scale(height).vec3_add(up.vec3_scale(-collisionCheckParams.myGroundFixDistanceFromHead - 0.00001));
            endOffset = up.vec3_scale(height).vec3_add(verticalMovement);
        }

        if (isMovementDownward && collisionRuntimeParams.myIsOnGround) {
            endOffset.vec3_add(up.vec3_scale(-collisionCheckParams.mySnapOnGroundExtraDistance), endOffset);
        }

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        let furtherDirection = up;
        if (!isMovementDownward) {
            furtherDirection = furtherDirection.vec3_negate();
        }

        let furtherDirectionPosition = null;

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let origin = currentPosition.vec3_add(startOffset);
            let direction = currentPosition.vec3_add(endOffset).vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.myHits.length > 0) {
                if (furtherDirectionPosition != null) {
                    if (raycastResult.myHits[0].myPosition.vec3_isFurtherAlongAxis(furtherDirectionPosition, furtherDirection)) {
                        furtherDirectionPosition.vec3_copy(raycastResult.myHits[0].myPosition);
                    }
                } else {
                    furtherDirectionPosition = raycastResult.myHits[0].myPosition.pp_clone();
                }
            }
        }

        if (furtherDirectionPosition != null) {
            if (isMovementDownward) {
                fixedMovement = furtherDirectionPosition.vec3_sub(feetPosition).vec3_componentAlongAxis(up);
            } else {
                fixedMovement = furtherDirectionPosition.vec3_sub(feetPosition.vec3_add(up.vec3_scale(height))).vec3_componentAlongAxis(up);
            }
        } else {
            fixedMovement = verticalMovement.pp_clone();
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _verticalPositionCheck(feetPosition, checkUpward, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        if (height < 0.00001) {
            return true;
        }

        let checkPositions = this._getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams);

        let isVerticalPositionOk = true;
        let atLeastOneIsOk = false;

        let adjustmentEpsilon = 0.00001;
        let smallHeightFixOffset = up.vec3_scale(adjustmentEpsilon);
        let heightOffset = up.vec3_scale(height - adjustmentEpsilon);
        if (height - adjustmentEpsilon < adjustmentEpsilon) {
            heightOffset = up.vec3_scale(adjustmentEpsilon * 2);
        }

        for (let i = 0; i < checkPositions.length; i++) {
            let currentPosition = checkPositions[i];

            let startPosition = null;
            let endPosition = null;

            if (checkUpward) {
                startPosition = currentPosition.vec3_add(smallHeightFixOffset);
                endPosition = currentPosition.vec3_add(heightOffset);
            } else {
                startPosition = currentPosition.vec3_add(heightOffset);
                endPosition = currentPosition.vec3_add(smallHeightFixOffset);
            }

            let origin = startPosition;
            let direction = endPosition.vec3_sub(origin);
            let distance = direction.vec3_length();
            direction.vec3_normalize(direction);

            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

            if (raycastResult.myHits.length > 0) {
                isVerticalPositionOk = false;
                break;
            } else {
                //#TODO  AGGIUNGERE CHECK DENTRO MURO
                atLeastOneIsOk = true;
            }
        }

        return isVerticalPositionOk && atLeastOneIsOk;
    }

    _getVerticalCheckPositions(feetPosition, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let checkPositions = [];
        checkPositions.push(feetPosition);

        let radiusStep = collisionCheckParams.myFeetRadius / collisionCheckParams.myGroundCircumferenceStepAmount;
        let sliceAngle = 360 / collisionCheckParams.myGroundCircumferenceSliceAmount;
        let currentStepRotation = 0;
        for (let i = 0; i < collisionCheckParams.myGroundCircumferenceStepAmount; i++) {
            let currentRadius = radiusStep * (i + 1);

            let currentDirection = forward.vec3_rotateAxis(currentStepRotation, up);
            for (let j = 0; j < collisionCheckParams.myGroundCircumferenceSliceAmount; j++) {
                let sliceDirection = currentDirection.vec3_rotateAxis(sliceAngle * j, up);
                checkPositions.push(feetPosition.vec3_add(sliceDirection.vec3_scale(currentRadius)));
            }

            currentStepRotation += collisionCheckParams.myGroundCircumferenceRotationPerStep;
        }

        return checkPositions;
    }

    _horizontalCheck(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        if (movement.vec3_length() < 0.000001) {
            return movement.vec3_scale(0);
        }

        let fixedFeetPosition = feetPosition.vec3_add(up.vec3_scale(collisionCheckParams.myDistanceFromFeetToIgnore + 0.00001));
        let fixedHeight = Math.max(0, height - collisionCheckParams.myDistanceFromFeetToIgnore - collisionCheckParams.myDistanceFromHeadToIgnore);

        let canMove = this._horizontalMovementCheck(movement, fixedFeetPosition, fixedHeight, up, collisionCheckParams, collisionRuntimeParams);

        let fixedMovement = [0, 0, 0];
        if (canMove) {
            let newFixedFeetPosition = fixedFeetPosition.vec3_add(movement);
            let canStay = this._horizontalPositionCheck(newFixedFeetPosition, fixedHeight, up, movement.vec3_normalize(), collisionCheckParams, collisionRuntimeParams);
            if (canStay) {
                fixedMovement = movement;
            }
        }

        if (fixedMovement.vec3_length() < 0.00001) {
            fixedMovement.vec3_scale(0, fixedMovement);
        }

        return fixedMovement;
    }

    _horizontalMovementCheck(movement, feetPosition, height, up, collisionCheckParams, collisionRuntimeParams) {
        let coneAngle = Math.min(collisionCheckParams.myConeAngle, 180);
        let movementDirection = movement.vec3_normalize();

        let checkPositions = [];

        let steplength = collisionCheckParams.myRadius / collisionCheckParams.myHorizontalMovementRadialStepAmount;

        // left
        {
            let radialDirection = movementDirection.vec3_rotateAxis(coneAngle / 2, up);
            for (let i = 0; i < collisionCheckParams.myHorizontalMovementRadialStepAmount; i++) {
                let currentStep = collisionCheckParams.myRadius - i * steplength;
                let currentRadialPosition = radialDirection.vec3_scale(currentStep);
                let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                checkPositions.push(currentCheckPosition);
            }
        }

        checkPositions.push(feetPosition);

        // right
        {
            let radialDirection = movementDirection.vec3_rotateAxis(-coneAngle / 2, up);
            for (let i = 1; i <= collisionCheckParams.myHorizontalMovementRadialStepAmount; i++) {
                let currentStep = i * steplength;
                let currentRadialPosition = radialDirection.vec3_scale(currentStep);
                let currentCheckPosition = currentRadialPosition.vec3_add(feetPosition);
                checkPositions.push(currentCheckPosition);
            }
        }


        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / collisionCheckParams.myHeightCheckStepAmount);
        }

        let movementStep = movement.vec3_scale(1 / collisionCheckParams.myHorizontalMovementStepAmount);

        for (let m = 0; m < collisionCheckParams.myHorizontalMovementStepAmount; m++) {
            for (let i = 0; i <= heightStepAmount; i++) {
                let currentHeightOffset = heightStep.vec3_scale(i);
                for (let j = 0; j < checkPositions.length; j++) {
                    let firstPosition = checkPositions[j].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                    if (j < checkPositions.length - 1) {
                        let secondPosition = checkPositions[j + 1].vec3_add(movementStep.vec3_scale(m)).vec3_add(currentHeightOffset);

                        if (collisionCheckParams.myHorizontalMovementCheckDiagonal) {
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
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
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
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (collisionCheckParams.myHorizontalMovementCheckHorizontalBorder) {
                            {
                                let origin = secondPosition;
                                let direction = firstPosition.vec3_sub(origin);

                                if (!direction.vec3_isConcordant(movementDirection)) {
                                    direction.vec3_negate(direction);
                                    origin = firstPosition;
                                }

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
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
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        // check height
                        if (i > 0) {
                            if (collisionCheckParams.myHorizontalMovementCheckVerticalDiagonal) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
                                        // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }

                            if (collisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
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
                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
                                        // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (collisionCheckParams.myHorizontalMovementCheckStraight) {
                        {
                            let firstMovementPosition = firstPosition.vec3_add(movementStep);

                            let origin = firstPosition;
                            let direction = firstMovementPosition.vec3_sub(origin);
                            let distance = direction.vec3_length();
                            direction.vec3_normalize(direction);
                            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                            if (raycastResult.myHits.length > 0) {
                                // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                isHorizontalCheckOk = false;
                                break;
                            }
                        }
                    }

                    // check height
                    if (i > 0) {
                        if (collisionCheckParams.myHorizontalMovementCheckVerticalStraight) {
                            {
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
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
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    // if result is inside wall, it's ignored, so that at least you can exit it before seeing if the new position works now
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (collisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal) {
                            {
                                let firstMovementPosition = firstPosition.vec3_add(movementStep);
                                let firstHeightPosition = firstPosition.vec3_sub(heightStep);

                                let origin = firstHeightPosition;
                                let direction = firstMovementPosition.vec3_sub(origin);

                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
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
                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
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

    _horizontalPositionCheck(feetPosition, height, up, forward, collisionCheckParams, collisionRuntimeParams) {
        let radialPositions = [];
        let sliceAngle = collisionCheckParams.myConeAngle / collisionCheckParams.myConeSliceAmount;
        let startAngle = -collisionCheckParams.myConeAngle / 2;
        for (let i = 0; i < collisionCheckParams.myConeSliceAmount + 1; i++) {
            let currentAngle = startAngle + i * sliceAngle;

            let radialDirection = forward.vec3_rotateAxis(-currentAngle, up);
            radialPositions.push(feetPosition.vec3_add(radialDirection.vec3_scale(collisionCheckParams.myRadius)));
        }

        let isHorizontalCheckOk = true;

        let heightStepAmount = 0;
        let heightStep = [0, 0, 0];
        if (collisionCheckParams.myCheckHeight && collisionCheckParams.myHeightCheckStepAmount > 0 && height > 0) {
            heightStepAmount = collisionCheckParams.myHeightCheckStepAmount;
            heightStep = up.vec3_scale(height / collisionCheckParams.myHeightCheckStepAmount);
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

                    if (collisionCheckParams.myCheckVerticalStraight) {
                        let origin = previousRadialPosition;
                        let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);

                        let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                        if (raycastResult.myHits.length > 0) {
                            if (furtherOnUpPosition != null) {
                                let hitUpComponent = raycastResult.myHits[0].myPosition.vec3_componentAlongAxis(up);
                                let closestUpComponent = furtherOnUpPosition.vec3_componentAlongAxis(up);
                                if (hitUpComponent.vec3_isFurtherAlongAxis(closestUpComponent, up)) {
                                    furtherOnUpPosition = flatFeetPosition.vec3_add(hitUpComponent);
                                }
                            } else {
                                furtherOnUpPosition = flatFeetPosition.vec3_add(raycastResult.myHits[0].myPosition.vec3_componentAlongAxis(up));
                            }

                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    if (j < radialPositions.length) {
                        if (collisionCheckParams.myCheckVerticalDiagonalRay ||
                            (collisionCheckParams.myCheckVerticalDiagonalBorderRay && (j == 0 || j == radialPositions.length - 1))) {
                            {
                                let origin = previousBasePosition;
                                let direction = currentRadialPosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }

                            {
                                let origin = previousRadialPosition;
                                let direction = basePosition.vec3_sub(origin);
                                let distance = direction.vec3_length();
                                direction.vec3_normalize(direction);

                                let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                if (raycastResult.myHits.length > 0) {
                                    isHorizontalCheckOk = false;
                                    break;
                                }
                            }
                        }

                        if (j > 0) {
                            if (collisionCheckParams.myCheckVerticalDiagonalBorder) {
                                let previousCurrentRadialPosition = radialPositions[j - 1].vec3_add(currentHeightOffset);
                                let previousPreviousRadialPosition = previousCurrentRadialPosition.vec3_sub(heightStep);

                                {
                                    let origin = previousPreviousRadialPosition;
                                    let direction = currentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
                                        isHorizontalCheckOk = false;
                                        break;
                                    }
                                }

                                {
                                    let origin = previousRadialPosition;
                                    let direction = previousCurrentRadialPosition.vec3_sub(origin);
                                    let distance = direction.vec3_length();
                                    direction.vec3_normalize(direction);

                                    let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                                    if (raycastResult.myHits.length > 0) {
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

                    if (collisionCheckParams.myCheckConeRay) {
                        let origin = basePosition;
                        let direction = currentRadialPosition.vec3_sub(basePosition);
                        let distance = direction.vec3_length();
                        direction.vec3_normalize(direction);

                        let raycastResult = this._raycastAndDebug(origin, direction, distance, false, collisionCheckParams, collisionRuntimeParams);

                        if (raycastResult.myHits.length > 0) {
                            isHorizontalCheckOk = false;
                            break;
                        }
                    }

                    if (j > 0) {
                        if (collisionCheckParams.myCheckConeBorder) {
                            let previousRadialPosition = radialPositions[j - 1].vec3_add(currentHeightOffset);
                            let origin = previousRadialPosition;
                            let direction = currentRadialPosition.vec3_sub(previousRadialPosition);
                            if (!direction.vec3_isConcordant(forward)) {
                                direction.vec3_negate(direction);
                                origin = currentRadialPosition;
                            }
                            let distance = direction.vec3_length();
                            direction.vec3_normalize(direction);

                            let raycastResult = this._raycastAndDebug(origin, direction, distance, true, collisionCheckParams, collisionRuntimeParams);

                            if (raycastResult.myHits.length > 0) {
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

    _raycastAndDebug(origin, direction, distance, ignoreHitsFromInside, collisionCheckParams, collisionRuntimeParams) {
        this._myRaycastSetup.myOrigin.vec3_copy(origin);
        this._myRaycastSetup.myDirection.vec3_copy(direction);
        this._myRaycastSetup.myDistance = distance;

        this._myRaycastSetup.myBlockLayerFlags = collisionCheckParams.myBlockLayerFlags;

        this._myRaycastSetup.myPhysXsToIgnore = collisionCheckParams.myPhysXsToIgnore;
        this._myRaycastSetup.myIgnoreHitsFromInside = ignoreHitsFromInside;

        let raycastResult = PP.PhysicsUtils.raycast(this._myRaycastSetup, this._myRaycastResult);

        if (collisionCheckParams.myDebugActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }

        return raycastResult;
    }
};