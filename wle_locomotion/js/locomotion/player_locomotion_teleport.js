PlayerLocomotionTeleportParams = class PlayerLocomotionTeleportParams {
    constructor() {
        this.myPlayerHeadManager = null;

        this.myCollisionCheckParams = null;
        this.myCollisionRuntimeParams = null;

        this.myMaxDistance = 0;
        this.myTeleportPositionMustBeVisible = false;

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

        this._myDetectValid = false;
        this._myDetectHit = new PP.RaycastResultHit();
        this._myDetectPosition = PP.vec3_create();
        this._myDetectRotationOnUp = 0;

        this._myFSM = new PP.FSM();
        this._myFSM.setDebugLogActive(true, "Locomotion Teleport");

        this._myFSM.addState("init");
        this._myFSM.addState("detect", this._detect.bind(this));
        this._myFSM.addState("teleport", this._teleport.bind(this));

        this._myFSM.addTransition("init", "detect", "start");

        this._myFSM.addTransition("detect", "teleport", "teleport");
        this._myFSM.addTransition("teleport", "detect", "end");

        this._myFSM.addTransition("detect", "init", "stop");
        this._myFSM.addTransition("teleport", "init", "stop");

        this._myFSM.init("init");
    }

    init() {
        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    start() {
        this._myFSM.perform("start");
    }

    stop() {
        // if is teleporting complete the teleport
        this._myFSM.perform("stop");
    }

    update(dt) {
        this._myFSM.update(dt);
    }

    _detect(dt) {
        this._myDetectHit.reset();

        if (this._mySessionActive) {
            this._detectVR(dt);
        } else {
            this._detectNonVR(dt);
        }

        this._myDetectValid = this._isTeleportHitValid();
        if (this._myDetectValid) {
            console.error("valid");
        }

        this._showTeleport(dt);
    }
};

PlayerLocomotionTeleport.prototype._detectNonVR = function () {
    let raycastSetup = new PP.RaycastSetup();
    let raycastResult = new PP.RaycastResult();

    return function _detectNonVR(dt) {
        this._myDetectRotationOnUp = 0;

        this._myMouse.update(dt);

        if (this._myMouse.isButtonPressed(PP.MouseButtonType.MIDDLE)) {
            raycastSetup.myDistance = this._myParams.myMaxDistance;

            raycastSetup.myBlockLayerFlags.setMask(this._myParams.myBlockLayerFlags.getMask());

            raycastSetup.myObjectsToIgnore.pp_clear();
            raycastSetup.myIgnoreHitsInsideCollision = false;

            raycastResult = this._myMouse.raycastWorld(raycastSetup, raycastResult);

            if (raycastResult.isColliding()) {
                let hit = raycastResult.myHits.pp_first();
                this._myDetectHit.copy(hit);
            }
        }
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectNonVR", { enumerable: false });



PlayerLocomotionTeleport.prototype._detectVR = function () {
    return function _detectVR(dt) {

    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_detectVR", { enumerable: false });



PlayerLocomotionTeleport.prototype._isTeleportHitValid = function () {
    let playerUp = PP.vec3_create();
    let teleportCheckCollisionRuntimeParams = new CollisionRuntimeParams();
    let feetTransformQuat = PP.quat2_create();
    let feetRotationQuat = PP.quat_create();
    return function _isTeleportHitValid() {
        let isValid = false;

        if (this._myDetectHit.isValid() && !this._myDetectHit.myIsInsideCollision) {
            playerUp = this._myParams.myPlayerHeadManager.getPlayer().pp_getUp(playerUp);

            if (this._myDetectHit.myNormal.vec3_isConcordant(playerUp)) {
                teleportCheckCollisionRuntimeParams.copy(this._myParams.myCollisionRuntimeParams);

                //controllare posizione visibile dalla testa

                feetTransformQuat = this._myParams.myPlayerHeadManager.getFeetTransformQuat(feetTransformQuat);
                if (this._myDetectRotationOnUp != 0) {
                    feetRotationQuat = feetTransformQuat.quat2_getRotationQuat(feetRotationQuat);
                    feetRotationQuat = feetRotationQuat.quat_rotateAxis(this._myDetectRotationOnUp, playerUp, feetRotationQuat);
                    feetTransformQuat.setRotationQuat(feetRotationQuat);
                }

                CollisionCheckGlobal.teleport(this._myDetectHit.myPosition, feetTransformQuat, this._myParams.myCollisionCheckParams, teleportCheckCollisionRuntimeParams);

                if (!teleportCheckCollisionRuntimeParams.myTeleportCancelled && teleportCheckCollisionRuntimeParams.myIsOnGround) {
                    //controllare altezza non sia troppo diversa

                    isValid = true;
                }
            }
        }

        return isValid;
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_isTeleportHitValid", { enumerable: false });



PlayerLocomotionTeleport.prototype._showTeleport = function () {
    return function _showTeleport(dt) {

        if (this._myParams.myDebugActive && this._myDetectHit.isValid()) {
            let debugParams = new PP.DebugArrowParams();
            debugParams.myStart.vec3_copy(this._myDetectHit.myPosition);
            debugParams.myDirection.vec3_copy(this._myDetectHit.myNormal);
            debugParams.myLength = 0.2;
            debugParams.myColor = [1, 0, 0, 1];
            PP.myDebugManager.draw(debugParams);
        }
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_showTeleport", { enumerable: false });



PlayerLocomotionTeleport.prototype._teleport = function () {
    return function _teleport(dt) {

    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_teleport", { enumerable: false });



PlayerLocomotionTeleport.prototype._onXRSessionStart = function () {
    return function _onXRSessionStart(session) {
        this._mySessionActive = true;
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_onXRSessionStart", { enumerable: false });



PlayerLocomotionTeleport.prototype._onXRSessionEnd = function () {
    return function _onXRSessionEnd(session) {
        this._mySessionActive = false;
    };
}();
Object.defineProperty(PlayerLocomotionTeleport.prototype, "_onXRSessionEnd", { enumerable: false });