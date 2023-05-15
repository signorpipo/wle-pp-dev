import { Component, Type } from "@wonderlandengine/api";

export class CloneObjectComponent extends Component {
    static TypeName = "clone-object";
    static Properties = {
        _myToClone: { type: WL.Type.Object }
    };

    start() {
        this._myStarted = false;
    }

    update(dt) {
        if (this.cloned) {
            this.cloned.pp_getComponent("physx").simulate = true;
            this.cloned.pp_translate([-dt * 0.1, 0, 0]);
        }

        if (!this._myStarted) {
            this._myStarted = true;
            this.cloned = this._myToClone.pp_clone();
            this.cloned.pp_setParent(this);
            this.cloned.pp_translate([-2, 0, 0]);
        }
    }
}