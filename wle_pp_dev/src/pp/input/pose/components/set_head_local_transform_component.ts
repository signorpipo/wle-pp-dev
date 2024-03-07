import { Component } from "@wonderlandengine/api";
import { XRUtils } from "../../../cauldron/utils/xr_utils.js";
import { quat2_create, quat_create, vec3_create } from "../../../plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../../pp/globals.js";
import { BasePose } from "../base_pose.js";

export class SetHeadLocalTransformComponent extends Component {
    static override TypeName = "pp-set-head-local-transform";

    override start(): void {
        Globals.getHeadPose(this.engine)!.registerPoseUpdatedEventListener(this, this.onPoseUpdated.bind(this));
    }

    onPoseUpdated(dt: number, pose: Readonly<BasePose>): void {
        // Implemented outside class definition
    }

    override onDestroy(): void {
        Globals.getHeadPose(this.engine)?.unregisterPoseUpdatedEventListener(this);
    }
}



// IMPLEMENTATION

SetHeadLocalTransformComponent.prototype.onPoseUpdated = function () {
    const cameraNonXRRotation = quat_create();
    const cameraNonXRUp = vec3_create();
    const cameraNonXRPosition = vec3_create();

    const headPoseTransform = quat2_create();
    return function onPoseUpdated(this: SetHeadLocalTransformComponent, dt: number, pose: Readonly<BasePose>): void {
        if (this.active) {
            if (!XRUtils.isSessionActive(this.engine)) {
                const cameraNonXR = Globals.getPlayerObjects(this.engine)!.myCameraNonXR!;

                cameraNonXR.pp_getRotationLocalQuat(cameraNonXRRotation);
                if (Globals.isPoseForwardFixed(this.engine)) {
                    (cameraNonXRRotation as any).quat_rotateAxisRadians(Math.PI, (cameraNonXRRotation as any).quat_getUp(cameraNonXRUp), cameraNonXRRotation);
                }
                this.object.pp_setPositionLocal(cameraNonXR.pp_getPositionLocal(cameraNonXRPosition));
                this.object.pp_setRotationLocalQuat(cameraNonXRRotation);
            } else {
                if (pose.isValid()) {
                    this.object.pp_setTransformLocalQuat(pose.getTransformQuat(headPoseTransform, null));
                }
            }
        }
    };
}();