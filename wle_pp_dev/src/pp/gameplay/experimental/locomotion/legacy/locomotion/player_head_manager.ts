import { Object3D, WonderlandEngine } from "@wonderlandengine/api";
import { Timer } from "../../../../../cauldron/cauldron/timer.js";
import { Quaternion, Quaternion2, Vector3 } from "../../../../../cauldron/type_definitions/array_type_definitions.js";
import { Quat2Utils } from "../../../../../cauldron/utils/array/quat2_utils.js";
import { XRUtils } from "../../../../../cauldron/utils/xr_utils.js";
import { mat4_create, quat2_create, quat_create, vec3_create, vec4_create } from "../../../../../plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../../../../pp/globals.js";

export enum NonVRReferenceSpaceMode {
    NO_FLOOR = 0,
    FLOOR = 1,
    NO_FLOOR_THEN_KEEP_VR = 2,
    FLOOR_THEN_KEEP_VR = 3
}

export class PlayerHeadManagerParams {

    public mySessionChangeResyncEnabled: boolean = false;

    public myBlurEndResyncEnabled: boolean = false;
    public myBlurEndResyncRotation: boolean = false;

    public myResetTransformOnViewResetEnabled: boolean = true;

    public myNextEnterSessionResyncHeight: boolean = false;
    public myEnterSessionResyncHeight: boolean = false;



    public myExitSessionResyncHeight: boolean = false;
    public myExitSessionResyncVerticalAngle: boolean = false;

    /** For now right tilt is removed even if this setting is `false`, if the vertical angle has to be adjusted */
    public myExitSessionRemoveRightTilt: boolean = false;

    public myExitSessionAdjustMaxVerticalAngle: boolean = false;
    public myExitSessionMaxVerticalAngle: number = 0;
    public myExitSessionResetNonVRTransformLocal: boolean = true;



    public myNonVRFloorBasedMode: NonVRReferenceSpaceMode = NonVRReferenceSpaceMode.FLOOR_THEN_KEEP_VR;



    public myDefaultHeightNonVR: number = 0;
    public myDefaultHeightVRWithoutFloor: number = 0;

    /** `null` means just keep the detected one */
    public myDefaultHeightVRWithFloor: number | null = null;

    /** Can be used to always add a bit of height, for example to compensate the fact  
        that the default height is actually the eye height and you may want to also add a forehead offset */
    public myForeheadExtraHeight: number = 0;



    public myFeetRotationKeepUp: boolean = true;

    public myDebugEnabled: boolean = false;

    public readonly myEngine: Readonly<WonderlandEngine>;

    constructor(engine: Readonly<WonderlandEngine> = Globals.getMainEngine()!) {
        this.myEngine = engine;
    }
}

// #TODO Could be seen as the generic player body manager (maybe with hands and stuff also)
export class PlayerHeadManager {
    private readonly _myParams: PlayerHeadManagerParams;

    private _myCurrentHead: Object3D;
    private readonly _myCurrentHeadTransformLocalQuat: Quaternion2 = quat2_create();


    private _mySessionChangeResyncHeadTransform: Readonly<Quaternion2> | null = null;

    /** Needed because VR head takes some frames to get the tracked position */
    private _myDelaySessionChangeResyncCounter: number = 0;


    private _myBlurRecoverHeadTransform: Readonly<Quaternion2> | null = null;
    private _myDelayBlurEndResyncCounter: number = 0;
    private readonly _myDelayBlurEndResyncTimer = new Timer(5, false);

    private _myVisibilityHidden: boolean = false;

    private _mySessionActive: boolean = false;
    private _mySessionBlurred: boolean = false;

    private _myIsSyncedDelayCounter: number = 0;

    private _myViewResetThisFrame: boolean = false;
    private _myViewResetEventListener = null;

    private _myHeightNonVR: number = 0;
    private _myHeightNonVROnEnterSession: number = 0;
    private _myHeightVRWithoutFloor: number | null = null;
    private _myHeightVRWithFloor: number | null = null;
    private _myHeightOffsetWithFloor: number = 0;
    private _myHeightOffsetWithoutFloor: number = 0;
    private _myNextEnterSessionSetHeightVRWithFloor: boolean = false;
    private _myNextEnterSessionSetHeightVRWithoutFloor: boolean = false;
    private _myDelayNextEnterSessionSetHeightVRCounter: number = 0;

    private _myLastReferenceSpaceIsFloorBased: boolean | null = null;

    private _myActive: boolean = true;

    private _myDestroyed: boolean = false;

    private static _myResyncCounterFrames = 3;
    private static _myIsSyncedDelayCounterFrames = 1;

    constructor(params: PlayerHeadManagerParams = new PlayerHeadManagerParams()) {
        this._myParams = params;

        this._myCurrentHead = Globals.getPlayerObjects(this._myParams.myEngine)!.myHead!;
    }

    public start(): void {
        this._setHeightHeadNonVR(this._myParams.myDefaultHeightNonVR);
        this._setHeightHeadVRWithoutFloor(this._myParams.myDefaultHeightVRWithoutFloor);
        this._setHeightHeadVRWithFloor(this._myParams.myDefaultHeightVRWithFloor);

        this._updateHeightOffset();

        this._setCameraNonXRHeight(this._myHeightNonVR);

        XRUtils.registerSessionStartEndEventListeners(this, this._onXRSessionStart.bind(this), this._onXRSessionEnd.bind(this), true, true, this._myParams.myEngine);
    }

    public setActive(active: boolean): void {
        this._myActive = active;
    }

    public getParams(): PlayerHeadManagerParams {
        return this._myParams;
    }

    public getPlayer(): Object3D {
        return Globals.getPlayerObjects(this._myParams.myEngine)!.myPlayer!;
    }

    public getHead(): Object3D {
        return this._myCurrentHead;
    }

    public getHeightHead(): number {
        return this.getHeightEyes() + this._myParams.myForeheadExtraHeight;
    }

    public getHeightEyes(): number {
        // Implemented outside class definition
    }

    public getTransformFeetQuat(outTransformFeetQuat: Quaternion2 = quat2_create()): Quaternion2 {
        // Implemented outside class definition
    }

    public getTransformHeadQuat(outTransformFeetQuat: Quaternion2 = quat2_create()): Quaternion2 {
        return this.getHead().pp_getTransformQuat(outTransformFeetQuat);
    }

    public getPositionFeet(outPositionFeet: Vector3 = vec3_create()): Vector3 {
        // Implemented outside class definition
    }

    public getPositionHead(outPositionHead: Vector3 = vec3_create()): Vector3 {
        return this._myCurrentHead.pp_getPosition(outPositionHead);
    }

