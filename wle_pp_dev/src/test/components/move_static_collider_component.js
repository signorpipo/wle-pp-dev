import { Component } from "@wonderlandengine/api";
import { vec3_create } from "../../pp/index.js";
import { Timer } from "../../pp/cauldron/cauldron/timer.js";

export class MoveStaticColliderComponent extends Component {
    static TypeName = "move-static-collider";
    static Properties = {};

    start() {
        this._mySetStaticFalseTimer = new Timer(2);
        this._mySetStaticTrueTimer = new Timer(2, false);
        this._myPhysx = this.object.pp_getComponent("physx");

        this._mySetKinematicTimer = new Timer(1, false);
    }

    update(dt) {
        if (this._mySetStaticTrueTimer.isRunning()) {
            this._mySetStaticTrueTimer.update(dt);
            if (this._mySetStaticTrueTimer.isDone()) {
                this._mySetStaticTrueTimer.reset();
                //this._myPhysx.kinematic = true;
                this._myPhysx.static = true;
                console.error("static true");
            }
        }

        if (this._mySetKinematicTimer.isRunning()) {
            this._mySetKinematicTimer.update(dt);
            if (this._mySetKinematicTimer.isDone()) {
                this._mySetKinematicTimer.reset();
                //this._myPhysx.kinematic = true;
                this.object.pp_translate(vec3_create(0, 0, 1));
                this._mySetStaticTrueTimer.start();
                console.error("moved");
            }
        }

        if (this._mySetStaticFalseTimer.isRunning()) {
            this._mySetStaticFalseTimer.update(dt);
            if (this._mySetStaticFalseTimer.isDone()) {
                this._mySetStaticFalseTimer.reset();
                this._myPhysx.static = false;
                this._mySetKinematicTimer.start();
                console.error("static false");
            }
        }
    }
}