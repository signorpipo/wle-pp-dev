import { Timer } from "../../cauldron/cauldron/timer.js";
import { XRUtils } from "../../cauldron/utils/xr_utils.js";
import { quat_create, vec3_create } from "../../plugin/js/extensions/array/vec_create_extension.js";
import { Handedness, InputSourceType } from "../cauldron/input_types.js";
import { InputUtils } from "../cauldron/input_utils.js";
import { BasePose, BasePoseParams } from "./base_pose.js";

export class HandPoseParams extends BasePoseParams {

    constructor(engine) {
        super(engine);

        this.mySwitchToTrackedHandDelay = 0;
        this.myFixTrackedHandRotation = true;
    }
}

export class HandPose extends BasePose {

    constructor(handedness, handPoseParams = new HandPoseParams()) {
        super(handPoseParams);

        this._myInputSource = null;

        this._myHandedness = handedness;
        this._myFixTrackedHandRotation = handPoseParams.myFixTrackedHandRotation;

        this._mySwitchToTrackedHandDelay = handPoseParams.mySwitchToTrackedHandDelay;
        this._mySwitchToTrackedHandTimer = new Timer(this._mySwitchToTrackedHandDelay, false);

        this._myTrackedHand = false;

        this._myInputSourcesChangeEventListener = null;
    }

    getHandedness() {
        return this._myHandedness;
    }

    getInputSource() {
        return this._myInputSource;
    }

    getInputSourceType() {
        if (this._myInputSource == null) {
            return null;
        }

        return InputUtils.getInputSourceType(this._myInputSource);
    }

    isFixTrackedHandRotation() {
        return this._myFixTrackedHandRotation;
    }

    setFixTrackedHandRotation(fixTrackedHandRotation) {
        this._myFixTrackedHandRotation = fixTrackedHandRotation;
    }

    getSwitchToTrackedHandDelay() {
        return this._mySwitchToTrackedHandDelay;
    }

    setSwitchToTrackedHandDelay(switchToTrackedHandDelay) {
        this._mySwitchToTrackedHandDelay = switchToTrackedHandDelay;
    }

    getRotationQuat(out = quat_create(), referenceObjectOverride = undefined) {
        // Implemented outside class definition
    }

    _isReadyToGetPose() {
        return this._myInputSource != null;
    }

    _getPose(xrFrame) {
        return xrFrame.getPose(this._myInputSource.gripSpace, this.getReferenceSpace());
    }

    _preUpdate(dt) {
        if (this._mySwitchToTrackedHandTimer.isRunning()) {
            this._mySwitchToTrackedHandTimer.update(dt);
            if (this._mySwitchToTrackedHandTimer.isDone()) {
                if (this._myInputSourcesChangeEventListener != null) {
                    const switchToTrackedHandDelayBackup = this._mySwitchToTrackedHandDelay;
                    this._mySwitchToTrackedHandDelay = 0;
                    this._myInputSourcesChangeEventListener();
                    this._mySwitchToTrackedHandDelay = switchToTrackedHandDelayBackup;
                }
            }
        }
    }

    _onXRSessionStartHook(manualCall, session) {
        this._myInputSourcesChangeEventListener = () => {
            this._myInputSource = null;
            this._myTrackedHand = false;
            let resetSwitchToTrackedHandTimer = true;

            if (session.inputSources != null && session.inputSources.length > 0) {
                let extraSourcesCheckForGamepad = false;

                for (let i = 0; i < session.inputSources.length; i++) {
                    let inputSource = session.inputSources[i];
                    if (inputSource.handedness == this._myHandedness) {
                        const inputSourceType = InputUtils.getInputSourceType(inputSource);
                        const currentInputSourceType = this._myInputSource != null ? InputUtils.getInputSourceType(this._myInputSource) : null;

                        this._myInputSource = inputSource;
                        this._myTrackedHand = InputUtils.getInputSourceType(this._myInputSource) == InputSourceType.TRACKED_HAND;

                        if (this._mySwitchToTrackedHandDelay > 0 && currentInputSourceType == InputSourceType.GAMEPAD && inputSourceType == InputSourceType.TRACKED_HAND) {
                            extraSourcesCheckForGamepad = true;
                        }

                        break;
                    }
                }

                if (extraSourcesCheckForGamepad) {
                    const sourcesToCheck = [];
                    sourcesToCheck.push(...session.inputSources);
                    if (session.trackedSources != null) {
                        sourcesToCheck.push(...session.trackedSources);
                    }

                    for (const sourceToCheck of sourcesToCheck) {
                        if (sourceToCheck.handedness == this._myHandedness) {
                            const sourceToCheckType = InputUtils.getInputSourceType(sourceToCheck);
                            if (sourceToCheckType == InputSourceType.GAMEPAD) {
                                this._myInputSource = sourceToCheckType;
                                this._myTrackedHand = false;

                                resetSwitchToTrackedHandTimer = false;
                                if (!this._mySwitchToTrackedHandTimer.isRunning()) {
                                    this._mySwitchToTrackedHandTimer.start(this._mySwitchToTrackedHandDelay);
                                }

                                break;
                            }
                        }
                    }
                }

                if (resetSwitchToTrackedHandTimer) {
                    this._mySwitchToTrackedHandTimer.reset();
                }
            }
        };

        this._myInputSourcesChangeEventListener();

        session.addEventListener("inputsourceschange", this._myInputSourcesChangeEventListener);
    }

    _onXRSessionEndHook() {
        this._myInputSource = null;

        this._myInputSourcesChangeEventListener = null;
    }

    _destroyHook() {
        XRUtils.getSession(this.getEngine())?.removeEventListener("inputsourceschange", this._myInputSourcesChangeEventListener);
    }
}



// IMPLEMENTATION

HandPose.prototype.getRotationQuat = function () {
    let playerRotationQuat = quat_create();
    let up = vec3_create();
    let right = vec3_create();
    let forward = vec3_create();
    return function getRotationQuat(out = quat_create(), referenceObjectOverride = undefined) {
        let referenceObject = referenceObjectOverride === undefined ? this._myReferenceObject : referenceObjectOverride;

        out.quat_copy(this._myRotationQuat);

        if (this._myForwardFixed) {
            out.quat_rotateAxisRadians(Math.PI, out.quat_getUp(up), out);
        }

        if (this._myFixTrackedHandRotation && this._myTrackedHand) {
            out.quat_rotateAxis(-60, out.quat_getRight(right), out);

            let forwardRotation = 20;
            forwardRotation = (this._myHandedness == Handedness.LEFT) ? forwardRotation : -forwardRotation;
            out.quat_rotateAxis(forwardRotation, out.quat_getForward(forward), out);
        }

        if (referenceObject == null) {
            return out;
        }

        return out.quat_toWorld(referenceObject.pp_getRotationQuat(playerRotationQuat), out);
    };
}();