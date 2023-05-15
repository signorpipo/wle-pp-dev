import { Component } from "@wonderlandengine/api";

export class RaycastTestComponent extends Component {
    static TypeName = "raycast-test";
    static Properties = {};

    start() {
        this._myTimer = new PP.Timer(0);
        this._myTimer.update(this._myTimer.getDuration());
    }

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

            raycastSetup.myObjectsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;

            let raycastResult = PP.PhysicsUtils.raycast(raycastSetup);

            PP.myDebugVisualManager.drawRaycast(0, raycastResult, false);
        }
    }
}