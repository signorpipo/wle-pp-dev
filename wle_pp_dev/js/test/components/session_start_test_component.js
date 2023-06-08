import { Component } from "@wonderlandengine/api";

export class TestSessionStartComponent extends Component {
    static TypeName = "test-session-start";

    start() {
        console.error("xr session exists?", this.engine.xr.session != null)
        this.engine.onXRSessionStart.add(this._onXRSessionStart.bind(this), { id: this, immediate: false });
    }

    _onXRSessionStart() {
        console.error("START");
    }
}