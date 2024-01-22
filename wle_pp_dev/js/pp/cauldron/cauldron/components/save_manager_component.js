import { Component } from "@wonderlandengine/api";
import { Globals } from "../../../pp/globals";
import { SaveManager } from "../save_manager";

export class SaveManagerComponent extends Component {
    static TypeName = "pp-save-manager";
    static Properties = {};

    init() {
        this._mySaveManager = null;

        // Prevents double global from same engine
        if (!Globals.hasSaveManager(this.engine)) {
            this._mySaveManager = new SaveManager();

            Globals.setSaveManager(this._mySaveManager, this.engine);
        }
    }

    update(dt) {
        if (this._mySaveManager != null) {
            this._mySaveManager.update(dt);
        }
    }

    onDestroy() {
        if (this._mySaveManager != null && Globals.getSaveManager(this.engine) == this._mySaveManager) {
            Globals.removeSaveManager(this.engine);
        }
    }
}