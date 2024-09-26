import { Component, Object3D } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { Globals, InputSourceType, XRUtils } from "wle-pp";

export class TeleportOnTrackedHandsComponent extends Component {
    public static override TypeName = "teleport-on-tracked-hands";

    @property.object()
    private _myTeleportTargetObject!: Object3D;

    private _myUsingTrackedHands: boolean = false;

    public override update(dt: number): void {
        if (XRUtils.isSessionActive()) {
            if (Globals.getLeftHandPose()!.getInputSourceType() == InputSourceType.TRACKED_HAND || Globals.getRightHandPose()!.getInputSourceType() == InputSourceType.TRACKED_HAND) {
                if (!this._myUsingTrackedHands) {
                    this._myUsingTrackedHands = true;

                    Globals.getPlayerLocomotion()!.getPlayerTransformManager().teleportTransformQuat(this._myTeleportTargetObject.pp_getTransformQuat(), true);
                }
            } else {
                this._myUsingTrackedHands = false;
            }
        }
    }

    public override onActivate(): void {
        XRUtils.registerSessionStartEventListener(this, this._onXRSessionStart.bind(this), false, false, this.engine);
    }

    public override onDeactivate(): void {
        XRUtils.unregisterSessionStartEventListener(this, this.engine);
    }

    private _onXRSessionStart(): void {
        this._myUsingTrackedHands = false;
    }
}