import { Component } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer";
import { PhysicsUtils } from "../../pp/cauldron/physics/physics_utils";
import { getDebugVisualManager } from "../../pp/debug/debug_globals";

export class RaycastTestComponent extends Component {
    static TypeName = "raycast-test";
    static Properties = {};

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

            raycastSetup.myOrigin.vec3_copy(this.object.pp_getPosition());
            raycastSetup.myDirection.vec3_copy(this.object.pp_getForward());
            raycastSetup.myDistance = distance;

            raycastSetup.myBlockLayerFlags.setAllFlagsActive(true);

            raycastSetup.myObjectsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;

            let raycastResult = PhysicsUtils.raycast(raycastSetup);

            getDebugVisualManager().drawRaycast(0, raycastResult, false);
        }
    }
}