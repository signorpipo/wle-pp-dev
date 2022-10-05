PlayerLocomotionTeleportDetectionState = class PlayerLocomotionTeleportDetectionState extends PlayerLocomotionTeleportState {
    constructor(teleportParams, teleportRuntimeParams, locomotionRuntimeParams) {
        super(teleportParams, teleportRuntimeParams, locomotionRuntimeParams);

        this._myTeleportDetectionValid = false;
        this._myStickIdleCharge = false;

        this._myTeleportPositionValid = false;
        this._myTeleportSurfaceNormal = PP.vec3_create();
        this._myTeleportRotationOnUpNext = 0;
        this._myVisualTeleportTransformQuatReset = true;
        this._myVisualTeleportTransformQuat = PP.quat2_create();
        this._myVisualTeleportTransformPositionLerping = false;
        this._myVisualTeleportTransformRotationLerping = false;

        this._myParable = new PlayerLocomotionTeleportParable();

        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Parable Steps", this._myTeleportParams.myTeleportParableStepLength, 1, 3, 0.01));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Parable Gravity", this._myTeleportParams.myTeleportParableGravity, 10, 3));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Parable Speed", this._myTeleportParams.myTeleportParableSpeed, 10, 3, 0));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Max Distance", this._myTeleportParams.myMaxDistance, 10, 3, 0));

        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Min Distance Lerp", this._myTeleportParams.myVisualTeleportPositionMinDistanceToLerp, 1, 3, 0));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Max Distance Lerp", this._myTeleportParams.myVisualTeleportPositionMaxDistanceToLerp, 1, 3, 0));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Min Angle Distance Lerp", this._myTeleportParams.myVisualTeleportPositionMinAngleDistanceToLerp, 10, 3, 0));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Max Angle Distance Lerp", this._myTeleportParams.myVisualTeleportPositionMaxAngleDistanceToLerp, 10, 3, 0));

        this._setupVisuals();
    }

    start() {
        this._detectStart();
    }

    end() {
        this._detectEnd();
    }

    update(dt, fsm) {
        this._myTeleportParams.myVisualTeleportPositionMinDistanceToLerp = PP.myEasyTuneVariables.get("Teleport Min Distance Lerp");
        this._myTeleportParams.myVisualTeleportPositionMaxDistanceToLerp = PP.myEasyTuneVariables.get("Teleport Max Distance Lerp");
        this._myTeleportParams.myVisualTeleportPositionMinAngleDistanceToLerp = PP.myEasyTuneVariables.get("Teleport Min Angle Distance Lerp");
        this._myTeleportParams.myVisualTeleportPositionMaxAngleDistanceToLerp = PP.myEasyTuneVariables.get("Teleport Max Angle Distance Lerp");

        this._detectUpdate(dt, fsm);
    }

    _detectUpdate(dt, fsm) {
        this._detectTeleportPosition();

        if (this._myTeleportDetectionValid) {
            this._showTeleportPosition(dt);
        } else {
            this._myVisualTeleportTransformQuatReset = true;
            this._myVisualTeleportTransformPositionLerping = false;
            this._myVisualTeleportTransformRotationLerping = false;
            this._hideTeleportPosition(dt);
        }

        if (this._confirmTeleport()) {
            if (this._myTeleportPositionValid) {
                fsm.perform("teleport");
            } else {
                fsm.perform("cancel");
            }
        } else if (this._cancelTeleport()) {
            fsm.perform("cancel");
        }
    }

    _detectStart() {
        this._myTeleportRuntimeParams.myTeleportRotationOnUp = 0;
        this._myTeleportRotationOnUpNext = 0;

        this._myParable.setSpeed(this._myTeleportParams.myTeleportParableSpeed);
        this._myParable.setGravity(this._myTeleportParams.myTeleportParableGravity);
        this._myParable.setStepLength(this._myTeleportParams.myTeleportParableStepLength);
    }

    _detectEnd(dt) {
        this._myVisualTeleportTransformQuatReset = true;
        this._myVisualTeleportTransformPositionLerping = false;
        this._myVisualTeleportTransformRotationLerping = false;
        this._hideTeleportPosition(dt);
    }

    _confirmTeleport() {
        let confirmTeleport = false;

        if (!PP.XRUtils.isXRSessionActive()) {
            if (PP.myMouse.isInsideView()) {
                confirmTeleport = PP.myMouse.isButtonPressEnd(PP.MouseButtonType.MIDDLE);
            }
        } else {
            let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
            if (axes.vec2_length() <= this._myTeleportParams.myStickIdleThreshold) {
                confirmTeleport = true;
            }
        }

        return confirmTeleport;
    }

    _cancelTeleport() {
        let cancelTeleport = false;

        if (!PP.XRUtils.isXRSessionActive()) {
            cancelTeleport = PP.myMouse.isButtonPressEnd(PP.MouseButtonType.RIGHT) || !PP.myMouse.isInsideView();
        } else {
            cancelTeleport = PP.myLeftGamepad.getButtonInfo(PP.ButtonType.THUMBSTICK).isPressed();
        }

        return cancelTeleport;
    }

    _detectTeleportPosition() {
        if (PP.XRUtils.isXRSessionActive()) {
            this._detectTeleportRotationVR();
            this._detectTeleportPositionVR();
        } else {
            this._myTeleportRuntimeParams.myTeleportRotationOnUp = 0;
            this._myTeleportRotationOnUpNext = 0;
            this._detectTeleportPositionNonVR();
        }
    }

    _showTeleportPosition(dt) {
        this._hideTeleportPosition();

        this._showTeleportParable(dt);
    }

    _hideTeleportPosition() {
        for (let visualLine of this._myValidVisualLines) {
            visualLine.setVisible(false);
        }

        for (let visualLine of this._myInvalidVisualLines) {
            visualLine.setVisible(false);
        }

        this._myValidVisualPoint.setVisible(false);
        this._myInvalidVisualPoint.setVisible(false);

        this._myValidVisualVerticalLine.setVisible(false);

        this._myValidVisualTeleportPositionTorus.setVisible(false);
        this._myValidVisualTeleportPositionTorusInner.setVisible(false);
    }

    _addVisualLines(amount) {
        for (let i = 0; i < amount; i++) {
            {
                let visualParams = new PP.VisualLineParams();

                if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                    visualParams.myMaterial = this._myTeleportParams.myTeleportParableValidMaterial;
                } else {
                    visualParams.myMaterial = this._myTeleportParableValidMaterial;
                }

                this._myValidVisualLines.push(new PP.VisualLine(visualParams));
            }

            {
                let visualParams = new PP.VisualLineParams();

                if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                    visualParams.myMaterial = this._myTeleportParams.myTeleportParableInvalidMaterial;
                } else {
                    visualParams.myMaterial = this._myTeleportParableInvalidMaterial;
                }

                this._myInvalidVisualLines.push(new PP.VisualLine(visualParams));
            }
        }
    }
};