    public getRotationFeetQuat(outRotationFeetQuat: Quaternion = quat_create()): Quaternion {
        // Implemented outside class definition
    }

    public getRotationHeadQuat(outRotationHeadQuat: Quaternion = quat_create()): Quaternion {
        return this.getHead().pp_getRotationQuat(outRotationHeadQuat);
    }

    public isSynced(ignoreSessionBlurredState: boolean = false): boolean {
        return this._myIsSyncedDelayCounter == 0 && this._myDelaySessionChangeResyncCounter == 0 && this._myDelayNextEnterSessionSetHeightVRCounter == 0 && this._myDelayBlurEndResyncCounter == 0 && !this._myDelayBlurEndResyncTimer.isRunning() && (ignoreSessionBlurredState || !this._mySessionBlurred);
    }

    public setHeightHead(height: number, setOnlyForActiveOne: boolean = true): void {
        this._setHeightHead(height, height, height, setOnlyForActiveOne);
    }

    public resetHeightHeadToDefault(resetOnlyForActiveOne: boolean = true): void {
        this._setHeightHead(this._myHeightNonVR, this._myHeightVRWithoutFloor, this._myHeightVRWithFloor, resetOnlyForActiveOne);
    }

    public setHeightHeadNonVR(height: number): void {
        this._setHeightHeadNonVR(height);

        if (!this._mySessionActive) {
            this._updateHeightOffset();
            this._setCameraNonXRHeight(this._myHeightNonVR);
        }
    }

    public setHeightHeadVRWithoutFloor(height: number): void {
        this._setHeightHeadVRWithoutFloor(height);

        if (this._mySessionActive) {
            this._updateHeightOffset();
        }
    }

    public resetHeightHeadVRWithFloor(): void {
        this.setHeightHeadVRWithFloor(null);
    }

    public setHeightHeadVRWithFloor(height = null): void {
        this._setHeightHeadVRWithFloor(height);

        if (this._mySessionActive) {
            this._updateHeightOffset();
        }
    }

    public getDefaultHeightHeadNonVR(): number {
        return this._myHeightNonVR;
    }

    public getDefaultHeightHeadVRWithoutFloor(): number | null {
        return this._myHeightVRWithoutFloor;
    }

    public getDefaultHeightHeadVRWithFloor(): number | null {
        return this._myHeightVRWithFloor;
    }

    public moveFeet(movement: Readonly<Vector3>): void {
        // Implemented outside class definition
    }

    public moveHead(movement: Readonly<Vector3>): void {
        this.moveFeet(movement);
    }

    public teleportPositionHead(teleportPosition: void): void {
        // Implemented outside class definition
    }

    public teleportPositionFeet(teleportPosition: void): void {
        // Implemented outside class definition
    }

    public teleportPlayerToHeadTransformQuat(headTransformQuat: Readonly<Quaternion2>): void {
        // Implemented outside class definition
    }

    public rotateFeetQuat(rotationQuat: Readonly<Quaternion>, keepUpOverride: boolean | null = null): void {
        // Implemented outside class definition 
    }

    public rotateHeadQuat(rotationQuat: Readonly<Quaternion>): void {
        // #TODO Rotate feet with this and then rotate head freely if possible
        // Implemented outside class definition 
    }

    public canRotateFeet(): boolean {
        return true;
    }

    public canRotateHead(): boolean {
        return !this._mySessionActive;
    }

    public setRotationFeetQuat(rotationQuat: Readonly<Quaternion>, keepUpOverride: boolean | null = null): void {
        // Implemented outside class definition 
    }

    public setRotationHeadQuat(): void {
        // Implemented outside class definition 
    }

    public lookAtFeet(position: Readonly<Vector3>, up?: Readonly<Vector3>, keepUpOverride: boolean | null = null): void {
        // Implemented outside class definition 
    }

    public lookToFeet(direction: Readonly<Vector3>, up?: Readonly<Vector3>, keepUpOverride: boolean | null = null): void {
        // Implemented outside class definition 
    }

    public lookAtHead(position: Readonly<Vector3>, up?: Readonly<Vector3>): void {
        // Implemented outside class definition 
    }

    public lookToHead(direction: Readonly<Vector3>, up?: Readonly<Vector3>): void {
        // Implemented outside class definition 
    }

    public resetCameraNonXR(): void {
        Globals.getPlayerObjects(this._myParams.myEngine)!.myCameraNonXR!.pp_resetTransformLocal();
        this._setCameraNonXRHeight(this._myHeightNonVR);
    }

    public update(dt: number): void {
        this._myViewResetThisFrame = false;

        if (this._myIsSyncedDelayCounter != 0) {
            this._myIsSyncedDelayCounter--;
            this._myIsSyncedDelayCounter = Math.max(0, this._myIsSyncedDelayCounter);
        }

        if (this._myDelaySessionChangeResyncCounter > 0) {
            this._myDelaySessionChangeResyncCounter--;
            if (this._myDelaySessionChangeResyncCounter == 0) {
                this._sessionChangeResync();
                this._myIsSyncedDelayCounter = PlayerHeadManager._myIsSyncedDelayCounterFrames;
            }
        }

        if (this._myDelayBlurEndResyncCounter > 0 && !this._myDelayBlurEndResyncTimer.isRunning()) {
            this._myDelayBlurEndResyncCounter--;
            if (this._myDelayBlurEndResyncCounter == 0) {
                this._blurEndResync();
                this._myIsSyncedDelayCounter = PlayerHeadManager._myIsSyncedDelayCounterFrames;
            }
        }

        // Not really used since visibility hidden end is not considered a special case anymore
        if (this._myDelayBlurEndResyncTimer.isRunning()) {
            if (this._myDelayBlurEndResyncCounter > 0) {
                this._myDelayBlurEndResyncCounter--;
            } else {
                this._myDelayBlurEndResyncTimer.update(dt);
                if (this._myDelayBlurEndResyncTimer.isDone()) {
                    this._blurEndResync();
                    this._myIsSyncedDelayCounter = PlayerHeadManager._myIsSyncedDelayCounterFrames;
                }
            }
        }

        if (this._myDelayNextEnterSessionSetHeightVRCounter > 0) {
            this._myDelayNextEnterSessionSetHeightVRCounter--;
            if (this._myDelayNextEnterSessionSetHeightVRCounter == 0) {
                if (this._mySessionActive) {
                    const isFloor = XRUtils.isReferenceSpaceFloorBased(this._myParams.myEngine);
                    if (isFloor && this._myNextEnterSessionSetHeightVRWithFloor) {
                        const currentHeadPosition = this._myCurrentHead.pp_getPosition();

                        const floorHeight = this._myHeightVRWithFloor! - this._myParams.myForeheadExtraHeight;
                        const currentHeadHeight = this._getPositionEyesHeight(currentHeadPosition);

                        this._myHeightOffsetWithFloor = this._myHeightOffsetWithFloor + (floorHeight - currentHeadHeight);

                        this._updateHeightOffset();

                        this._myNextEnterSessionSetHeightVRWithFloor = false;
                    } else if (!isFloor && this._myNextEnterSessionSetHeightVRWithoutFloor) {
                        const currentHeadPosition = this._myCurrentHead.pp_getPosition();

                        const floorHeight = this._myHeightVRWithoutFloor! - this._myParams.myForeheadExtraHeight;
                        const currentHeadHeight = this._getPositionEyesHeight(currentHeadPosition);

                        this._myHeightOffsetWithoutFloor = this._myHeightOffsetWithoutFloor + (floorHeight - currentHeadHeight);

                        this._updateHeightOffset();

                        this._myNextEnterSessionSetHeightVRWithoutFloor = false;
                    }
                }
            }
        }

        if (this.isSynced()) {
            this._myCurrentHead.pp_getTransformLocalQuat(this._myCurrentHeadTransformLocalQuat);
        }

        if (this._myParams.myDebugEnabled && Globals.isDebugEnabled(this._myParams.myEngine)) {
            this._debugUpdate(dt);
        }
    }

