import { Component, Property } from "@wonderlandengine/api";
import { Globals } from "../../pp/globals.js";

export class EnableDebugComponent extends Component {
    static TypeName = "pp-enable-debug";
    static Properties = {
        _myEnable: Property.bool(true)
    };

    init() {
        this._myDebugEnabled = null;

        // Prevents double global from same engine
        if (!Globals.hasDebugEnabled(this.engine)) {
            this._myDebugEnabled = this._myEnable;

            Globals.setDebugEnabled(this._myDebugEnabled, this.engine);
        }
    }

    onActivate() {
        if (this._myDebugEnabled != null && !Globals.hasDebugEnabled(this.engine)) {
            Globals.setDebugEnabled(this._myDebugEnabled, this.engine);
        }
    }

    onDeactivate() {
        if (this._myDebugEnabled != null && Globals.isDebugEnabled(this.engine) == this._myDebugEnabled) {
            Globals.removeDebugEnabled(this.engine);
        }
    }
}