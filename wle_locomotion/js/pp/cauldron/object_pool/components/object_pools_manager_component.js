import { Component } from "@wonderlandengine/api";
import { ObjectPoolsManager } from "../object_pools_manager";
import { Globals } from "../../../pp/globals";

export class ObjectPoolsManagerComponent extends Component {
    static TypeName = "pp-object-pools-manager";
    static Properties = {};

    init() {
        this._myObjectPoolsManager = null;

        // Prevents double global from same engine
        if (!Globals.hasObjectPoolsManager(this.engine)) {
            this._myObjectPoolsManager = new ObjectPoolsManager();

            Globals.setObjectPoolsManager(this._myObjectPoolsManager, this.engine);
        }
    }

    onDestroy() {
        if (this._myObjectPoolsManager != null && Globals.getObjectPoolsManager(this.engine) == this._myObjectPoolsManager) {
            Globals.removeObjectPoolsManager(this.engine);
        }
    }
}