    private _setHeightHead(heightNonVR: number, heightVRWithoutFloor: number | null, heightVRWithFloor: number | null, setOnlyForActiveOne: boolean = true): void {
        if (!setOnlyForActiveOne || !this._mySessionActive) {
            this._setHeightHeadNonVR(heightNonVR);
        }

        if (!setOnlyForActiveOne || this._mySessionActive) {
            this._setHeightHeadVRWithoutFloor(heightVRWithoutFloor);
            this._setHeightHeadVRWithFloor(heightVRWithFloor);
        }

        this._updateHeightOffset();

        if (!this._mySessionActive) {
            this._setCameraNonXRHeight(this._myHeightNonVR);
        }
    }

    private _setHeightHeadNonVR(height: number): void {
        this._myHeightNonVR = height;
        this._myHeightNonVROnEnterSession = height;
    }

    private _setHeightHeadVRWithoutFloor(heightWithoutFloor: number | null): void {
        if (heightWithoutFloor != null) {
            this._myHeightVRWithoutFloor = heightWithoutFloor;
            this._myNextEnterSessionSetHeightVRWithoutFloor = false;

            if (this._mySessionActive) {
                this._myHeightOffsetWithoutFloor = this._myHeightOffsetWithoutFloor + (heightWithoutFloor - this.getHeightHead());
            } else {
                this._myNextEnterSessionSetHeightVRWithoutFloor = true;
            }
        } else {
            this._myHeightVRWithoutFloor = null;
            this._myHeightOffsetWithoutFloor = 0;
        }
    }

    private _setHeightHeadVRWithFloor(heightWithFloor: number | null): void {
        if (heightWithFloor != null) {
            this._myHeightVRWithFloor = heightWithFloor;
            this._myNextEnterSessionSetHeightVRWithFloor = false;

            if (this._mySessionActive) {
                this._myHeightOffsetWithFloor = this._myHeightOffsetWithFloor + (heightWithFloor - this.getHeightHead());
            } else {
                this._myNextEnterSessionSetHeightVRWithFloor = true;
            }
        } else {
            this._myHeightVRWithFloor = null;
            this._myHeightOffsetWithFloor = 0;
        }
    }

    private _shouldNonVRUseVRWithFloor(): boolean {
        return (this._myLastReferenceSpaceIsFloorBased == null && this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.FLOOR_THEN_KEEP_VR) ||
            (this._myLastReferenceSpaceIsFloorBased != null && this._myLastReferenceSpaceIsFloorBased &&
                (this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.NO_FLOOR_THEN_KEEP_VR || this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.FLOOR_THEN_KEEP_VR));
    }

    private _shouldNonVRUseVRWithoutFloor(): boolean {
        return (this._myLastReferenceSpaceIsFloorBased == null && this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.NO_FLOOR_THEN_KEEP_VR) ||
            (this._myLastReferenceSpaceIsFloorBased != null && !this._myLastReferenceSpaceIsFloorBased &&
                (this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.NO_FLOOR_THEN_KEEP_VR || this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.FLOOR_THEN_KEEP_VR));
    }

    private _setCameraNonXRHeight(height: number): void {
        // Implemented outside class definition
    }

    private _getPositionEyesHeight(position: Readonly<Vector3>): number {
        // Implemented outside class definition
    }

    private _onXRSessionStart(manualCall: boolean, session: XRSession): void {
        // Implemented outside class definition
    }

    private _onXRSessionEnd(): void {
        // Implemented outside class definition
    }

    private _onXRSessionBlurStart(session: XRSession): void {
        // Implemented outside class definition
    }

    private _onXRSessionBlurEnd(session: XRSession): void {
        // Implemented outside class definition
    }

    private _onViewReset(): void {
        // Implemented outside class definition
    }

    private _blurEndResync(): void {
        // Implemented outside class definition
    }

    private _sessionChangeResync(): void {
        // Implemented outside class definition
    }

    private _setReferenceSpaceHeightOffset(offset: Readonly<Vector3>, amountToRemove: number): void {
        // Implemented outside class definition
    }

    private _updateHeightOffset(): void {
        // Implemented outside class definition
    }

    private _getHeadTransformFromLocal(transformLocal) {
        // Implemented outside class definition
    }

    private _resyncHeadRotationForward(resyncHeadRotation) {
        // Implemented outside class definition
    }

    private _debugUpdate(dt: number): void {
        Globals.getDebugVisualManager(this._myParams.myEngine)!.drawLineEnd(0, this.getPositionFeet(), this.getPositionHead(), vec4_create(1, 0, 0, 1), 0.01);

        console.error(this.getHeightEyes());
    }

    public destroy(): void {
        this._myDestroyed = true;

        XRUtils.getReferenceSpace(this._myParams.myEngine)?.removeEventListener?.("reset", this._myViewResetEventListener);
        XRUtils.getSession(this._myParams.myEngine)?.removeEventListener("visibilitychange", this._myVisibilityChangeEventListener);
        XRUtils.unregisterSessionStartEndEventListeners(this, this._myParams.myEngine);
    }

