//stop obscure, insta obscure insta clear manual

PlayerObscureManagerParams = class PlayerObscureManagerParams {
    constructor() {
        this.myPlayerTransformManager = null;

        this.myObscureObject = null;
        this.myObscureMaterial = null;
        this.myObscureRadius = 0;

        this.myObscureFadeOutSeconds = 0.1;
        this.myObscureFadeInSeconds = 0.1;

        this.myObscureFadeEasingFunction = PP.EasingFunction.linear;

        // obscure based on distance ? 

        this.myDistanceToObscureWhenBodyColliding = 0;
        this.myDistanceToObscureWhenLeaning = 0;
    }
};

PlayerObscureManager = class PlayerObscureManager {
    constructor(params) {
        this._myParams = params;

        this._myObscureMaterial = null;
        this._myObscureParentObject = null;

        this._myIsObscured = false;

        this._myCurrentAlpha = 0;
        this._myFadeTimer = new PP.Timer(0, false);

        this._myFSM = new PP.FSM();
        //this._myFSM.setDebugLogActive(true, " Obscure");

        this._myFSM.addState("init");

        this._myFSM.addState("idle");

        this._myFSM.addState("clear", this._clearUpdate.bind(this));
        this._myFSM.addState("fade_out", this._fadeOutUpdate.bind(this));
        this._myFSM.addState("obscured", this._obscureUpdate.bind(this));
        this._myFSM.addState("fade_in", this._fadeInUpdate.bind(this));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "clear", "start", this._instaClear.bind(this));

        this._myFSM.addTransition("clear", "fade_out", "obscure", this._startObscuring.bind(this));
        this._myFSM.addTransition("fade_out", "obscured", "done", this._fadeOutDone.bind(this));
        this._myFSM.addTransition("fade_out", "fade_in", "clear", this._startClearing.bind(this));

        this._myFSM.addTransition("obscured", "fade_in", "clear", this._startClearing.bind(this));
        this._myFSM.addTransition("fade_in", "clear", "done", this._fadeInDone.bind(this));
        this._myFSM.addTransition("fade_in", "fade_out", "obscure", this._startObscuring.bind(this));

        this._myFSM.addTransition("clear", "clear", "insta_clear", this._instaClear.bind(this));
        this._myFSM.addTransition("obscured", "clear", "insta_clear", this._instaClear.bind(this));
        this._myFSM.addTransition("fade_in", "clear", "insta_clear", this._instaClear.bind(this));
        this._myFSM.addTransition("fade_out", "clear", "insta_clear", this._instaClear.bind(this));

        this._myFSM.addTransition("clear", "obscured", "insta_obscure", this._instaObscure.bind(this));
        this._myFSM.addTransition("obscured", "obscured", "insta_obscure", this._instaObscure.bind(this));
        this._myFSM.addTransition("fade_in", "obscured", "insta_obscure", this._instaObscure.bind(this));
        this._myFSM.addTransition("fade_out", "obscured", "insta_obscure", this._instaObscure.bind(this));

        this._myFSM.addTransition("idle", "idle", "stop", this._instaClear.bind(this));
        this._myFSM.addTransition("clear", "idle", "stop", this._instaClear.bind(this));
        this._myFSM.addTransition("obscured", "idle", "stop", this._instaClear.bind(this));
        this._myFSM.addTransition("fade_in", "idle", "stop", this._instaClear.bind(this));
        this._myFSM.addTransition("fade_out", "idle", "stop", this._instaClear.bind(this));

        this._myFSM.init("init");
        this._myFSM.perform("start");

        this._setupVisuals();
    }

    start() {
        this._myFSM.perform("start");
    }

    stop() {
        this._myFSM.perform("stop");
    }

    update(dt) {
        this._updateObscured();

        this._myFSM.update(dt);
    }

    obscureOverride(isObscured, instant = false) {
        this._myObscureOverride = isObscured;

        if (instant) {
            if (this._myObscureOverride) {
                this._myFSM.perform("insta_obscure");
            } else {
                this._myFSM.perform("insta_clear");
            }
        }
    }

    resetObscureOverride() {
        this._myObscureOverride = null;
    }

    isObscured() {
        return (this._myObscureOverride == null && this._myIsObscured) || (this._myObscureOverride != null && this._myObscureOverride);
    }

    _clearUpdate(dt) {
        if (this.isObscured()) {
            this._myFSM.perform("obscure");
        }
    }

    _obscureUpdate(dt) {
        if (!this.isObscured()) {
            this._myFSM.perform("clear");
        }
    }

    _fadeInUpdate(dt) {
        if (this.isObscured()) {
            this._myFSM.perform("obscure");
            return;
        }

        this._myFadeTimer.update(dt);
        if (this._myFadeTimer.isDone()) {
            this._myFSM.perform("done");
        } else {
            this._setObscureAlpha(1 - this._myParams.myObscureFadeEasingFunction(this._myFadeTimer.getPercentage()));
        }
    }

    _fadeOutUpdate(dt) {
        if (!this.isObscured()) {
            this._myFSM.perform("clear");
            return;
        }

        this._myFadeTimer.update(dt);
        if (this._myFadeTimer.isDone()) {
            this._myFSM.perform("done");
        } else {
            this._setObscureAlpha(this._myParams.myObscureFadeEasingFunction(this._myFadeTimer.getPercentage()));
        }
    }

    _startClearing() {
        let percentage = this._myFadeTimer.isRunning() ? this._myFadeTimer.getPercentage() : 1;
        this._myFadeTimer.start(this._myParams.myObscureFadeInSeconds);
        this._myFadeTimer.setPercentage(1 - percentage);

        this._setObscureVisible(true);
    }

    _startObscuring() {
        let percentage = this._myFadeTimer.isRunning() ? this._myFadeTimer.getPercentage() : 1;
        this._myFadeTimer.start(this._myParams.myObscureFadeOutSeconds);
        this._myFadeTimer.setPercentage(1 - percentage);

        this._setObscureVisible(true);
    }

    _fadeOutDone() {
        this._instaObscure();
    }

    _fadeInDone() {
        this._instaClear();
    }

    _instaClear() {
        this._myFadeTimer.reset();
        this._setObscureAlpha(0);
        this._setObscureVisible(false);
    }

    _instaObscure() {
        this._myFadeTimer.reset();
        this._setObscureVisible(true);
        this._setObscureAlpha(1);
    }

    _setObscureAlpha(alpha) {
        this._myCurrentAlpha = alpha;

        if (this._myParams.myObscureObject == null) {
            PP.MaterialUtils.setAlpha(this._myObscureMaterial, this._myCurrentAlpha);
        } else {
            PP.MaterialUtils.setObjectAlpha(this._myParams.myObscureObject, this._myCurrentAlpha);
        }
    }

    _updateObscured() {
        this._myIsObscured = false;

        if (this._myObscureOverride != null) {
            this._myIsObscured = this._myObscureOverride;
        } else {
            if (this._myParams.myPlayerTransformManager.isHeadColliding()) {
                this._myIsObscured = true;
            } else if (this._myParams.myPlayerTransformManager.isBodyColliding()) {
                if (this._myParams.myPlayerTransformManager.getDistanceToRealFeet() > this._myParams.myDistanceToObscureWhenBodyColliding) {
                    this._myIsObscured = true;
                }
            } else if (this._myParams.myPlayerTransformManager.isLeaning()) {
                if (this._myParams.myPlayerTransformManager.getDistanceToRealFeet() > this._myParams.myDistanceToObscureWhenLeaning) {
                    this._myIsObscured = true;
                }
            }
        }
    }

    _setupVisuals() {
        this._myObscureMaterial = null;
        if (this._myParams.myObscureMaterial != null) {
            this._myObscureMaterial = this._myParams.myObscureMaterial;
        } else {
            this._myObscureMaterial = PP.myDefaultResources.myMaterials.myFlatTransparentNoDepth.clone();
            this._myObscureMaterial.color = [0, 0, 0, 1];
        }

        this._myObscureParentObject = PP.myVisualData.myRootObject.pp_addObject();

        let obscureVisualParams = new PP.VisualMeshParams();
        obscureVisualParams.myMesh = PP.myDefaultResources.myMeshes.myInvertedSphere;
        obscureVisualParams.myMaterial = (this._myParams.myObscureMaterial != null) ? this._myParams.myObscureMaterial : this._myObscureMaterial;
        obscureVisualParams.myParent = this._myObscureParentObject;
        obscureVisualParams.myTransform.mat4_setScale([this._myParams.myObscureRadius, this._myParams.myObscureRadius, this._myParams.myObscureRadius]);
        this._myObscureVisual = new PP.VisualMesh(obscureVisualParams);

        if (this._myParams.myObscureObject != null) {
            this._myParams.myObscureObject.pp_setParent(this._myObscureParentObject, false);
            this._myParams.myObscureObject.pp_resetTransformLocal();
        }

        this._setObscureVisible(false);
    }

    _setObscureVisible(visible) {
        if (this._myParams.myObscureObject == null) {
            this._myObscureVisual.setVisible(visible);
        } else {
            this._myObscureVisual.setVisible(false);
            this._myParams.myObscureObject.pp_setActive(visible);
        }

        if (visible) {
            this._myObscureParentObject.pp_setParent(this._myParams.myPlayerTransformManager.getCurrentHead(), false);
        } else {
            this._myObscureParentObject.pp_setParent(null, false);
        }
    }

};