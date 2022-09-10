PP.DebugManager = class DebugManager {
    constructor() {
        this._myDebugVisualManager = new PP.VisualManager();
    }

    getDebugVisualManager() {
        return this._myDebugVisualManager;
    }

    start() {
        this._myDebugVisualManager.start();
    }

    update(dt) {
        this._myDebugVisualManager.update(dt);
    }
};