    public isDestroyed(): boolean {
        return this._myDestroyed;
    }
}



// IMPLEMENTATION

PlayerHeadManager.prototype.getHeightEyes = function () {
    let headPosition = vec3_create();
    return function getHeightEyes() {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let eyesHeight = this._getPositionEyesHeight(headPosition);

        return eyesHeight;
    };
}();

PlayerHeadManager.prototype.getTransformFeetQuat = function () {
    let feetPosition = vec3_create();
    let feetRotationQuat = quat_create();
    return function getTransformFeetQuat(outTransformFeetQuat = quat2_create()) {
        outTransformFeetQuat.quat2_setPositionRotationQuat(this.getPositionFeet(feetPosition), this.getRotationFeetQuat(feetRotationQuat));
        return outTransformFeetQuat;
    };
}();

PlayerHeadManager.prototype.getRotationFeetQuat = function () {
    let playerUp = vec3_create();
    let headForward = vec3_create();
    return function getRotationFeetQuat(outRotationFeetQuat = quat_create()) {
        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);
        headForward = this._myCurrentHead.pp_getForward(headForward);

        // Feet are considered to always be flat on the player up
        let angleWithUp = headForward.vec3_angle(playerUp);
        let mingAngle = 10;
        if (angleWithUp < mingAngle) {
            headForward = this._myCurrentHead.pp_getDown(headForward);
        } else if (angleWithUp > 180 - mingAngle) {
            headForward = this._myCurrentHead.pp_getUp(headForward);
        }

        headForward = headForward.vec3_removeComponentAlongAxis(playerUp, headForward);
        headForward.vec3_normalize(headForward);

        outRotationFeetQuat.quat_setUp(playerUp, headForward);
        return outRotationFeetQuat;
    };
}();

PlayerHeadManager.prototype.getPositionFeet = function () {
    let headPosition = vec3_create();
    let playerUp = vec3_create();
    return function getPositionFeet(outPositionFeet = vec3_create()) {
        headPosition = this._myCurrentHead.pp_getPosition(headPosition);
        let headHeight = this._getPositionEyesHeight(headPosition);

        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);
        outPositionFeet = headPosition.vec3_sub(playerUp.vec3_scale(headHeight, outPositionFeet), outPositionFeet);

        return outPositionFeet;
    };
}();

PlayerHeadManager.prototype.moveFeet = function moveFeet(movement) {
    Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_translate(movement);
};

PlayerHeadManager.prototype.rotateFeetQuat = function () {
    let playerUp = vec3_create();
    let rotationAxis = vec3_create();
    let currentHeadPosition = vec3_create();
    let currentFeetRotation = quat_create();
    let newFeetRotation = quat_create();
    let fixedNewFeetRotation = quat_create();
    let newFeetForward = vec3_create();
    let fixedRotation = quat_create();
    let newHeadPosition = vec3_create();
    let headAdjustmentMovement = vec3_create();
    return function rotateFeetQuat(rotationQuat, keepUpOverride = null) {
        let angle = rotationQuat.quat_getAngleRadians();
        if (angle <= 0.00001) {
            return;
        }

        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);
        rotationAxis = rotationQuat.quat_getAxis(rotationAxis);

        if (!rotationAxis.vec3_isOnAxis(playerUp) &&
            ((keepUpOverride == null && this._myParams.myFeetRotationKeepUp) || (keepUpOverride))) {
            currentFeetRotation = this.getRotationFeetQuat(currentFeetRotation);

            newFeetRotation = currentFeetRotation.quat_rotateQuat(rotationQuat, newFeetRotation);
            newFeetForward = newFeetRotation.quat_getForward(newFeetForward);

            fixedNewFeetRotation.quat_copy(newFeetRotation);
            fixedNewFeetRotation.quat_setUp(playerUp, newFeetForward);

            fixedRotation = currentFeetRotation.quat_rotationToQuat(fixedNewFeetRotation, fixedRotation);
        } else {
            fixedRotation.quat_copy(rotationQuat);
        }

        Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_rotateAroundQuat(fixedRotation, currentHeadPosition);

        newHeadPosition = this._myCurrentHead.pp_getPosition(newHeadPosition);

        headAdjustmentMovement = currentHeadPosition.vec3_sub(newHeadPosition, headAdjustmentMovement);
        if (headAdjustmentMovement.vec3_length() > 0.00001) {
            this.moveFeet(headAdjustmentMovement);
        }
    };
}();

PlayerHeadManager.prototype.rotateHeadQuat = function () {
    let newHeadRotation = quat_create();
    let newHeadUp = vec3_create();
    return function rotateHeadQuat(rotationQuat) {
        if (this.canRotateHead()) {
            this._myCurrentHead.pp_rotateQuat(rotationQuat);
            newHeadRotation = this._myCurrentHead.pp_getRotationQuat(newHeadRotation);

            Globals.getPlayerObjects(this._myParams.myEngine).myHead.pp_setRotationQuat(newHeadRotation);

            if (!this._mySessionActive) {
                newHeadRotation = newHeadRotation.quat_rotateAxisRadians(Math.PI, newHeadRotation.quat_getUp(newHeadUp), newHeadRotation);
                Globals.getPlayerObjects(this._myParams.myEngine).myCameraNonXR.pp_setRotationQuat(newHeadRotation);
            }
        }
    };
}();

PlayerHeadManager.prototype.setRotationFeetQuat = function () {
    let currentRotationQuat = quat_create();
    let rotationQuatToRotate = quat_create();
    return function setRotationFeetQuat(rotationQuat, keepUpOverride = null) {
        currentRotationQuat = this.getRotationFeetQuat(currentRotationQuat);
        rotationQuatToRotate = currentRotationQuat.quat_rotationToQuat(rotationQuat, rotationQuatToRotate);
        this.rotateFeetQuat(rotationQuatToRotate, keepUpOverride);
    };
}();

PlayerHeadManager.prototype.setRotationHeadQuat = function () {
    let currentRotationQuat = quat_create();
    let rotationQuatToRotate = quat_create();
    return function setRotationHeadQuat(rotationQuat) {
        currentRotationQuat = this.getRotationHeadQuat(currentRotationQuat);
        rotationQuatToRotate = currentRotationQuat.quat_rotationToQuat(rotationQuat, rotationQuatToRotate);
        this.rotateHeadQuat(rotationQuatToRotate);
    };
}();

