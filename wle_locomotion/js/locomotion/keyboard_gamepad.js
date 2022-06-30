KeyboardGamepad = class KeyboardGamepad {
    constructor() {
        this._myUp = false;
        this._myDown = false;
        this._myRight = false;
        this._myLeft = false;

        this._myW = false;
        this._myA = false;
        this._myS = false;
        this._myD = false;

        this._myLeftAxes = [0, 0];
        this._myRightAxes = [0, 0];
    }

    start() {
        window.addEventListener('keydown', this._keyDown.bind(this));
        window.addEventListener('keyup', this._keyUp.bind(this));
    }

    update(dt) {
        this.updateLeftAxes();
        this.updateRightAxes();
    }

    getLeftAxes() {
        return this._myLeftAxes;
    }

    getRightAxes() {
        return this._myRightAxes;
    }

    updateLeftAxes() {
        this._myLeftAxes = [0, 0];

        if (this._myW) this._myLeftAxes[1] += 1.0;
        if (this._myS) this._myLeftAxes[1] += -1.0;
        if (this._myA) this._myLeftAxes[0] += -1.0;
        if (this._myD) this._myLeftAxes[0] += 1.0;
    }

    updateRightAxes() {
        this._myRightAxes = [0, 0];

        if (this._myUp) this._myRightAxes[1] += 1.0;
        if (this._myDown) this._myRightAxes[1] += -1.0;
        if (this._myLeft) this._myRightAxes[0] += -1.0;
        if (this._myRight) this._myRightAxes[0] += 1.0;
    }

    _keyDown() {
        this._keyChanged(event.keyCode, true);
    }

    _keyUp(event) {
        this._keyChanged(event.keyCode, false);
    }

    _keyChanged(keyCode, isDown) {
        switch (keyCode) {
            case 37:
                this._myLeft = isDown;
                break;
            case 38:
                this._myUp = isDown;
                break;
            case 39:
                this._myRight = isDown;
                break;
            case 40:
                this._myDown = isDown;
                break;
            case 65:
                this._myA = isDown;
                break;
            case 68:
                this._myD = isDown;
                break;
            case 83:
                this._myS = isDown;
                break;
            case 87:
                this._myW = isDown;
                break;
        }
    }
};