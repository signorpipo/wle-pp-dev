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
            let rayHit = WL.physics.rayCast(this.object.pp_getPosition(), this.object.pp_getForward(), 255, distance);

            let raycastParams = new PP.DebugRaycastParams();
            raycastParams.myOrigin = this.object.pp_getPosition();
            raycastParams.myDirection = this.object.pp_getForward();
            raycastParams.myDistance = distance;
            raycastParams.myRaycastResult = rayHit;
            PP.myDebugManager.draw(raycastParams);
        }
    }
});