PlayerHeadManager.prototype.teleportPositionHead = function () {
    let currentHeadPosition = vec3_create();
    let teleportMovementToPerform = vec3_create();
    return function teleportPositionHead(teleportPosition) {
        currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentHeadPosition, teleportMovementToPerform);
        this.moveFeet(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportPositionFeet = function () {
    let currentFeetPosition = vec3_create();
    let teleportMovementToPerform = vec3_create();
    return function teleportPositionFeet(teleportPosition) {
        currentFeetPosition = this.getPositionFeet(currentFeetPosition);
        teleportMovementToPerform = teleportPosition.vec3_sub(currentFeetPosition, teleportMovementToPerform);
        this.moveFeet(teleportMovementToPerform);
    };
}();

PlayerHeadManager.prototype.teleportPlayerToHeadTransformQuat = function () {
    let headPosition = vec3_create();
    let playerUp = vec3_create();
    let flatCurrentPlayerPosition = vec3_create();
    let flatNewPlayerPosition = vec3_create();
    let teleportMovement = vec3_create();
    let playerForward = vec3_create();
    let headForward = vec3_create();
    let referenceSpaceForward = vec3_create();
    let referenceSpaceForwardNegated = vec3_create();
    let rotationToPerform = quat_create();
    return function teleportPlayerToHeadTransformQuat(headTransformQuat) {
        headPosition = headTransformQuat.quat2_getPosition(headPosition);

        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);
        flatCurrentPlayerPosition = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getPosition(flatCurrentPlayerPosition).vec3_removeComponentAlongAxis(playerUp, flatCurrentPlayerPosition);
        flatNewPlayerPosition = headPosition.vec3_removeComponentAlongAxis(playerUp, flatNewPlayerPosition);

        teleportMovement = flatNewPlayerPosition.vec3_sub(flatCurrentPlayerPosition, teleportMovement);
        Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_translate(teleportMovement);

        playerForward = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getForward(playerForward);
        headForward = headTransformQuat.quat2_getForward(headForward);

        rotationToPerform = playerForward.vec3_rotationToPivotedQuat(headForward, playerUp, rotationToPerform);

        Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_rotateQuat(rotationToPerform);

        // Adjust player rotation based on the reference space rotation, which should not actually be touched,
        // but just in case

        playerForward = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getForward(playerForward);

        referenceSpaceForward = Globals.getPlayerObjects(this._myParams.myEngine).myReferenceSpace.pp_getForward(referenceSpaceForward);
        referenceSpaceForwardNegated = referenceSpaceForward.vec3_negate(referenceSpaceForwardNegated);

        rotationToPerform = referenceSpaceForwardNegated.vec3_rotationToPivotedQuat(playerForward, playerUp, rotationToPerform);

        Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_rotateQuat(rotationToPerform);
    };
}();

PlayerHeadManager.prototype.lookAtFeet = function () {
    let direction = vec3_create();
    let feetPosition = vec3_create();
    return function lookAtFeet(position, up = null, keepUpOverride = null) {
        feetPosition = this.getPositionFeet(feetPosition);
        direction = position.vec3_sub(feetPosition, direction).vec3_normalize(direction);

        this.lookToFeet(direction, up, keepUpOverride);
    };
}();

PlayerHeadManager.prototype.lookToFeet = function () {
    let feetRotation = quat_create();
    return function lookToFeet(direction, up = null, keepUpOverride = null) {
        feetRotation = this.getRotationFeetQuat(feetRotation);
        feetRotation.quat_setForward(direction, up);
        this.setRotationFeetQuat(feetRotation, keepUpOverride);
    };
}();

PlayerHeadManager.prototype.lookAtHead = function () {
    let direction = vec3_create();
    let headPosition = vec3_create();
    return function lookAtHead(position, up = null) {
        headPosition = this.getPositionHead(headPosition);
        direction = position.vec3_sub(headPosition, direction).vec3_normalize(direction);

        this.lookToHead(direction, up);
    };
}();

PlayerHeadManager.prototype.lookToHead = function () {
    let headRotation = quat_create();
    return function lookToHead(direction, up = null) {
        headRotation = this.getRotationHeadQuat(headRotation);
        headRotation.quat_setForward(direction, up);
        this.setRotationHeadQuat(headRotation);
    };
}();

PlayerHeadManager.prototype._getPositionEyesHeight = function () {
    let playerPosition = vec3_create();
    let playerUp = vec3_create();
    let heightVector = vec3_create();
    return function _getPositionEyesHeight(position) {
        playerPosition = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getPosition(playerPosition);
        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);

        heightVector = position.vec3_sub(playerPosition, heightVector).vec3_componentAlongAxis(playerUp, heightVector);
        let height = heightVector.vec3_length();
        if (!playerUp.vec3_isConcordant(heightVector)) {
            height = -height;
        }

        return height;
    };
}();

// #TODO What happens if the player go in the blurred state before the scene has loaded?
PlayerHeadManager.prototype._onXRSessionStart = function () {
    return function _onXRSessionStart(manualCall, session) {
        let nonVRCurrentEyesHeight = this._getPositionEyesHeight(Globals.getPlayerObjects(this._myParams.myEngine).myCameraNonXR.pp_getPosition());
        this._myHeightNonVROnEnterSession = nonVRCurrentEyesHeight + this._myParams.myForeheadExtraHeight;

        this._myBlurRecoverHeadTransform = null;
        this._myVisibilityHidden = false;

        this._myDelaySessionChangeResyncCounter = 0;
        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();
        this._myDelayNextEnterSessionSetHeightVRCounter = 0;

        let referenceSpace = XRUtils.getReferenceSpace(this._myParams.myEngine);

        if (referenceSpace.addEventListener != null) {
            this._myViewResetEventListener = this._onViewReset.bind(this);
            referenceSpace.addEventListener("reset", this._myViewResetEventListener);
        }

        this._myLastReferenceSpaceIsFloorBased = XRUtils.isReferenceSpaceFloorBased(this._myParams.myEngine);

        this._myVisibilityChangeEventListener = function (event) {
            if (event.session.visibilityState != "visible") {
                if (!this._mySessionBlurred) {
                    this._onXRSessionBlurStart(event.session);
                }

                this._myVisibilityHidden = session.visibilityState == "hidden";
            } else {
                if (this._mySessionBlurred) {
                    this._onXRSessionBlurEnd(event.session);
                }

                this._myVisibilityHidden = false;
            }
        }.bind(this);

        session.addEventListener("visibilitychange", this._myVisibilityChangeEventListener);

        if (this._myParams.mySessionChangeResyncEnabled && !manualCall && this._myActive) {
            if (this._myDelaySessionChangeResyncCounter == 0) {
                this._mySessionChangeResyncHeadTransform = this._getHeadTransformFromLocal(this._myCurrentHeadTransformLocalQuat);
            }

            this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
        } else {
            this._myDelaySessionChangeResyncCounter = 0;
            this._mySessionChangeResyncHeadTransform = null;
        }

        if (this._myNextEnterSessionSetHeightVRWithFloor || this._myNextEnterSessionSetHeightVRWithoutFloor) {
            this._myDelayNextEnterSessionSetHeightVRCounter = this._myResyncCounterFrames;
        }

        this._mySessionActive = true;
        this._mySessionBlurred = false;

        if (this._myActive) {
            this._updateHeightOffset();
        }
    };
}();

