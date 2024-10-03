import { Component } from "@wonderlandengine/api";
import { Globals } from "../../pp/globals.js";
import { DebugManager } from "../debug_manager.js";

export class DebugManagerComponent extends Component {
    static TypeName = "pp-debug-manager";

    init() {
        this._myDebugManager = null;
        this._myCurrentDebugEnabled = false;

        this._myInitDone = false;
    }

    _init() {
        // Prevents double global from same engine
        if (!Globals.hasDebugManager(this.engine)) {
            this._myDebugManager = new DebugManager(this.engine);
            this._myDebugManager.setActive(this._myCurrentDebugEnabled);

            this._myDebugManager.start();

            Globals.setDebugManager(this._myDebugManager, this.engine);
        }

        this._myInitDone = true;
    }

    start() {
        if (!this._myInitDone && Globals.isDebugEnabled(this._myEngine)) {
            this._init();
        }
    }

    update(dt) {
        if (this._myDebugManager != null) {
            if (this._myCurrentDebugEnabled != Globals.isDebugEnabled(this._myEngine)) {
                this._myCurrentDebugEnabled = Globals.isDebugEnabled(this._myEngine);

                this._myDebugManager.setActive(this._myCurrentDebugEnabled);

                if (this._myCurrentDebugEnabled) {
                    if (Globals.getDebugManager(this.engine) == null) {
                        Globals.setDebugManager(this._myDebugManager, this.engine);
                    }
                } else {
                    if (Globals.getDebugManager(this.engine) == this._myDebugManager) {
                        Globals.removeDebugManager(this.engine);
                    }
                }
            }

            this._myDebugManager.update(dt);
        } else if (!this._myInitDone && Globals.isDebugEnabled(this._myEngine)) {
            this._init();
        }
    }

    onActivate() {
        if (this._myDebugManager != null) {
            if (Globals.getDebugManager(this.engine) == null) {
                Globals.setDebugManager(this._myDebugManager, this.engine);
            }
        }
    }

    onDeactivate() {
        if (this._myDebugManager != null) {
            this._myDebugManager.setActive(false);

            if (Globals.getDebugManager(this.engine) == this._myDebugManager) {
                Globals.removeDebugManager(this.engine);
            }
        }
    }

    onDestroy() {
        if (this._myDebugManager != null) {
            this._myDebugManager.destroy();
        }
    }
}