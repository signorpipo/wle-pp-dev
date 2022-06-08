WL.registerComponent('moving-physx-test', {
    _myPhysXType: { type: WL.Type.Enum, values: ['static', 'kinematic'], default: 'static' },
    _myFrameType: { type: WL.Type.Enum, values: ['single_frame', 'multiple_frames'], default: 'single_frame' },
    _myForceType: { type: WL.Type.Enum, values: ['force', 'linearVelocity'], default: 'force' },
}, {
    init: function () {
    },
    start() {
        this._myPhysX = this.object.pp_getComponent("physx");

        if (this._myPhysXType == 0) {
            this._myPhysX.active = false;
            this._myPhysX.static = true;
            //this._myPhysX.kinematic = true;
            this._myPhysX.active = true;
        } else {
            this._myPhysX.active = false;
            this._myPhysX.static = false;
            //this._myPhysX.kinematic = true;
            this._myPhysX.active = true;
        }

        this._myFSM = new PP.FSM();
        this._myFSM.setDebugLogActive(true, "Moving Physx");

        let wait = 0.2;
        this._myFSM.addState("wait_not_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("inactive_to_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("active_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("inactive_to_not_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("not_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("active_not_static", new PP.TimerState(wait, "end"));
        this._myFSM.addState("active_not_static_move", new PP.TimerState(wait, "end"));

        this._myFSM.addTransition("active_not_static_move", "inactive_to_static", "end", this._setActive.bind(this, false));
        this._myFSM.addTransition("inactive_to_static", "static", "end", this._setStatic.bind(this, true));
        this._myFSM.addTransition("static", "active_static", "end", this._setActive.bind(this, true));
        this._myFSM.addTransition("active_static", "inactive_to_not_static", "end", this._setActive.bind(this, false));
        this._myFSM.addTransition("inactive_to_not_static", "not_static", "end", this._setStatic.bind(this, false));
        this._myFSM.addTransition("not_static", "active_not_static", "end", this._setActive.bind(this, true));
        this._myFSM.addTransition("active_not_static", "active_not_static_move", "end", this._move.bind(this));

        if ((this._myFrameType == 0 && this._myPhysX.static) || (this._myFrameType == 1 && this._myPhysX.kinematic)) {
            this._myFSM.init("active_static");
        } else {
            this._myFSM.init("active_not_static_move");
        }

        this._myTimer = new PP.Timer(wait);

    },
    update(dt) {
        if (this._myFrameType == 1) {
            this._myFSM.update(dt);
        } else {
            this._myTimer.update(dt);
            if (this._myTimer.isDone()) {
                this._myTimer.start();
                if (this._myPhysXType == 0) {
                    this._myPhysX.active = false;
                    this._myPhysX.static = false;
                } else {
                    this._myPhysX.kinematic = false;
                }

                if (this._myPhysXType == 0) {
                    let translateAmount = 0.5;
                    this.object.pp_translate([Math.pp_random(-translateAmount, translateAmount), Math.pp_random(-translateAmount, translateAmount), Math.pp_random(-translateAmount, translateAmount)]);
                } else {
                    if (this._myForceType == 1) {
                        let linearVelocity = 5;
                        this._myPhysX.linearVelocity = [Math.pp_random(-linearVelocity, linearVelocity), Math.pp_random(linearVelocity, linearVelocity * 3), Math.pp_random(-linearVelocity, linearVelocity)];
                    } else {
                        let force = 500;
                        this._myPhysX.addForce([Math.pp_random(-force, force), Math.pp_random(force, force * 3), Math.pp_random(-force, force)]);
                    }
                }

                if (this._myPhysXType == 0) {
                    this._myPhysX.static = true;
                    this._myPhysX.active = true;
                } else {
                    this._myPhysX.kinematic = true;
                }
            }
        }
    },
    _setActive(active) {
        if (this._myPhysXType == 0) {
            this._myPhysX.active = active;
        }
    },
    _setStatic(static) {
        if (this._myPhysXType == 0) {
            this._myPhysX.static = static;
        } else {
            this._myPhysX.kinematic = static;
        }
    },
    _move() {
        if (this._myPhysXType == 0) {
            let translateAmount = 0.5;
            this.object.pp_translate([Math.pp_random(-translateAmount, translateAmount), Math.pp_random(-translateAmount, translateAmount), Math.pp_random(-translateAmount, translateAmount)]);
        } else {
            if (this._myForceType == 1) {
                let linearVelocity = 5;
                this._myPhysX.linearVelocity = [Math.pp_random(-linearVelocity, linearVelocity), Math.pp_random(linearVelocity, linearVelocity * 3), Math.pp_random(-linearVelocity, linearVelocity)];
            } else {
                let force = 500;
                this._myPhysX.addForce([Math.pp_random(-force, force), Math.pp_random(force, force * 3), Math.pp_random(-force, force)]);
            }
        }
    }
});