PlayerHeadManager.prototype._onXRSessionEnd = function () {
    return function _onXRSessionEnd(session) {
        if (this._myParams.mySessionChangeResyncEnabled && this._myActive) {
            if (this._myDelaySessionChangeResyncCounter == 0) {
                let previousHeadTransform = this._getHeadTransformFromLocal(this._myCurrentHeadTransformLocalQuat);

                if (this._myBlurRecoverHeadTransform != null) {
                    previousHeadTransform = this._myBlurRecoverHeadTransform;
                }

                this._mySessionChangeResyncHeadTransform = previousHeadTransform;
            }

            this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
        } else {
            this._myDelaySessionChangeResyncCounter = 0;
            this._mySessionChangeResyncHeadTransform = null;
        }

        this._myDelayNextEnterSessionSetHeightVRCounter = 0;

        this._myVisibilityChangeEventListener = null;
        this._myViewResetEventListener = null;

        this._myBlurRecoverHeadTransform = null;
        this._myVisibilityHidden = false;

        this._myDelayBlurEndResyncCounter = 0;
        this._myDelayBlurEndResyncTimer.reset();

        this._mySessionActive = false;
        this._mySessionBlurred = false;

        if (this._myActive) {
            this._updateHeightOffset();

            if (this._myParams.myExitSessionResetNonVRTransformLocal) {
                this.resetCameraNonXR();
            } else {
                this._setCameraNonXRHeight(this._myHeightNonVROnEnterSession);
            }
        }
    };
}();

PlayerHeadManager.prototype._onXRSessionBlurStart = function () {
    return function _onXRSessionBlurStart(session) {
        if (this._myActive) {
            if (this._myParams.myBlurEndResyncEnabled && this._myBlurRecoverHeadTransform == null && this._mySessionActive) {
                if (this._myDelaySessionChangeResyncCounter > 0) {
                    this._myBlurRecoverHeadTransform = this._mySessionChangeResyncHeadTransform;
                } else {
                    this._myBlurRecoverHeadTransform = this._getHeadTransformFromLocal(this._myCurrentHeadTransformLocalQuat);
                }
            } else if (!this._mySessionActive || !this._myParams.myBlurEndResyncEnabled) {
                this._myBlurRecoverHeadTransform = null;
            }
        }

        this._myDelayBlurEndResyncCounter = 0;

        this._mySessionBlurred = true;
    };
}();

PlayerHeadManager.prototype._onXRSessionBlurEnd = function () {
    return function _onXRSessionBlurEnd(session) {
        if (this._myActive) {
            if (this._myDelaySessionChangeResyncCounter == 0) {
                if (this._myParams.myBlurEndResyncEnabled && this._myBlurRecoverHeadTransform != null && this._mySessionActive) {
                    this._myDelayBlurEndResyncCounter = this._myResyncCounterFrames;
                    if (this._myVisibilityHidden) {
                        //this._myDelayBlurEndResyncTimer.start();

                        // This was added because on the end of hidden u can have the resync delay cause of the guardian resync
                        // but I just decided to skip this since it's not reliable and the guardian resync can happen in other cases
                        // with no notification anyway
                    }
                } else {
                    this._myBlurRecoverHeadTransform = null;
                    this._myDelayBlurEndResyncCounter = 0;
                }
            } else {
                this._myDelaySessionChangeResyncCounter = this._myResyncCounterFrames;
                this._myBlurRecoverHeadTransform = null;
            }
        }

        this._mySessionBlurred = false;
    };
}();

PlayerHeadManager.prototype._onViewReset = function () {
    let identityTransformQuat = Quat2Utils.identity(quat2_create());
    let prevHeadPosition = vec3_create();
    let resetHeadPosition = vec3_create();
    return function _onViewReset() {
        if (this._myActive) {
            if (!this._myViewResetThisFrame && this._myParams.myResetTransformOnViewResetEnabled && this._mySessionActive && this.isSynced()) {
                this._myViewResetThisFrame = true;
                let previousHeadTransformQuat = this._getHeadTransformFromLocal(this._myCurrentHeadTransformLocalQuat);
                this.teleportPlayerToHeadTransformQuat(previousHeadTransformQuat);

                let isFloor = XRUtils.isReferenceSpaceFloorBased(this._myParams.myEngine);
                if (!isFloor) {
                    let resetHeadTransformQuat = this._getHeadTransformFromLocal(identityTransformQuat);
                    let prevHeadHeight = this._getPositionEyesHeight(previousHeadTransformQuat.quat2_getPosition(prevHeadPosition));
                    let currentHeadHeight = this._getPositionEyesHeight(resetHeadTransformQuat.quat2_getPosition(resetHeadPosition));
                    this._myHeightOffsetWithoutFloor = this._myHeightOffsetWithoutFloor + (prevHeadHeight - currentHeadHeight);
                    this._updateHeightOffset();
                }
            }
        }
    };
}();

PlayerHeadManager.prototype._blurEndResync = function () {
    let playerUp = vec3_create();
    let currentHeadPosition = vec3_create();
    let recoverHeadPosition = vec3_create();
    let flatCurrentHeadPosition = vec3_create();
    let flatRecoverHeadPosition = vec3_create();
    let recoverMovement = vec3_create();
    let recoverHeadForward = vec3_create();
    let currentHeadForward = vec3_create();
    let rotationToPerform = quat_create();
    return function _blurEndResync() {
        if (this._myBlurRecoverHeadTransform != null) {
            if (this._mySessionChangeResyncHeadTransform != null) {
                this._myBlurRecoverHeadTransform = null;
                this._sessionChangeResync();
            } else {
                playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);

                currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
                recoverHeadPosition = this._myBlurRecoverHeadTransform.quat2_getPosition(recoverHeadPosition);

                flatCurrentHeadPosition = currentHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatCurrentHeadPosition);
                flatRecoverHeadPosition = recoverHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatRecoverHeadPosition);

                recoverMovement = flatRecoverHeadPosition.vec3_sub(flatCurrentHeadPosition, recoverMovement);
                this.moveFeet(recoverMovement);

                recoverHeadForward = this._myBlurRecoverHeadTransform.quat2_getForward(recoverHeadForward);
                currentHeadForward = this._myCurrentHead.pp_getForward(currentHeadForward);
                rotationToPerform = currentHeadForward.vec3_rotationToPivotedQuat(recoverHeadForward, playerUp, rotationToPerform);

                if (this._myParams.myBlurEndResyncRotation) {
                    this.rotateFeetQuat(rotationToPerform);
                }

                this._myBlurRecoverHeadTransform = null;
            }
        }
    };
}();

