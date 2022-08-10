PlayerLocomotionTeleportParams = class PlayerLocomotionTeleportParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myMaxDistance = 0;
        this.myTeleportPositionMustBeVisible = false; // implement

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myDebugActive = false;
    }
};

PlayerLocomotionTeleport = class PlayerLocomotionTeleport {
    constructor(params) {
        this._myParams = params;

        this._myMouse = new PP.Mouse();
        this._myStickIdleTimer = new PP.Timer(0.25, false);

        this._mySessionActive = false;

        this._myTeleportPositionValid = false;
        this._myTeleportPosition = PP.vec3_create();
        this._myTeleportRotationOnUp = 0;

        this._myFSM = new PP.FSM();
        this._myFSM.setDebugLogActive(true, "Locomotion Teleport");

        this._myFSM.addState("init");
        this._myFSM.addState("idle", this._idleUpdate.bind(this));
        this._myFSM.addState("detect", this._detectUpdate.bind(this));
        this._myFSM.addState("teleport", this._teleportUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");

        this._myFSM.addTransition("idle", "detect", "detect");
        this._myFSM.addTransition("detect", "teleport", "teleport");
        this._myFSM.addTransition("detect", "idle", "cancel");
        this._myFSM.addTransition("teleport", "idle", "done");

        this._myFSM.addTransition("detect", "idle", "stop");
        this._myFSM.addTransition("teleport", "idle", "stop");

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }

    init() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    start() {
    }

    stop() {
        // if is teleporting complete the teleport
        this._myFSM.perform("stop");
    }

    update(dt) {
        this._myMouse.update(dt);

        this._myFSM.update(dt);

        // collision check for gravity/keep snapping
    }

    _idleUpdate(dt) {
        if (this._startDetecting()) {
            this._myFSM.perform("detect");
        }
    }

    _detectUpdate(dt) {
        this._detectTeleportPosition();

        this._showTeleportPosition(dt);

        if (this._confirmTeleport()) {
            if (this._myTeleportPositionValid) {
                this._myFSM.perform("teleport");
            } else {
                this._myFSM.perform("cancel");
            }
        } else if (this._cancelTeleport()) {
            this._myFSM.perform("cancel");
        }
    }

    _teleportUpdate(dt) {
        this._teleportToPosition(this._myTeleportPosition, this._myTeleportRotationOnUp, this._myParams.myCollisionRuntimeParams);
        this._myFSM.perform("done");
    }

    _startDetecting() {
        let startDetecting = false;

        if (!this._mySessionActive) {
            startDetecting = this._myMouse.isButtonPressStart(PP.MouseButtonType.MIDDLE);
        } else {

        }

        return startDetecting;
    }

    _confirmTeleport() {
        let confirmTeleport = false;

        if (!this._mySessionActive) {
            confirmTeleport = this._myMouse.isButtonPressEnd(PP.MouseButtonType.MIDDLE);
        } else {

        }

        return confirmTeleport;
    }

    _cancelTeleport() {
        let cancelTeleport = false;

        if (!this._mySessionActive) {
            cancelTeleport = this._myMouse.isButtonPressEnd(PP.MouseButtonType.RIGHT);
        } else {

        }

        return cancelTeleport;
    }

    _detectTeleportPosition() {
        if (this._mySessionActive) {
            this._detectTeleportPositionVR();
        } else {
            this._detectTeleportPositionNonVR();
        }
    }

    _showTeleportPosition() {

    }

    _onXRSessionStart(session) {
        this._mySessionActive = true;
    }

    _onXRSessionEnd(session) {
        this._mySessionActive = false;
    }
};

PlayerLocomotionTeleport.prototype._detectTeleportPositionNonVR = function () {
    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();

    return function _detectTeleportPositionNonVR(dt) {
        this._myTeleportRotationOnUp = 0;
        this._myTeleportPosition.vec3_zero();
        this._myTeleportPositionValid = false;

        raycastSetup.myDistance = this._myParams.myMaxDistance;

        raycastSetup.myBlockLayerFlags.setMask(this._myParams.myBlockLayerFlags.getMask());

        raycastSetup.myObjectsToIgnore.pp_clear();
        raycastSetup.myIgnoreHitsInsideCollision = false;

        raycastResult = this._myMouse.raycastWorld(raycastSetup, raycastResult);

        if (raycastResult.isColliding()) {
            let hit = raycastResult.myHits.pp_first();

            this._myTeleportPosition.vec3_copy(hit.myPosition);
            this._myTeleportPositionValid = this._isTeleportHitValid(hit, this._myTeleportRotationOnUp);
        }

        if (this._myParams.myDebugActive) {
            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            PP.myDebugManager.draw(debugParams, 0);
        }
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionNonVR", { enumerable: false });



PlayerLocomotionTeleport.prototype._detectTeleportPositionVR = function () {
    return function _detectTeleportPositionVR(dt) {

    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectTeleportPositionVR", { enumerable: false });



PlayerLocomotionTeleport.prototype._isTeleportHitValid = function () {
    let playerUp = PP.vec3_create();
    let teleportCheckCollisionRuntimeParams = new CollisionRuntimeParams();
    return function _isTeleportHitValid(hit, rotationOnUp) {
        let isValid = false;

        if (hit.isValid() && !hit.myIsInsideCollision) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            if (hit.myNormal.vec3_isConcordant(playerUp)) {
                teleportCheckCollisionRuntimeParams.copy(this._myParams.myCollisionRuntimeParams);

                isValid = this._isTeleportPositionValid(hit.myPosition, rotationOnUp, teleportCheckCollisionRuntimeParams);
            }
        }

        return isValid;
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportHitValid", { enumerable: false });

PlayerLocomotionTeleport.prototype._isTeleportPositionValid = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    return function _isTeleportPositionValid(position, rotationOnUp, collisionRuntimeParams) {
        let isValid = false;

        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        //controllare posizione visibile dalla testa

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.setRotationQuat(feetRotationQuat);
        }

        CollisionCheckGlobal.teleport(position, feetTransformQuat, this._myParams.myCollisionCheckParams, collisionRuntimeParams);

        if (!collisionRuntimeParams.myTeleportCancelled && collisionRuntimeParams.myIsOnGround) {
            //controllare altezza non sia troppo diversa

            isValid = true;
        }

        return isValid;
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportPositionValid", { enumerable: false });

PlayerLocomotionTeleport.prototype._teleportToPosition = function () {
    let playerUp = PP.vec3_create();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    let teleportRotation = PP.quat_create();
    return function _teleportToPosition(position, rotationOnUp, collisionRuntimeParams) {
        playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

        //controllare posizione visibile dalla testa

        feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
        if (rotationOnUp != 0) {
            feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
            feetRotationQuat = feetRotationQuat.quat_rotateAxis(rotationOnUp, playerUp, feetRotationQuat);
            feetTransformQuat.setRotationQuat(feetRotationQuat);
        }

        CollisionCheckGlobal.teleport(position, feetTransformQuat, this._myParams.myCollisionCheckParams, collisionRuntimeParams);

        if (!collisionRuntimeParams.myTeleportCancelled) {

            this._myParams.myPlayerHeadManager.teleportFeetPosition(collisionRuntimeParams.myFixedTeleportPosition);
            if (rotationOnUp != 0) {
                teleportRotation.quat_fromAxis(rotationOnUp, playerUp);
                this._myParams.myPlayerHeadManager.rotateHeadHorizontallyQuat(teleportRotation);
            }
        }
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_teleportToPosition", { enumerable: false });