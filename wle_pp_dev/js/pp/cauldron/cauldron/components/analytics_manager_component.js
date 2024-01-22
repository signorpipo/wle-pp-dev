import { Component } from "@wonderlandengine/api";
import { Globals } from "../../../pp/globals";
import { AnalyticsManager } from "../analytics_manager";

export class AnalyticsManagerComponent extends Component {
    static TypeName = "pp-analytics-manager";
    static Properties = {};

    init() {
        this._myAnalyticsManager = null;

        // Prevents double global from same engine
        if (!Globals.hasAnalyticsManager(this.engine)) {
            this._myAnalyticsManager = new AnalyticsManager();

            Globals.setAnalyticsManager(this._myAnalyticsManager, this.engine);
        }
    }

    update(dt) {
        if (this._myAnalyticsManager != null) {
            this._myAnalyticsManager.update(dt);
        }
    }

    onDestroy() {
        if (this._myAnalyticsManager != null && Globals.getAnalyticsManager(this.engine) == this._myAnalyticsManager) {
            Globals.removeAnalyticsManager(this.engine);
        }
    }
}