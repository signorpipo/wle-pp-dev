PP.UniversalGamepad = class UniversalGamepad extends PP.BaseGamepad {

    constructor(handedness) {
        super(handedness);

        this._myGamepadCores = new Map();

        this._myStarted = false;
    }

    addGamepadCore(id, gamepadCore) {
        if (gamepadCore.getHandedness() == this.getHandedness()) {
            this._myGamepadCores.set(id, gamepadCore);
            if (this._myStarted) {
                this._myGamepadCores._start();
            }
        }
    }

    getGamepadCore(id) {
        this._myGamepadCores.get(id);
    }

    removeGamepadCore(id) {
        let gamepadCore = this._myGamepadCores.get(id);
        if (gamepadCore) {
            this._myGamepadCores.delete(id);
            gamepadCore.destroy();
        }
    }

    removeAllGamepadCores() {
        for (let id of this._myGamepadCores.keys()) {
            this.removeGamepadCore(id);
        }
    }

    getHandPose() {
        let handPose = null;

        for (let core of this._myGamepadCores.values()) {
            if (core.isGamepadCoreActive()) {
                handPose = core.getHandPose();
            }

            if (handPose != null) {
                break;
            }
        }

        return handPose;
    }

    isGamepadActive() {
        let isActive = false;

        for (let core of this._myGamepadCores.values()) {
            if (core.isGamepadCoreActive()) {
                isActive = true;
                break;
            }
        }

        return isActive;
    }

    _start() {
        for (let core of this._myGamepadCores.values()) {
            core.start();
        }

        this._myStarted = true;
    }

    _preUpdate(dt) {
        for (let core of this._myGamepadCores.values()) {
            core.preUpdate(dt);
        }
    }

    _postUpdate(dt) {
        for (let core of this._myGamepadCores.values()) {
            core.postUpdate(dt);
        }
    }

    _getButtonData(buttonType) {
        let buttonData = { pressed: false, touched: false, value: 0 };

        for (let core of this._myGamepadCores.values()) {
            if (core.isGamepadCoreActive()) {
                let coreButtonData = core.getButtonData(buttonType);
                buttonData.pressed = buttonData.pressed || coreButtonData.pressed;
                buttonData.touched = buttonData.touched || coreButtonData.touched;
                if (Math.abs(coreButtonData.value) > Math.abs(buttonData.value)) {
                    buttonData.value = coreButtonData.value;
                }
            }
        }

        return buttonData;
    }

    _getAxesData() {
        let axesData = [0.0, 0.0];

        for (let core of this._myGamepadCores.values()) {
            if (core.isGamepadCoreActive()) {
                let coreAxesData = core.getAxesData();

                if (Math.abs(coreAxesData[0]) > Math.abs(axesData[0])) {
                    axesData[0] = coreAxesData[0];
                }

                if (Math.abs(coreAxesData[1]) > Math.abs(axesData[1])) {
                    axesData[1] = coreAxesData[1];
                }
            }
        }

        return axesData;
    }

    _getHapticActuators() {
        let hapticActuators = [];

        for (let core of this._myGamepadCores.values()) {
            if (core.isGamepadCoreActive()) {
                hapticActuators.push(...core.getHapticActuators());
            }
        }

        return hapticActuators;
    }
};