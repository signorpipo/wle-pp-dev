WL.registerComponent('stick-movement', {
    _myScale: { type: WL.Type.Float, default: 1.0 },
    _mySpeed: { type: WL.Type.Float, default: 4.0 },
    _myFlyEnabled: { type: WL.Type.Bool, default: false },
    _myMinAngleToFlyUpHead: { type: WL.Type.Float, default: 30 },
    _myMinAngleToFlyDownHead: { type: WL.Type.Float, default: 50 },
    _myMinAngleToFlyUpHand: { type: WL.Type.Float, default: 60 },
    _myMinAngleToFlyDownHand: { type: WL.Type.Float, default: 1 },
    _myMinAngleToFlyRight: { type: WL.Type.Float, default: 30 },
    _myDirectionReference: { type: WL.Type.Enum, values: ['head', 'hand left', 'hand right'], default: 'hand left' }

}, {
    start() {
        let directionConverterHeadParams = new Direction2DTo3DConverterParams();
        directionConverterHeadParams.myAutoUpdateFly = this._myFlyEnabled;
        directionConverterHeadParams.myMinAngleToFlyForwardUp = this._myMinAngleToFlyUpHead;
        directionConverterHeadParams.myMinAngleToFlyForwardDown = this._myMinAngleToFlyDownHead;
        directionConverterHeadParams.myMinAngleToFlyRightUp = this._myMinAngleToFlyRight;
        directionConverterHeadParams.myMinAngleToFlyRightDown = this._myMinAngleToFlyRight;
        directionConverterHeadParams.myStopFlyingWhenZero = false;

        let directionConverterHandParams = new Direction2DTo3DConverterParams();
        directionConverterHandParams.myAutoUpdateFly = this._myFlyEnabled;
        directionConverterHandParams.myMinAngleToFlyForwardUp = this._myMinAngleToFlyUpHand;
        directionConverterHandParams.myMinAngleToFlyForwardDown = this._myMinAngleToFlyDownHand;
        directionConverterHandParams.myMinAngleToFlyRightUp = this._myMinAngleToFlyRight;
        directionConverterHandParams.myMinAngleToFlyRightDown = this._myMinAngleToFlyRight;
        directionConverterHandParams.myStopFlyingWhenZero = false;

        this._myDirectionConverterHead = new Direction2DTo3DConverter(directionConverterHeadParams);
        this._myDirectionConverterHand = new Direction2DTo3DConverter(directionConverterHandParams);

        this._myCollisionCheck = new CollisionCheck();
        this._myCollisionCheckParams = null;
        this._myCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myDirectionReferenceObject = PP.myPlayerObjects.myHead;
        this._mySessionActive = false;

        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));

        this._myStickIdleTimer = new PP.Timer(0.25, false);
        this._myIsFlying = false;

        this._myFirstTime = true;

        this._myInitialHeight = 0;
    },
    update(dt) {
        if (this._myFirstTime) {
            this._myFirstTime = false;

            this._setupCollisionCheckParams();
        }

        if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.SELECT).isPressed()) {
            let mesh = this.object.pp_getComponentHierarchy("mesh");
            let physX = this.object.pp_getComponentHierarchy("physx");

            let scale = mesh.object.pp_getScale();
            scale[1] = this._myInitialHeight / 4;
            mesh.object.pp_setScale(scale);
            physX.extents = scale;
            physX.active = false;
            physX.active = true;

            let position = mesh.object.pp_getPositionLocal();
            position[1] = this._myInitialHeight / (4 * this._myScale);
            mesh.object.pp_setPositionLocal(position);

            this._myCollisionCheckParams.myHeight = this._myInitialHeight / 2;
        } else {
            let mesh = this.object.pp_getComponentHierarchy("mesh");
            let physX = this.object.pp_getComponentHierarchy("physx");

            let scale = mesh.object.pp_getScale();
            scale[1] = this._myInitialHeight / 2;
            mesh.object.pp_setScale(scale);
            physX.extents = scale;
            physX.active = false;
            physX.active = true;

            let position = mesh.object.pp_getPositionLocal();
            position[1] = this._myInitialHeight / (2 * this._myScale);
            mesh.object.pp_setPositionLocal(position);

            this._myCollisionCheckParams.myHeight = this._myInitialHeight;
        }

        let up = this.object.pp_getUp();

        let movement = [0, 0, 0];

        let minIntensityThreshold = 0.1;
        let axes = PP.myLeftGamepad.getAxesInfo().getAxes();
        axes[0] = Math.abs(axes[0]) > minIntensityThreshold ? axes[0] : 0;
        axes[1] = Math.abs(axes[1]) > minIntensityThreshold ? axes[1] : 0;

        if (!axes.vec2_isZero()) {
            this._myStickIdleTimer.start();
            let movementDirection = null;
            if (this._mySessionActive && this._myDirectionReference != 0) {
                movementDirection = this._myDirectionConverterHand.convert(axes, this._myDirectionReferenceObject.pp_getTransform(), up);
            } else {
                movementDirection = this._myDirectionConverterHead.convert(axes, this._myDirectionReferenceObject.pp_getTransform(), up);
            }

            if (!movementDirection.vec3_isZero()) {
                this._myIsFlying = this._myIsFlying || movementDirection.vec3_componentAlongAxis(up).vec3_length() > 0.0001;

                let movementIntensity = axes.vec2_length();
                let speed = Math.pp_lerp(0, this._mySpeed, movementIntensity);
                movementDirection.vec3_scale(speed * this._myScale * dt, movement);
            }
        } else {
            if (this._myStickIdleTimer.isRunning()) {
                this._myStickIdleTimer.update(dt);
                if (this._myStickIdleTimer.isDone()) {
                    this._myDirectionConverterHead.reset();
                    this._myDirectionConverterHand.reset();
                }
            }
        }

        if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.TOP_BUTTON).isPressed()) {
            movement.vec3_add([0, this._mySpeed * this._myScale * dt, 0], movement);
            this._myIsFlying = true;
        } else if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressed()) {
            movement.vec3_add([0, -this._mySpeed * this._myScale * dt, 0], movement);
            this._myIsFlying = true;
        }

        if (PP.myLeftGamepad.getButtonInfo(PP.ButtonType.BOTTOM_BUTTON).isPressEnd(2)) {
            this._myIsFlying = false;
        }

        if (!this._myIsFlying) {
            movement.vec3_add(up.vec3_scale(-3 * this._myScale * dt), movement);
        }

        let fixedMovement = this._myCollisionCheck.fixMovement(movement, this.object.pp_getTransformQuat(), this._myCollisionCheckParams, this._myCollisionRuntimeParams);

        this.object.pp_translate(fixedMovement);

        if (this._myCollisionRuntimeParams.myIsOnGround) {
            this._myIsFlying = false;
            this._myDirectionConverterHead.stopFlying();
            this._myDirectionConverterHand.stopFlying();
        }
    },
    _setupCollisionCheckParams() {
        this._myCollisionCheckParams = new CollisionCheckParams();

        this._myCollisionCheckParams.mySplitMovementEnabled = false;
        this._myCollisionCheckParams.mySplitMovementMaxLength = 0;

        this._myCollisionCheckParams.myRadius = 0.3 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromFeetToIgnore = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromHeadToIgnore = 0.1 * this._myScale;

        this._myCollisionCheckParams.myHorizontalMovementStepEnabled = false;
        this._myCollisionCheckParams.myHorizontalMovementStepMaxLength = 0;
        this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount = 1;
        this._myCollisionCheckParams.myHorizontalMovementCheckDiagonal = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckStraight = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckHorizontalBorder = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraight = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonal = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;

        this._myCollisionCheckParams.myHalfConeAngle = 60;
        this._myCollisionCheckParams.myHalfConeSliceAmount = 1;
        this._myCollisionCheckParams.myCheckConeBorder = true;
        this._myCollisionCheckParams.myCheckConeRay = true;

        this._myCollisionCheckParams.myFeetRadius = 0.1 * this._myScale;
        this._myCollisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle = true;

        this._myCollisionCheckParams.mySnapOnGroundEnabled = true;
        this._myCollisionCheckParams.mySnapOnGroundExtraDistance = 0.1 * this._myScale;
        this._myCollisionCheckParams.mySnapOnCeilingEnabled = false;
        this._myCollisionCheckParams.mySnapOnCeilingExtraDistance = 0.1 * this._myScale;

        this._myCollisionCheckParams.myGroundCircumferenceSliceAmount = 4;
        this._myCollisionCheckParams.myGroundCircumferenceStepAmount = 1;
        this._myCollisionCheckParams.myGroundCircumferenceRotationPerStep = 22.5;
        this._myCollisionCheckParams.myGroundFixDistanceFromFeet = 0.1 * this._myScale;
        this._myCollisionCheckParams.myGroundFixDistanceFromHead = 0.1 * this._myScale;

        this._myCollisionCheckParams.myCheckHeight = true;
        this._myCollisionCheckParams.myHeightCheckStepAmount = 1;
        this._myCollisionCheckParams.myCheckVerticalStraight = true;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRay = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorder = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRay = false;

        this._myCollisionCheckParams.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParams.myCeilingAngleToIgnore = 30;

        let mesh = this.object.pp_getComponentHierarchy("mesh");
        this._myCollisionCheckParams.myHeight = mesh.object.pp_getScale()[1] * 2;
        this._myInitialHeight = this._myCollisionCheckParams.myHeight;

        this._myCollisionCheckParams.myDistanceToBeOnGround = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeGroundInfo = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceToBeOnCeiling = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeCeilingInfo = 0.1 * this._myScale;

        this._myCollisionCheckParams.mySlidingEnabled = true;
        this._myCollisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal = true;
        this._myCollisionCheckParams.mySlidingMaxAttempts = 4;
        this._myCollisionCheckParams.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParams.mySlidingFlickeringPreventionType = 1;      // expensive, 2 times the check for the whole horizontal movement!

        this._myCollisionCheckParams.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this._myCollisionCheckParams.myBlockLayerFlags.setAllFlagsActive(true);
        let physXComponents = this.object.pp_getComponentsHierarchy("physx");
        for (let physXComponent of physXComponents) {
            this._myCollisionCheckParams.myObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first.pp_equals(second));
        }

        this._myCollisionCheckParams.myDebugActive = false;
    },
    _onXRSessionStart() {
        if (this._myDirectionReference == 0) {
            this._myDirectionReferenceObject = PP.myPlayerObjects.myHead;
        } else if (this._myDirectionReference == 1) {
            this._myDirectionReferenceObject = PP.myPlayerObjects.myHandLeft;
        } else {
            this._myDirectionReferenceObject = PP.myPlayerObjects.myHandRight;
        }
        this._mySessionActive = true;
    },
    _onXRSessionEnd() {
        this._mySessionActive = false;
        this._myDirectionReferenceObject = PP.myPlayerObjects.myHead;
    },
    pp_clone(clonedObject, deepCloneParams, extraData) {
        let clonedComponent = clonedObject.pp_addComponent(this.type, {
            "_myScale": this._myScale,
            "_mySpeed": this._mySpeed,
            "_myFlyEnabled": this._myFlyEnabled,
            "_myMinAngleToFlyUpHead": this._myMinAngleToFlyUpHead,
            "_myMinAngleToFlyDownHead": this._myMinAngleToFlyDownHead,
            "_myMinAngleToFlyUpHand": this._myMinAngleToFlyUpHand,
            "_myMinAngleToFlyDownHand": this._myMinAngleToFlyDownHand,
            "_myMinAngleToFlyRight": this._myMinAngleToFlyRight,
            "_myDirectionReference": this._myDirectionReference,
        });

        clonedComponent.active = this.active;

        return clonedComponent;
    }
});