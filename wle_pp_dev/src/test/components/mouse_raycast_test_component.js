import { Component } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer.js";
import { PhysicsUtils } from "../../pp/cauldron/physics/physics_utils.js";
import { Globals } from "../../pp/pp/globals.js";

export class MouseRaycastTestComponent extends Component {
    static TypeName = "mouse-raycast-test";

    start() {
        this._myTimer = new Timer(0);
        this._myTimer.update(this._myTimer.getDuration());
    }

    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            let distance = 1000;

            let raycastSetup = new raycastSetup();
            raycastSetup.myBlockLayerFlags.setAllFlagsActive(true);
            raycastSetup.myObjectsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;
            raycastSetup.myDistance = distance;

            let raycastResult = PhysicsUtils.raycast(raycastSetup);

            Globals.getMouse(this.engine).raycastWorld(raycastSetup, raycastResult);

            Globals.getDebugVisualManager(this.engine).drawRaycast(0, raycastResult, false);

            console.error(Globals.getMouse(this.engine).isInsideView());
        }
    }
}