import { Gamepad, GamepadRawAxesData, GamepadRawButtonData } from "./gamepad.js";

export class UniversalGamepad extends Gamepad {

    constructor(handedness) {
        super(handedness);

        this._myGamepadCores = {}; // Switched to object instead of Map for memory optimization reason since iterating allocates a lot
        this._myGamepadCoresIDs = [];

        this._myStarted = false;

        // Support Variables
        this._myButtonData = new GamepadRawButtonData();
        this._myAxesData = new GamepadRawAxesData();
        this._myHapticActuators = [];
    }

    addGamepadCore(id, gamepadCore) {
        if (gamepadCore.getHandedness() == this.getHandedness()) {
            this._myGamepadCores[id] = gamepadCore;
            this._myGamepadCoresIDs.push(id);
            if (this._myStarted) {
                gamepadCore.start();
            }
        }
    }

    getGamepadCore(id) {
        return this._myGamepadCores[id];
    }

    removeGamepadCore(id) {
        let gamepadCore = this._myGamepadCores[id];
        if (gamepadCore != null) {
            delete this._myGamepadCores[id];
            this._myGamepadCoresIDs.pp_removeEqual(id);
        }
    }

    removeAllGamepadCores() {
        this._myGamepadCores = {};
        this._myGamepadCoresIDs = [];
    }

    getHandPose() {
        let handPose = null;

        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            if (core.isGamepadCoreActive()) {
                let currentCoreHandPose = core.getHandPose();
                if (handPose == null || (currentCoreHandPose != null && currentCoreHandPose.isValid())) {
                    handPose = currentCoreHandPose;
                }
            }

            if (handPose != null && handPose.isValid()) {
                break;
            }
        }

        return handPose;
    }

    _startHook() {
        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            core.start();
        }

        this._myStarted = true;
    }

    _preUpdate(dt) {
        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            core.preUpdate(dt);
        }
    }

    _postUpdate(dt) {
        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            core.postUpdate(dt);
        }
    }

    _getButtonData(buttonID) {
        this._myButtonData.reset();

        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            if (core.isGamepadCoreActive()) {
                let coreButtonData = core.getButtonData(buttonID);
                this._myButtonData.myPressed = this._myButtonData.myPressed || coreButtonData.myPressed;
                this._myButtonData.myTouched = this._myButtonData.myTouched || coreButtonData.myTouched;
                if (Math.abs(coreButtonData.myValue) > Math.abs(this._myButtonData.myValue)) {
                    this._myButtonData.myValue = coreButtonData.myValue;
                }
            }
        }

        return this._myButtonData;
    }

    _getAxesData(axesID) {
        this._myAxesData.reset();

        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            if (core.isGamepadCoreActive()) {
                let coreAxesData = core.getAxesData(axesID);

                if (Math.abs(coreAxesData.myAxes[0]) > Math.abs(this._myAxesData.myAxes[0])) {
                    this._myAxesData.myAxes[0] = coreAxesData.myAxes[0];
                }

                if (Math.abs(coreAxesData.myAxes[1]) > Math.abs(this._myAxesData.myAxes[1])) {
                    this._myAxesData.myAxes[1] = coreAxesData.myAxes[1];
                }
            }
        }

        return this._myAxesData;
    }

    _getHapticActuators() {
        this._myHapticActuators.pp_clear();

        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            if (core.isGamepadCoreActive()) {
                let coreHapticActuators = core.getHapticActuators();
                for (let j = 0; j < coreHapticActuators.length; j++) {
                    this._myHapticActuators.push(coreHapticActuators[j]);
                }
            }
        }

        return this._myHapticActuators;
    }

    _destroyHook() {
        for (let i = 0; i < this._myGamepadCoresIDs.length; i++) {
            let id = this._myGamepadCoresIDs[i];
            let core = this._myGamepadCores[id];
            core.destroy();
        }
    }
}