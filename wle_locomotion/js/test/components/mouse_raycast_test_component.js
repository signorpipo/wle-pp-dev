import { Component } from "@wonderlandengine/api";

export class MouseRaycastTestComponent extends Component {
    static TypeName = "mouse-raycast-test";
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
            raycastSetup.myBlockLayerFlags.setAllFlagsActive(true);
            raycastSetup.myObjectsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;
            raycastSetup.myDistance = distance;

            let raycastResult = PP.PhysicsUtils.raycast(raycastSetup);

            PP.myMouse.raycastWorld(raycastSetup, raycastResult);

            PP.myDebugVisualManager.drawRaycast(0, raycastResult, false);

            console.error(PP.myMouse.isInsideView());
        }
    }
}