PlayerHeadManager.prototype._sessionChangeResync = function () {
    let currentHeadPosition = vec3_create();
    let resyncHeadPosition = vec3_create();
    let resyncHeadRotation = quat_create();
    let playerUp = vec3_create();
    let flatCurrentHeadPosition = vec3_create();
    let flatResyncHeadPosition = vec3_create();
    let resyncMovement = vec3_create();
    let resyncHeadForward = vec3_create();
    let resyncHeadUp = vec3_create();
    let resyncHeadRight = vec3_create();
    let playerPosition = vec3_create();
    let newPlayerPosition = vec3_create();
    let fixedHeadRight = vec3_create();
    let fixedHeadLeft = vec3_create();
    let fixedHeadUp = vec3_create();
    let fixedHeadForward = vec3_create();
    let fixedHeadRotation = quat_create();
    return function _sessionChangeResync() {
        if (this._myBlurRecoverHeadTransform == null && this._mySessionChangeResyncHeadTransform != null) {
            if (this._mySessionActive) {
                currentHeadPosition = this._myCurrentHead.pp_getPosition(currentHeadPosition);
                resyncHeadPosition = this._mySessionChangeResyncHeadTransform.quat2_getPosition(resyncHeadPosition);
                resyncHeadRotation = this._mySessionChangeResyncHeadTransform.quat2_getRotationQuat(resyncHeadRotation);

                playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);

                flatCurrentHeadPosition = currentHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatCurrentHeadPosition);
                flatResyncHeadPosition = resyncHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatResyncHeadPosition);

                resyncMovement = flatResyncHeadPosition.vec3_sub(flatCurrentHeadPosition, resyncMovement);
                this.moveFeet(resyncMovement);

                if (this._myParams.myEnterSessionResyncHeight || this._myParams.myNextEnterSessionResyncHeight) {
                    this._myParams.myNextEnterSessionResyncHeight = false;
                    let resyncHeadHeight = this._getPositionEyesHeight(resyncHeadPosition);
                    let currentHeadHeight = this._getPositionEyesHeight(currentHeadPosition);

                    this._myHeightVRWithoutFloor = resyncHeadHeight + this._myParams.myForeheadExtraHeight;
                    this._myHeightVRWithFloor = resyncHeadHeight + this._myParams.myForeheadExtraHeight;
                    this._myHeightOffsetWithFloor = this._myHeightOffsetWithFloor + (resyncHeadHeight - currentHeadHeight);
                    this._myHeightOffsetWithoutFloor = this._myHeightOffsetWithoutFloor + (resyncHeadHeight - currentHeadHeight);

                    this._updateHeightOffset();

                    this._myNextEnterSessionSetHeightVRWithFloor = false;
                    this._myNextEnterSessionSetHeightVRWithoutFloor = false;
                }

                this._resyncHeadRotationForward(resyncHeadRotation);
            } else {
                playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);

                resyncHeadPosition = this._mySessionChangeResyncHeadTransform.quat2_getPosition(resyncHeadPosition);
                flatResyncHeadPosition = resyncHeadPosition.vec3_removeComponentAlongAxis(playerUp, flatResyncHeadPosition);

                playerPosition = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getPosition(playerPosition);
                newPlayerPosition = flatResyncHeadPosition.vec3_add(playerPosition.vec3_componentAlongAxis(playerUp, newPlayerPosition), newPlayerPosition);

                Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_setPosition(newPlayerPosition);
                Globals.getPlayerObjects(this._myParams.myEngine).myCameraNonXR.pp_resetPositionLocal();

                if (this._myParams.myExitSessionResyncHeight) {
                    let resyncHeadHeight = this._getPositionEyesHeight(resyncHeadPosition);
                    this._myHeightNonVR = resyncHeadHeight + this._myParams.myForeheadExtraHeight;
                }

                this._updateHeightOffset();

                if (this._myParams.myExitSessionResyncHeight || this._myParams.myExitSessionResetNonVRTransformLocal) {
                    this._setCameraNonXRHeight(this._myHeightNonVR);
                } else {
                    this._setCameraNonXRHeight(this._myHeightNonVROnEnterSession);
                }

                resyncHeadRotation = this._mySessionChangeResyncHeadTransform.quat2_getRotationQuat(resyncHeadRotation);

                if (this._myParams.myExitSessionRemoveRightTilt ||
                    this._myParams.myExitSessionAdjustMaxVerticalAngle || !this._myParams.myExitSessionResyncVerticalAngle) {
                    resyncHeadForward = resyncHeadRotation.quat_getForward(resyncHeadForward);
                    resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);

                    fixedHeadRight = resyncHeadForward.vec3_cross(playerUp, fixedHeadRight);
                    fixedHeadRight.vec3_normalize(fixedHeadRight);

                    if (!resyncHeadUp.vec3_isConcordant(playerUp)) {
                        let angleForwardUp = resyncHeadForward.vec3_angle(playerUp);
                        let negateAngle = 45;
                        if (angleForwardUp > (180 - negateAngle) || angleForwardUp < negateAngle) {
                            // This way I get a good fixed result for both head upside down and head rotated on forward
                            // When the head is looking down and a bit backward (more than 135 degrees), I want the forward to actually
                            // be the opposite because it's like u rotate back the head up and look forward again
                            fixedHeadRight.vec3_negate(fixedHeadRight);
                        }
                    }

                    if (fixedHeadRight.vec3_isZero(0.000001)) {
                        fixedHeadRight = resyncHeadRotation.quat_getRight(fixedHeadRight);
                    }

                    fixedHeadUp = fixedHeadRight.vec3_cross(resyncHeadForward, fixedHeadUp);
                    fixedHeadUp.vec3_normalize(fixedHeadUp);
                    fixedHeadForward = fixedHeadUp.vec3_cross(fixedHeadRight, fixedHeadForward);
                    fixedHeadForward.vec3_normalize(fixedHeadForward);

                    fixedHeadRotation.quat_fromAxes(fixedHeadRight.vec3_negate(fixedHeadLeft), fixedHeadUp, fixedHeadForward);
                    resyncHeadRotation.quat_copy(fixedHeadRotation);
                }

                if (this._myParams.myExitSessionAdjustMaxVerticalAngle || !this._myParams.myExitSessionResyncVerticalAngle) {
                    resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);
                    resyncHeadRight = resyncHeadRotation.quat_getRight(resyncHeadRight);

                    let maxVerticalAngle = Math.max(0, this._myParams.myExitSessionMaxVerticalAngle - 0.0001);
                    if (!this._myParams.myExitSessionResyncVerticalAngle) {
                        maxVerticalAngle = 0;
                    }

                    let angleWithUp = Math.pp_angleClamp(resyncHeadUp.vec3_angleSigned(playerUp, resyncHeadRight));
                    if (Math.abs(angleWithUp) > maxVerticalAngle) {
                        let fixAngle = (Math.abs(angleWithUp) - maxVerticalAngle) * Math.pp_sign(angleWithUp);
                        resyncHeadRotation = resyncHeadRotation.quat_rotateAxis(fixAngle, resyncHeadRight, resyncHeadRotation);
                    }
                }

                this.setRotationHeadQuat(resyncHeadRotation);
            }

            this._mySessionChangeResyncHeadTransform = null;
        }
    };
}();