PlayerLocomotionTeleportDetectionState.prototype._setupVisuals = function () {
    let innerTorusPosition = PP.vec3_create();
    return function _setupVisuals() {
        this._myTeleportParableValidMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
        this._myTeleportParableValidMaterial.color = [0, 0.5, 1, 1];
        this._myTeleportParableInvalidMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
        this._myTeleportParableInvalidMaterial.color = [0.75, 0.05, 0, 1];

        this._myValidVisualLines = [];
        this._myInvalidVisualLines = [];
        this._addVisualLines(30);

        {
            let visualParams = new PP.VisualPointParams();

            if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                visualParams.myMaterial = this._myTeleportParams.myTeleportParableValidMaterial;
            } else {
                visualParams.myMaterial = this._myTeleportParableValidMaterial;
            }

            this._myValidVisualPoint = new PP.VisualPoint(visualParams);
        }

        {
            let visualParams = new PP.VisualPointParams();

            if (this._myTeleportParams.myTeleportParableInvalidMaterial != null) {
                visualParams.myMaterial = this._myTeleportParams.myTeleportParableInvalidMaterial;
            } else {
                visualParams.myMaterial = this._myTeleportParableInvalidMaterial;
            }

            this._myInvalidVisualPoint = new PP.VisualPoint(visualParams);
        }

        {
            let visualParams = new PP.VisualLineParams();

            if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                visualParams.myMaterial = this._myTeleportParams.myTeleportParableValidMaterial;
            } else {
                visualParams.myMaterial = this._myTeleportParableValidMaterial;
            }

            this._myValidVisualVerticalLine = new PP.VisualLine(visualParams);
        }

        this._myVisualTeleportPositionObject = PP.myVisualData.myRootObject.pp_addObject();

        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Torus Radius", 0.175, 0.1, 3));
        PP.myEasyTuneVariables.add(new PP.EasyTuneInt("Teleport Torus Segments", 24, 1));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Torus Thickness", 0.02, 0.1, 3));

        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Teleport Torus Inner Radius", 0.04, 0.1, 3));

        {
            let visualParams = new PP.VisualTorusParams();
            visualParams.myRadius = PP.myEasyTuneVariables.get("Teleport Torus Radius");
            visualParams.mySegmentAmount = PP.myEasyTuneVariables.get("Teleport Torus Segments");
            visualParams.mySegmentThickness = PP.myEasyTuneVariables.get("Teleport Torus Thickness");

            if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                visualParams.myMaterial = this._myTeleportParams.myTeleportParableValidMaterial;
            } else {
                visualParams.myMaterial = this._myTeleportParableValidMaterial;
            }

            visualParams.myParent = this._myVisualTeleportPositionObject;

            this._myValidVisualTeleportPositionTorus = new PP.VisualTorus(visualParams);
        }

        {
            let visualParams = new PP.VisualTorusParams();
            visualParams.myRadius = PP.myEasyTuneVariables.get("Teleport Torus Inner Radius");
            visualParams.mySegmentAmount = PP.myEasyTuneVariables.get("Teleport Torus Segments");
            visualParams.mySegmentThickness = PP.myEasyTuneVariables.get("Teleport Torus Thickness");

            if (this._myTeleportParams.myTeleportParableValidMaterial != null) {
                visualParams.myMaterial = this._myTeleportParams.myTeleportParableValidMaterial;
            } else {
                visualParams.myMaterial = this._myTeleportParableValidMaterial;
            }

            visualParams.myParent = this._myVisualTeleportPositionObject;

            let visualTorusParams = this._myValidVisualTeleportPositionTorus.getParams();

            let innerTorusCenter = (visualTorusParams.myRadius - (visualTorusParams.mySegmentThickness / 2)) / 2;
            innerTorusPosition.vec3_set(0, 0, innerTorusCenter);

            visualParams.myTransform.mat4_setPosition(innerTorusPosition);

            this._myValidVisualTeleportPositionTorusInner = new PP.VisualTorus(visualParams);
        }

        this._hideTeleportPosition();
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._detectTeleportPositionNonVR = function () {
    let mousePosition = PP.vec3_create();
    let mouseDirection = PP.vec3_create();

    let playerUp = PP.vec3_create();
    return function _detectTeleportPositionNonVR(dt) {
        this._myTeleportPositionValid = false;
        this._myTeleportDetectionValid = true;

        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        PP.myMouse.getOriginWorld(mousePosition);
        PP.myMouse.getDirectionWorld(mouseDirection);

        this._detectTeleportPositionParable(mousePosition, mouseDirection, playerUp);
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._detectTeleportPositionVR = function () {
    let leftHandOffsetPosition = [0.01, -0.04, 0.08];
    let rightHandOffsetPosition = [-0.01, -0.04, 0.08];
    let teleportStartPosition = PP.vec3_create();

    let handForward = PP.vec3_create();
    let handRight = PP.vec3_create();
    let handUp = PP.vec3_create();

    let playerUp = PP.vec3_create();
    let playerUpNegate = PP.vec3_create();
    let extraRotationAxis = PP.vec3_create();
    let teleportDirection = PP.vec3_create();
    return function _detectTeleportPositionVR(dt) {
        this._myParable.setSpeed(PP.myEasyTuneVariables.get("Parable Speed"));
        this._myParable.setGravity(PP.myEasyTuneVariables.get("Parable Gravity"));
        this._myParable.setStepLength(PP.myEasyTuneVariables.get("Parable Steps"));
        this._myTeleportParams.myMaxDistance = PP.myEasyTuneVariables.get("Teleport Max Distance");

        this._myTeleportPositionValid = false;
        this._myTeleportDetectionValid = false;

        let referenceObject = PP.myPlayerObjects.myHandLeft;
        teleportStartPosition = referenceObject.pp_convertPositionObjectToWorld(leftHandOffsetPosition, teleportStartPosition);

        handForward = referenceObject.pp_getForward(handForward);
        handRight = referenceObject.pp_getRight(handRight);
        handUp = referenceObject.pp_getUp(handUp);

        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
        playerUpNegate = playerUp.vec3_negate(playerUpNegate);

        extraRotationAxis = handForward.vec3_cross(playerUp, extraRotationAxis).vec3_normalize(extraRotationAxis);

        let teleportExtraRotationAngle = this._myTeleportParams.myTeleportReferenceExtraVerticalRotation;
        teleportDirection = handForward.vec3_rotateAxis(teleportExtraRotationAngle, extraRotationAxis, teleportDirection);

        if (!handUp.vec3_isConcordant(playerUp)) {
            teleportDirection = handForward.vec3_rotateAxis(-teleportExtraRotationAngle, extraRotationAxis, teleportDirection);
        }

        if (handForward.vec3_angle(playerUp) >= this._myTeleportParams.myForwardMinAngleToBeValidUp &&
            handForward.vec3_angle(playerUpNegate) >= this._myTeleportParams.myForwardMinAngleToBeValidDown &&
            teleportDirection.vec3_angle(playerUp) >= this._myTeleportParams.myParableForwardMinAngleToBeValidUp &&
            teleportDirection.vec3_angle(playerUpNegate) >= this._myTeleportParams.myParableForwardMinAngleToBeValidDown
        ) {
            this._myTeleportDetectionValid = true;
        }

        if (this._myTeleportDetectionValid) {
            this._detectTeleportPositionParable(teleportStartPosition, teleportDirection, playerUp);
        }
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._detectTeleportPositionParable = function () {
    let parablePosition = PP.vec3_create();
    let prevParablePosition = PP.vec3_create();
    let parableFinalPosition = PP.vec3_create();

    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();

    let parableHitPosition = PP.vec3_create();
    let parableHitNormal = PP.vec3_create();

    let verticalHitOrigin = PP.vec3_create();
    let verticalHitDirection = PP.vec3_create();

    let flatTeleportHorizontalHitNormal = PP.vec3_create();
    let flatParableHitNormal = PP.vec3_create();
    let flatParableDirectionNegate = PP.vec3_create();

    let teleportCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _detectTeleportPositionParable(startPosition, direction, up) {
        this._myParable.setStartPosition(startPosition);
        this._myParable.setForward(direction);
        this._myParable.setUp(up);

        let currentPositionIndex = 1;
        let positionFlatDistance = 0;
        let positionParableDistance = 0;
        prevParablePosition = this._myParable.getPosition(currentPositionIndex - 1, prevParablePosition);

        raycastSetup.myObjectsToIgnore.pp_clear();
        raycastSetup.myIgnoreHitsInsideCollision = true;
        raycastSetup.myBlockLayerFlags.setMask(this._myTeleportParams.myTeleportBlockLayerFlags.getMask());

        let maxParableDistance = this._myTeleportParams.myMaxDistance * 2;

        do {
            parablePosition = this._myParable.getPosition(currentPositionIndex, parablePosition);

            raycastSetup.myOrigin.vec3_copy(prevParablePosition);
            raycastSetup.myDirection = parablePosition.vec3_sub(prevParablePosition, raycastSetup.myDirection);
            raycastSetup.myDistance = raycastSetup.myDirection.vec3_length();
            raycastSetup.myDirection.vec3_normalize(raycastSetup.myDirection);

            raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

            if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                PP.myDebugVisualManager.drawRaycast(0, raycastResult);
            }

            prevParablePosition.vec3_copy(parablePosition);
            positionFlatDistance = parablePosition.vec3_sub(startPosition, parablePosition).vec3_removeComponentAlongAxis(up, parablePosition).vec3_length();
            positionParableDistance = this._myParable.getDistance(currentPositionIndex);

            currentPositionIndex++;
        } while (
            positionFlatDistance <= this._myTeleportParams.myMaxDistance &&
            positionParableDistance <= maxParableDistance &&
            !raycastResult.isColliding());

        let maxParableDistanceOverFlatDistance = this._myParable.getDistanceOverFlatDistance(this._myTeleportParams.myMaxDistance, maxParableDistance);

        let fixedPositionParableDistance = positionParableDistance;
        if (positionParableDistance > maxParableDistanceOverFlatDistance || positionParableDistance > maxParableDistance) {
            fixedPositionParableDistance = Math.min(maxParableDistanceOverFlatDistance, maxParableDistance);
        }

        this._myParableDistance = fixedPositionParableDistance;

        let hitCollisionValid = false;

        let bottomCheckMaxLength = 100;

        if (raycastResult.isColliding()) {
            let hit = raycastResult.myHits.pp_first();

            let hitParableDistance = positionParableDistance - (raycastSetup.myDistance - hit.myDistance);

            if (hitParableDistance <= fixedPositionParableDistance) {
                hitCollisionValid = true;

                this._myParableDistance = hitParableDistance;

                teleportCollisionRuntimeParams.reset();
                this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);

                parableHitPosition.vec3_copy(hit.myPosition);
                parableHitNormal.vec3_copy(hit.myNormal);

                if (!this._myTeleportPositionValid) {
                    verticalHitOrigin = hit.myPosition.vec3_add(hit.myNormal.vec3_scale(0.01, verticalHitOrigin), verticalHitOrigin);
                    verticalHitDirection = up.vec3_negate(verticalHitDirection);

                    raycastSetup.myOrigin.vec3_copy(verticalHitOrigin);
                    raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                    raycastSetup.myDistance = bottomCheckMaxLength;

                    raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                    if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                        PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                    }

                    if (raycastResult.isColliding()) {
                        let hit = raycastResult.myHits.pp_first();

                        teleportCollisionRuntimeParams.reset();
                        this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                        this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                        this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);

                        if (!this._myTeleportPositionValid && teleportCollisionRuntimeParams.myTeleportCanceled && teleportCollisionRuntimeParams.myIsCollidingHorizontally) {
                            flatTeleportHorizontalHitNormal = teleportCollisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_removeComponentAlongAxis(up, flatTeleportHorizontalHitNormal);

                            if (!flatTeleportHorizontalHitNormal.vec3_isZero(0.00001)) {
                                flatTeleportHorizontalHitNormal.vec3_normalize(flatTeleportHorizontalHitNormal);

                                let backwardStep = this._myTeleportParams.myCollisionCheckParams.myRadius * 1.1;
                                raycastSetup.myOrigin = verticalHitOrigin.vec3_add(flatTeleportHorizontalHitNormal.vec3_scale(backwardStep, raycastSetup.myOrigin), raycastSetup.myOrigin);
                                raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                                raycastSetup.myDistance = bottomCheckMaxLength;

                                raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                                if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                                    PP.myDebugVisualManager.drawPoint(0, raycastSetup.myOrigin, [0, 0, 0, 1], 0.03);
                                    PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                                }

                                if (raycastResult.isColliding()) {
                                    let hit = raycastResult.myHits.pp_first();

                                    teleportCollisionRuntimeParams.reset();
                                    this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                                    this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                                    this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);
                                }
                            }
                        }

                        if (!this._myTeleportPositionValid) {
                            flatParableHitNormal = parableHitNormal.vec3_removeComponentAlongAxis(up, flatParableHitNormal);
                            if (!flatParableHitNormal.vec3_isZero(0.00001)) {
                                flatParableHitNormal.vec3_normalize(flatParableHitNormal);

                                let backwardStep = this._myTeleportParams.myCollisionCheckParams.myRadius * 1.1;
                                raycastSetup.myOrigin = verticalHitOrigin.vec3_add(flatParableHitNormal.vec3_scale(backwardStep, raycastSetup.myOrigin), raycastSetup.myOrigin);
                                raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                                raycastSetup.myDistance = bottomCheckMaxLength;

                                raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                                if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                                    PP.myDebugVisualManager.drawPoint(0, raycastSetup.myOrigin, [0, 0, 0, 1], 0.03);
                                    PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                                }

                                if (raycastResult.isColliding()) {
                                    let hit = raycastResult.myHits.pp_first();

                                    teleportCollisionRuntimeParams.reset();
                                    this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                                    this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                                    this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);
                                }
                            }
                        }

                        if (!this._myTeleportPositionValid) {
                            flatParableDirectionNegate = direction.vec3_negate(flatParableDirectionNegate).vec3_removeComponentAlongAxis(up, flatParableDirectionNegate).vec3_normalize(flatParableDirectionNegate);

                            if (!flatParableDirectionNegate.vec3_isZero(0.00001)) {
                                flatParableDirectionNegate.vec3_normalize(flatParableDirectionNegate);

                                let backwardStep = this._myTeleportParams.myCollisionCheckParams.myRadius * 1.1;
                                raycastSetup.myOrigin = verticalHitOrigin.vec3_add(flatParableDirectionNegate.vec3_scale(backwardStep, raycastSetup.myOrigin), raycastSetup.myOrigin);
                                raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                                raycastSetup.myDistance = bottomCheckMaxLength;

                                raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                                if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                                    PP.myDebugVisualManager.drawPoint(0, raycastSetup.myOrigin, [0, 0, 0, 1], 0.03);
                                    PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                                }

                                if (raycastResult.isColliding()) {
                                    let hit = raycastResult.myHits.pp_first();

                                    teleportCollisionRuntimeParams.reset();
                                    this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                                    this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                                    this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!hitCollisionValid) {
            parableFinalPosition = this._myParable.getPositionByDistance(this._myParableDistance, parableFinalPosition);

            verticalHitOrigin.vec3_copy(parableFinalPosition);
            verticalHitDirection = up.vec3_negate(verticalHitDirection);

            raycastSetup.myOrigin.vec3_copy(verticalHitOrigin);
            raycastSetup.myDirection.vec3_copy(verticalHitDirection);
            raycastSetup.myDistance = bottomCheckMaxLength;

            raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

            if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                PP.myDebugVisualManager.drawRaycast(0, raycastResult);
            }

            if (raycastResult.isColliding()) {
                let hit = raycastResult.myHits.pp_first();

                teleportCollisionRuntimeParams.reset();
                this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);

                if (!this._myTeleportPositionValid && teleportCollisionRuntimeParams.myTeleportCanceled && teleportCollisionRuntimeParams.myIsCollidingHorizontally) {
                    flatTeleportHorizontalHitNormal = teleportCollisionRuntimeParams.myHorizontalCollisionHit.myNormal.vec3_removeComponentAlongAxis(up, flatTeleportHorizontalHitNormal);

                    if (!flatTeleportHorizontalHitNormal.vec3_isZero(0.00001)) {
                        flatTeleportHorizontalHitNormal.vec3_normalize(flatTeleportHorizontalHitNormal);

                        let backwardStep = this._myTeleportParams.myCollisionCheckParams.myRadius * 1.1;
                        raycastSetup.myOrigin = verticalHitOrigin.vec3_add(flatTeleportHorizontalHitNormal.vec3_scale(backwardStep, raycastSetup.myOrigin), raycastSetup.myOrigin);
                        raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                        raycastSetup.myDistance = bottomCheckMaxLength;

                        raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                        if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                            PP.myDebugVisualManager.drawPoint(0, raycastSetup.myOrigin, [0, 0, 0, 1], 0.03);
                            PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                        }

                        if (raycastResult.isColliding()) {
                            let hit = raycastResult.myHits.pp_first();

                            teleportCollisionRuntimeParams.reset();
                            this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                            this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                            this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);
                        }
                    }
                }

                if (!this._myTeleportPositionValid) {
                    flatParableDirectionNegate = direction.vec3_negate(flatParableDirectionNegate).vec3_removeComponentAlongAxis(up, flatParableDirectionNegate).vec3_normalize(flatParableDirectionNegate);

                    if (!flatParableDirectionNegate.vec3_isZero(0.00001)) {
                        flatParableDirectionNegate.vec3_normalize(flatParableDirectionNegate);

                        let backwardStep = this._myTeleportParams.myCollisionCheckParams.myRadius * 1.1;
                        raycastSetup.myOrigin = verticalHitOrigin.vec3_add(flatParableDirectionNegate.vec3_scale(backwardStep, raycastSetup.myOrigin), raycastSetup.myOrigin);
                        raycastSetup.myDirection.vec3_copy(verticalHitDirection);
                        raycastSetup.myDistance = bottomCheckMaxLength;

                        raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                        if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugDetectActive) {
                            PP.myDebugVisualManager.drawPoint(0, raycastSetup.myOrigin, [0, 0, 0, 1], 0.03);
                            PP.myDebugVisualManager.drawRaycast(0, raycastResult);
                        }

                        if (raycastResult.isColliding()) {
                            let hit = raycastResult.myHits.pp_first();

                            teleportCollisionRuntimeParams.reset();
                            this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRuntimeParams.myTeleportRotationOnUp, teleportCollisionRuntimeParams);

                            this._myTeleportRuntimeParams.myTeleportPosition.vec3_copy(teleportCollisionRuntimeParams.myNewPosition);
                            this._myTeleportSurfaceNormal.vec3_copy(teleportCollisionRuntimeParams.myGroundNormal);
                        }
                    }
                }
            }
        }
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._detectTeleportRotationVR = function () {
    let axesVec3 = PP.vec3_create();
    let axesForward = PP.vec3_create(0, 0, 1);
    let axesUp = PP.vec3_create(0, 1, 0);
    return function _detectTeleportRotationVR(dt) {
        let axes = PP.myLeftGamepad.getAxesInfo().getAxes();

        if (axes.vec2_length() > this._myTeleportParams.myRotationOnUpMinStickIntensity) {
            this._myTeleportRuntimeParams.myTeleportRotationOnUp = this._myTeleportRotationOnUpNext;

            axesVec3.vec3_set(axes[0], 0, axes[1]);
            this._myTeleportRotationOnUpNext = axesVec3.vec3_angleSigned(axesForward, axesUp);
        }

        if (!this._myTeleportParams.myRotationOnUpActive) {
            this._myTeleportRuntimeParams.myTeleportRotationOnUp = 0;
            this._myTeleportRotationOnUpNext = 0;
        }
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._showTeleportParable = function () {
    let currentPosition = PP.vec3_create();
    let nextPosition = PP.vec3_create();

    let playerUp = PP.vec3_create();
    let upDifference = PP.vec3_create();
    return function _showTeleportParable(dt) {
        let showParableDistance = Math.max(this._myParableDistance - this._myTeleportParams.myTeleportParableLineEndOffset);
        let lastParableIndex = this._myParable.getPositionIndexByDistance(showParableDistance);
        let lastParableIndexDistance = this._myParable.getDistance(lastParableIndex);

        if (lastParableIndex + 1 > this._myValidVisualLines.length) {
            this._addVisualLines(lastParableIndex + 1, this._myValidVisualLines.length);
        }

        for (let i = 0; i <= lastParableIndex; i++) {
            currentPosition = this._myParable.getPosition(i, currentPosition);
            nextPosition = this._myParable.getPosition(i + 1, nextPosition);

            let visuaLine = (this._myTeleportPositionValid) ? this._myValidVisualLines[i] : this._myInvalidVisualLines[i];

            let currentVisualLineParams = visuaLine.getParams();

            if (i == lastParableIndex) {
                let stepLength = Math.max(0, showParableDistance - lastParableIndexDistance);
                nextPosition = nextPosition.vec3_sub(currentPosition, nextPosition).vec3_normalize(nextPosition);
                nextPosition = currentPosition.vec3_add(nextPosition.vec3_scale(stepLength, nextPosition), nextPosition);
            }

            currentVisualLineParams.setStartEnd(currentPosition, nextPosition);
            currentVisualLineParams.myThickness = 0.005;

            visuaLine.paramsUpdated();
            visuaLine.setVisible(true);

            if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugShowActive) {
                PP.myDebugVisualManager.drawPoint(0, currentPosition, [1, 0, 0, 1], 0.01);
            }
        }

        let visualPoint = (this._myTeleportPositionValid) ? this._myValidVisualPoint : this._myInvalidVisualPoint;
        let visualPointParams = visualPoint.getParams();
        visualPointParams.myPosition.vec3_copy(nextPosition);
        visualPointParams.myRadius = 0.01;
        visualPoint.paramsUpdated();
        visualPoint.setVisible(true);

        if (this._myTeleportPositionValid) {
            playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            upDifference = nextPosition.vec3_sub(this._myTeleportRuntimeParams.myTeleportPosition, upDifference).vec3_componentAlongAxis(playerUp, upDifference);
            let upDistance = upDifference.vec3_length();
            if (upDistance >= this._myTeleportParams.myTeleportParableMinVerticalDistanceToShowVerticalLine) {
                let lineLength = Math.min(upDistance - this._myTeleportParams.myTeleportParableMinVerticalDistanceToShowVerticalLine, this._myTeleportParams.myTeleportParableMinVerticalDistanceToShowVerticalLine);

                let visualLineParams = this._myValidVisualVerticalLine.getParams();

                visualLineParams.myStart.vec3_copy(nextPosition);
                visualLineParams.myDirection = playerUp.vec3_negate(visualLineParams.myDirection);
                visualLineParams.myLength = lineLength;
                visualLineParams.myThickness = 0.005;

                this._myValidVisualVerticalLine.paramsUpdated();
                this._myValidVisualVerticalLine.setVisible(true);

            }

            this._showTeleportParablePosition(dt);
        } else {
            this._myVisualTeleportTransformQuatReset = true;
            this._myVisualTeleportTransformPositionLerping = false;
            this._myVisualTeleportTransformRotationLerping = false;
        }
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._showTeleportParablePosition = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();

    let visualPosition = PP.vec3_create();
    let visualForward = PP.vec3_create();
    let visualRotationQuat = PP.quat_create();

    let currentVisualTeleportTransformQuat = PP.quat2_create();
    let currentVisualTeleportPosition = PP.vec3_create();
    let currentVisualTeleportRotationQuat = PP.quat_create();
    let differenceRotationQuat = PP.quat_create();

    return function _showTeleportParablePosition(dt) {
        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
        feetTransformQuat = this._myTeleportParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
        feetRotationQuat = feetRotationQuat.quat_rotateAxis(this._myTeleportRuntimeParams.myTeleportRotationOnUp, playerUp, feetRotationQuat);
        visualForward = feetRotationQuat.quat_getForward(visualForward);

        visualPosition = this._myTeleportRuntimeParams.myTeleportPosition.vec3_add(playerUp.vec3_scale(this._myTeleportParams.myTeleportParablePositionUpOffset, visualPosition), visualPosition);

        if (this._myTeleportParams.myTeleportParablePositionVisualAlignOnSurface) {
            visualRotationQuat.quat_setUp(this._myTeleportSurfaceNormal, visualForward);
        } else {
            visualRotationQuat.quat_setUp(playerUp, visualForward);
        }

        this._myVisualTeleportTransformQuat.quat2_setPositionRotationQuat(visualPosition, visualRotationQuat);

        if (this._myVisualTeleportTransformQuatReset || !this._myTeleportParams.myVisualTeleportPositionLerpActive) {
            this._myVisualTeleportPositionObject.pp_setTransformQuat(this._myVisualTeleportTransformQuat);
            this._myVisualTeleportTransformQuatReset = false;
        } else {
            currentVisualTeleportTransformQuat = this._myVisualTeleportPositionObject.pp_getTransformQuat(currentVisualTeleportTransformQuat);
            currentVisualTeleportPosition = currentVisualTeleportTransformQuat.quat2_getPosition(currentVisualTeleportPosition);
            currentVisualTeleportRotationQuat = currentVisualTeleportTransformQuat.quat2_getRotationQuat(currentVisualTeleportRotationQuat);
            currentVisualTeleportRotationQuat.quat_rotationToQuat(visualRotationQuat, differenceRotationQuat);

            let positionDistance = currentVisualTeleportPosition.vec3_distance(visualPosition);
            let rotationAngleDistance = differenceRotationQuat.quat_getAngle();

            if ((!this._myVisualTeleportTransformPositionLerping || positionDistance < this._myTeleportParams.myVisualTeleportPositionMinDistanceToResetLerp) &&
                (positionDistance < this._myTeleportParams.myVisualTeleportPositionMinDistanceToLerp ||
                    positionDistance > this._myTeleportParams.myVisualTeleportPositionMaxDistanceToLerp)) {
                this._myVisualTeleportTransformPositionLerping = false;
                currentVisualTeleportPosition.vec3_copy(visualPosition);
            } else {
                this._myVisualTeleportTransformPositionLerping = true;

                let interpolationValue = this._myTeleportParams.myVisualTeleportPositionLerpFactor * dt;
                if (positionDistance < this._myTeleportParams.myVisualTeleportPositionMinDistanceToCloseLerpFactor) {
                    interpolationValue = this._myTeleportParams.myVisualTeleportPositionCloseLerpFactor * dt;
                }
                currentVisualTeleportPosition.vec3_lerp(visualPosition, interpolationValue, currentVisualTeleportPosition);
            }

            if ((!this._myVisualTeleportTransformRotationLerping || rotationAngleDistance < this._myTeleportParams.myVisualTeleportPositionMinAngleDistanceToResetLerp) &&
                (rotationAngleDistance < this._myTeleportParams.myVisualTeleportPositionMinAngleDistanceToLerp ||
                    positionDistance > this._myTeleportParams.myVisualTeleportPositionMaxAngleDistanceToLerp)) {
                this._myVisualTeleportTransformRotationLerping = false;
                currentVisualTeleportRotationQuat.quat_copy(visualRotationQuat);
            } else {
                let interpolationValue = this._myTeleportParams.myVisualTeleportPositionLerpFactor * dt;

                this._myVisualTeleportTransformRotationLerping = true;
                currentVisualTeleportRotationQuat.quat_slerp(visualRotationQuat, interpolationValue, currentVisualTeleportRotationQuat);
            }

            currentVisualTeleportTransformQuat.quat2_setPositionRotationQuat(currentVisualTeleportPosition, currentVisualTeleportRotationQuat);
            this._myVisualTeleportPositionObject.pp_setTransformQuat(currentVisualTeleportTransformQuat);
        }

        {
            let visualParams = this._myValidVisualTeleportPositionTorus.getParams();
            visualParams.myRadius = PP.myEasyTuneVariables.get("Teleport Torus Radius");
            visualParams.mySegmentAmount = PP.myEasyTuneVariables.get("Teleport Torus Segments");
            visualParams.mySegmentThickness = PP.myEasyTuneVariables.get("Teleport Torus Thickness");

            this._myValidVisualTeleportPositionTorus.paramsUpdated();
        }

        {
            let visualParams = this._myValidVisualTeleportPositionTorusInner.getParams();
            visualParams.myRadius = PP.myEasyTuneVariables.get("Teleport Torus Inner Radius");
            visualParams.mySegmentAmount = PP.myEasyTuneVariables.get("Teleport Torus Segments");
            visualParams.mySegmentThickness = PP.myEasyTuneVariables.get("Teleport Torus Thickness");

            this._myValidVisualTeleportPositionTorusInner.paramsUpdated();
        }

        this._myValidVisualTeleportPositionTorus.setVisible(true);
        this._myValidVisualTeleportPositionTorusInner.setVisible(true);

        if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugShowActive) {
            PP.myDebugVisualManager.drawPoint(0, this._myTeleportRuntimeParams.myTeleportPosition, [0, 0, 1, 1], 0.02);
        }
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._isTeleportHitValid = function () {
    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();

    let playerUp = PP.vec3_create();
    return function _isTeleportHitValid(hit, rotationOnUp, checkTeleportCollisionRuntimeParams) {
        let isValid = false;

        if (hit.isValid() && !hit.myIsInsideCollision) {
            playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            if (true || hit.myNormal.vec3_isConcordant(playerUp)) {
                // #TODO when the flags on the physx will be available just check that the hit object physx has the floor flag

                raycastSetup.myObjectsToIgnore.pp_clear();
                raycastSetup.myIgnoreHitsInsideCollision = true;
                raycastSetup.myBlockLayerFlags.setMask(this._myTeleportParams.myTeleportFloorLayerFlags.getMask());

                let distanceToCheck = 0.01;
                raycastSetup.myOrigin = hit.myPosition.vec3_add(hit.myNormal.vec3_scale(distanceToCheck, raycastSetup.myOrigin), raycastSetup.myOrigin);
                raycastSetup.myDirection = hit.myNormal.vec3_negate(raycastSetup.myDirection);
                raycastSetup.myDistance = distanceToCheck * 1.25;
                raycastSetup.myDirection.vec3_normalize(raycastSetup.myDirection);

                raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

                if (raycastResult.isColliding()) {
                    let floorHit = raycastResult.myHits.pp_first();
                    if (floorHit.myObject.pp_equals(hit.myObject)) {
                        isValid = this._isTeleportPositionValid(hit.myPosition, rotationOnUp, checkTeleportCollisionRuntimeParams);
                    }
                }
            }
        }

        return isValid;
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._isTeleportPositionValid = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let feetPosition = PP.vec3_create();
    let differenceOnUpVector = PP.vec3_create();
    let teleportCheckCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _isTeleportPositionValid(teleportPosition, rotationOnUp, checkTeleportCollisionRuntimeParams) {
        let isValid = false;

        let positionVisible = this._isTeleportPositionVisible(teleportPosition);

        if (positionVisible) {
            playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            feetTransformQuat = this._myTeleportParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
            feetPosition = feetTransformQuat.quat2_getPosition(feetPosition);
            if (rotationOnUp != 0) {
                feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
                feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
                feetTransformQuat.quat2_setPositionRotationQuat(feetPosition, feetRotationQuat);
            }

            let differenceOnUp = teleportPosition.vec3_sub(feetPosition, differenceOnUpVector).vec3_componentAlongAxis(playerUp, differenceOnUpVector).vec3_length();

            if (differenceOnUp < this._myTeleportParams.myMaxHeightDifference + 0.00001) {
                let teleportCheckValid = false;
                teleportCheckCollisionRuntimeParams.copy(this._myLocomotionRuntimeParams.myCollisionRuntimeParams);

                if (!this._myTeleportParams.myPerformTeleportAsMovement) {
                    this._checkTeleport(teleportPosition, feetTransformQuat, teleportCheckCollisionRuntimeParams, checkTeleportCollisionRuntimeParams);
                } else {
                    this._checkTeleportAsMovement(teleportPosition, feetTransformQuat, teleportCheckCollisionRuntimeParams, checkTeleportCollisionRuntimeParams);
                }

                if (!teleportCheckCollisionRuntimeParams.myTeleportCanceled) {
                    teleportCheckValid = true;
                }

                if (teleportCheckValid && (!this._myTeleportParams.myMustBeOnGround || teleportCheckCollisionRuntimeParams.myIsOnGround)) {

                    let groundAngleValid = true;
                    let isTeleportingUpward = teleportCheckCollisionRuntimeParams.myNewPosition.vec3_isFurtherAlongDirection(feetPosition, playerUp);
                    if (isTeleportingUpward) {
                        groundAngleValid = teleportCheckCollisionRuntimeParams.myGroundAngle < this._myTeleportParams.myGroundAngleToIgnoreUpward + 0.0001;
                    }

                    if (groundAngleValid) {
                        isValid = true;
                    }
                }
            }
        }

        return isValid;
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._isTeleportPositionVisible = function () {
    let playerUp = PP.vec3_create();

    let offsetFeetTeleportPosition = PP.vec3_create();
    let headTeleportPosition = PP.vec3_create();
    return function _isTeleportPositionVisible(teleportPosition) {
        let isVisible = true;

        if (this._myTeleportParams.myTeleportFeetPositionMustBeVisible ||
            this._myTeleportParams.myTeleportHeadPositionMustBeVisible ||
            this._myTeleportParams.myTeleportHeadOrFeetPositionMustBeVisible) {

            playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);
            let isHeadVisible = false;
            let isFeetVisible = false;

            if (this._myTeleportParams.myTeleportHeadOrFeetPositionMustBeVisible ||
                this._myTeleportParams.myTeleportHeadPositionMustBeVisible) {
                let headheight = this._myTeleportParams.myPlayerHeadManager.getHeadHeight();
                headTeleportPosition = teleportPosition.vec3_add(playerUp.vec3_scale(headheight, headTeleportPosition), headTeleportPosition);
                isHeadVisible = this._isPositionVisible(headTeleportPosition);
            } else {
                isHeadVisible = true;
            }

            if (this._myTeleportParams.myTeleportHeadOrFeetPositionMustBeVisible && isHeadVisible) {
                isFeetVisible = true;
            } else {
                if (this._myTeleportParams.myTeleportHeadOrFeetPositionMustBeVisible ||
                    (this._myTeleportParams.myTeleportFeetPositionMustBeVisible && isHeadVisible)) {
                    offsetFeetTeleportPosition = teleportPosition.vec3_add(playerUp.vec3_scale(this._myTeleportParams.myVisibilityCheckFeetPositionVerticalOffset, offsetFeetTeleportPosition), offsetFeetTeleportPosition);
                    isFeetVisible = this._isPositionVisible(offsetFeetTeleportPosition);
                } else {
                    isFeetVisible = true;
                }
            }

            isVisible = isHeadVisible && isFeetVisible;
        }

        return isVisible;
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._isPositionVisible = function () {
    let playerUp = PP.vec3_create();
    let standardUp = PP.vec3_create(0, 1, 0);
    let standardForward = PP.vec3_create(0, 0, 1);
    let referenceUp = PP.vec3_create();
    let headPosition = PP.vec3_create();
    let direction = PP.vec3_create();
    let fixedRight = PP.vec3_create();
    let fixedForward = PP.vec3_create();
    let fixedUp = PP.vec3_create();
    let raycastEndPosition = PP.vec3_create();

    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();
    return function _isPositionVisible(position) {
        let isVisible = true;

        playerUp = this._myTeleportParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        let currentHead = this._myTeleportParams.myPlayerHeadManager.getCurrentHead();
        headPosition = currentHead.pp_getPosition(headPosition);
        direction = position.vec3_sub(headPosition, direction).vec3_normalize(direction);

        referenceUp.vec3_copy(standardUp);
        if (direction.vec3_angle(standardUp) < 0.0001) {
            referenceUp.vec3_copy(standardForward);
        }

        fixedRight = direction.vec3_cross(referenceUp, fixedRight);
        fixedUp = fixedRight.vec3_cross(direction, fixedUp);
        fixedForward.vec3_copy(direction);

        fixedUp.vec3_normalize(fixedUp);
        fixedForward.vec3_normalize(fixedForward);

        let checkPositions = this._getVisibilityCheckPositions(headPosition, fixedUp, fixedForward);

        let distance = headPosition.vec3_distance(position);

        for (let checkPosition of checkPositions) {
            raycastSetup.myOrigin.vec3_copy(checkPosition);
            raycastSetup.myDirection.vec3_copy(fixedForward);
            raycastSetup.myDistance = distance;

            raycastSetup.myBlockLayerFlags.setMask(this._myTeleportParams.myVisibilityBlockLayerFlags.getMask());

            raycastSetup.myObjectsToIgnore = this._myTeleportParams.myCollisionCheckParams.myObjectsToIgnore;
            raycastSetup.myIgnoreHitsInsideCollision = true;

            raycastResult = PP.PhysicsUtils.raycast(raycastSetup, raycastResult);

            if (this._myTeleportParams.myDebugActive && this._myTeleportParams.myDebugVisibilityActive) {
                PP.myDebugVisualManager.drawRaycast(0, raycastResult);
            }

            if (raycastResult.isColliding()) {
                raycastEndPosition = checkPosition.vec3_add(fixedForward.vec3_scale(distance, raycastEndPosition), raycastEndPosition);
                let hit = raycastResult.myHits.pp_first();

                if (this._myTeleportParams.myVisibilityCheckDistanceFromHitThreshold == 0 || hit.myPosition.vec3_distance(raycastEndPosition) > this._myTeleportParams.myVisibilityCheckDistanceFromHitThreshold + 0.00001) {
                    isVisible = false;
                    break;
                }
            }
        }

        return isVisible;
    };
}();

PlayerLocomotionTeleportDetectionState.prototype._getVisibilityCheckPositions = function () {
    let checkPositions = [];
    let cachedCheckPositions = [];
    let currentCachedCheckPositionIndex = 0;
    let _localGetCachedCheckPosition = function () {
        let item = null;
        while (cachedCheckPositions.length <= currentCachedCheckPositionIndex) {
            cachedCheckPositions.push(PP.vec3_create());
        }

        item = cachedCheckPositions[currentCachedCheckPositionIndex];
        currentCachedCheckPositionIndex++;
        return item;
    };

    let currentDirection = PP.vec3_create();
    return function _getVisibilityCheckPositions(position, up, forward) {
        checkPositions.length = 0;
        currentCachedCheckPositionIndex = 0;

        {
            let tempCheckPosition = _localGetCachedCheckPosition();
            tempCheckPosition.vec3_copy(position);
            checkPositions.push(tempCheckPosition);
        }

        let radiusStep = this._myTeleportParams.myVisibilityCheckRadius / this._myTeleportParams.myVisibilityCheckCircumferenceStepAmount;
        let sliceAngle = 360 / this._myTeleportParams.myVisibilityCheckCircumferenceSliceAmount;
        let currentStepRotation = 0;
        for (let i = 0; i < this._myTeleportParams.myVisibilityCheckCircumferenceStepAmount; i++) {
            let currentRadius = radiusStep * (i + 1);

            currentDirection = up.vec3_rotateAxis(currentStepRotation, forward, currentDirection);
            for (let j = 0; j < this._myTeleportParams.myVisibilityCheckCircumferenceSliceAmount; j++) {
                let tempCheckPosition = _localGetCachedCheckPosition();
                let sliceDirection = currentDirection.vec3_rotateAxis(sliceAngle * j, forward, tempCheckPosition);
                checkPositions.push(position.vec3_add(sliceDirection.vec3_scale(currentRadius, sliceDirection), sliceDirection));
            }

            currentStepRotation += this._myTeleportParams.myVisibilityCheckCircumferenceRotationPerStep;
        }

        return checkPositions;
    };
}();