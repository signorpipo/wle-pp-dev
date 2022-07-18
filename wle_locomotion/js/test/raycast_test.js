WL.registerComponent('raycast-test', {
}, {
    init: function () {
    },
    start() {
        this._myTimer = new PP.Timer(0);
        this._myTimer.update(this._myTimer.getDuration());
    },
    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            let distance = 1000;

            let raycastSetup = new PP.RaycastSetup();

            raycastSetup.myOrigin.vec3_copy(this.object.pp_getPosition());
            raycastSetup.myDirection.vec3_copy(this.object.pp_getForward());
            raycastSetup.myDistance = distance;

            raycastSetup.myBlockLayerFlags.setAllFlagsActive(true);

            raycastSetup.myPhysXComponentsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;

            let raycastResult = PP.PhysicsUtils.raycast(raycastSetup);

            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            debugParams.myShowOnlyFirstHit = false;
            PP.myDebugManager.draw(debugParams, 0);
        }
    }
});