PlayerHeadManager.prototype._resyncHeadRotationForward = function () {
    let playerUp = vec3_create();
    let resyncHeadForward = vec3_create();
    let resyncHeadUp = vec3_create();
    let fixedResyncHeadRotation = quat_create();
    return function _resyncHeadRotationForward(resyncHeadRotation) {
        playerUp = Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getUp(playerUp);
        resyncHeadForward = resyncHeadRotation.quat_getForward(resyncHeadForward);
        resyncHeadUp = resyncHeadRotation.quat_getUp(resyncHeadUp);
        fixedResyncHeadRotation.quat_copy(resyncHeadRotation);
        fixedResyncHeadRotation.quat_setUp(playerUp, resyncHeadForward);

        if (!resyncHeadUp.vec3_isConcordant(playerUp)) {
            // If it was upside down, it's like it has to rotate the neck back up,so the forward is actually on the opposite side
            fixedResyncHeadRotation.quat_rotateAxis(180, playerUp, fixedResyncHeadRotation);
        }

        this.setRotationFeetQuat(fixedResyncHeadRotation);
        return;
    };
}();

PlayerHeadManager.prototype._setCameraNonXRHeight = function () {
    let cameraNonVRPosition = vec3_create();
    let cameraNonVRPositionLocalToPlayer = vec3_create();
    let adjustedCameraNonVRPosition = vec3_create();
    let playerTranform = mat4_create();
    return function _setCameraNonXRHeight(height) {
        let eyeHeight = height - this._myParams.myForeheadExtraHeight;
        cameraNonVRPosition = Globals.getPlayerObjects(this._myParams.myEngine).myCameraNonXR.pp_getPosition(cameraNonVRPosition);
        cameraNonVRPositionLocalToPlayer = cameraNonVRPosition.vec3_convertPositionToLocal(Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getTransform(playerTranform), cameraNonVRPositionLocalToPlayer);
        cameraNonVRPositionLocalToPlayer.vec3_set(cameraNonVRPositionLocalToPlayer[0], eyeHeight, cameraNonVRPositionLocalToPlayer[2]);
        adjustedCameraNonVRPosition = cameraNonVRPositionLocalToPlayer.vec3_convertPositionToWorld(Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getTransform(playerTranform), adjustedCameraNonVRPosition);
        Globals.getPlayerObjects(this._myParams.myEngine).myCameraNonXR.pp_setPosition(adjustedCameraNonVRPosition);
    };
}();

PlayerHeadManager.prototype._updateHeightOffset = function () {
    return function _updateHeightOffset() {
        if (this._mySessionActive) {
            if (XRUtils.isReferenceSpaceFloorBased(this._myParams.myEngine)) {
                this._setReferenceSpaceHeightOffset(this._myHeightOffsetWithFloor, 0);
            } else {
                this._setReferenceSpaceHeightOffset(this._myHeightOffsetWithoutFloor, 0);
            }
        } else {
            if (this._shouldNonVRUseVRWithFloor()) {
                this._setReferenceSpaceHeightOffset(this._myHeightOffsetWithFloor, 0);
            } else if (this._shouldNonVRUseVRWithoutFloor()) {
                this._setReferenceSpaceHeightOffset(this._myHeightOffsetWithoutFloor, 0);
            } else if (this._myParams.myNonVRFloorBasedMode == NonVRReferenceSpaceMode.FLOOR) {
                this._setReferenceSpaceHeightOffset(0, 0);
            } else {
                this._setReferenceSpaceHeightOffset(this._myHeightNonVR, this._myParams.myForeheadExtraHeight);
            }
        }
    };
}();

PlayerHeadManager.prototype._setReferenceSpaceHeightOffset = function () {
    let referenceSpacePosition = vec3_create();
    let referenceSpacePositionLocalToPlayer = vec3_create();
    let adjustedReferenceSpacePosition = vec3_create();
    let playerTranform = mat4_create();
    return function _setReferenceSpaceHeightOffset(offset, amountToRemove) {
        if (offset != null) {
            referenceSpacePosition = Globals.getPlayerObjects(this._myParams.myEngine).myReferenceSpace.pp_getPosition(referenceSpacePosition);
            referenceSpacePositionLocalToPlayer = referenceSpacePosition.vec3_convertPositionToLocal(Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getTransform(playerTranform), referenceSpacePositionLocalToPlayer);
            referenceSpacePositionLocalToPlayer.vec3_set(referenceSpacePositionLocalToPlayer[0], offset - amountToRemove, referenceSpacePositionLocalToPlayer[2]);
            adjustedReferenceSpacePosition = referenceSpacePositionLocalToPlayer.vec3_convertPositionToWorld(Globals.getPlayerObjects(this._myParams.myEngine).myPlayer.pp_getTransform(playerTranform), adjustedReferenceSpacePosition);
            Globals.getPlayerObjects(this._myParams.myEngine).myReferenceSpace.pp_setPosition(adjustedReferenceSpacePosition);
        }
    };
}();

PlayerHeadManager.prototype._getHeadTransformFromLocal = function () {
    return function _getHeadTransformFromLocal(transformLocal) {
        return this._myCurrentHead.pp_convertTransformLocalToWorldQuat(transformLocal);
    };
}();