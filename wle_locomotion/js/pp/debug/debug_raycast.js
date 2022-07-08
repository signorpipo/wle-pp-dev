PP.DebugRaycastParams = class DebugRaycastParams {

    constructor() {
        this._myRaycastResult = new PP.RaycastResult();
        this._myRaycastResult.myRaycastSetup = new PP.RaycastSetup();
        this._myRaycastResult._myUnusedHits = [];
        this._myRaycastResult._myUnusedHits.push(new PP.RaycastResultHit());

        this.myNormalLength = 0.1;
        this.myThickness = 0.005;

        this.myType = PP.DebugDrawObjectType.RAYCAST;
    }

    get myRaycastResult() {
        return this._myRaycastResult;
    }

    set myRaycastResult(result) {
        this._myRaycastResult.myRaycastSetup.myOrigin.vec3_copy(result.myRaycastSetup.myOrigin);
        this._myRaycastResult.myRaycastSetup.myDirection.vec3_copy(result.myRaycastSetup.myDirection);
        this._myRaycastResult.myRaycastSetup.myDistance = result.myRaycastSetup.myDistance;

        if (result.myHits.length > 0) {
            let hit = null;

            if (this._myRaycastResult.myHits.length > 0) {
                hit = this._myRaycastResult.myHits[0];
            } else {
                hit = this._myRaycastResult._myUnusedHits.pop();
                this._myRaycastResult.myHits.push(hit);
            }

            hit.myPosition.vec3_copy(result.myHits[0].myPosition);
            hit.myNormal.vec3_copy(result.myHits[0].myNormal);
            hit.myDistance = result.myHits[0].myDistance;
        } else {
            if (this._myRaycastResult.myHits.length > 0) {
                this._myRaycastResult._myUnusedHits.push(this._myRaycastResult.myHits.pop());
            }
        }
    }
};

PP.DebugRaycast = class DebugRaycast {

    constructor(params = new PP.DebugRaycastParams()) {
        this._myParams = params;

        this._myDebugRaycast = new PP.DebugArrow();
        this._myDebugRaycastHit = new PP.DebugArrow();
        this._myDebugRaycast.setColor([0, 1, 0, 1]);
        this._myDebugRaycastHit.setColor([1, 0, 0, 1]);
        this._myDebugRaycast.setAutoRefresh(false);
        this._myDebugRaycastHit.setAutoRefresh(false);

        this._myVisible = true;
        this._myDirty = false;
        this._myAutoRefresh = true;

        this._refresh();
        this.setVisible(false);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;
            this._myDebugRaycast.setVisible(visible);
            if (this._myParams.myRaycastResult.myHits.length > 0) {
                this._myDebugRaycastHit.setVisible(visible);
            } else {
                this._myDebugRaycastHit.setVisible(false);
            }
        }
    }

    setAutoRefresh(autoRefresh) {
        this._myAutoRefresh = autoRefresh;
    }

    getParams() {
        return this._myParams;
    }

    setParams(params) {
        this._myParams = params;
        this._markDirty();
    }

    setRaycastResult(raycastResult) {
        this._myParams.myRaycastResult = raycastResult;

        this._markDirty();
    }

    setThickness(thickness) {
        this._myParams.myThickness = thickness;

        this._markDirty();
    }


    update(dt) {
        if (this._myDirty) {
            this._refresh();
            this._myDirty = false;
        }

        this._myDebugRaycast.update(dt);
        this._myDebugRaycastHit.update(dt);
    }

    _refresh() {
        if (this._myParams.myRaycastResult.myHits.length > 0) {
            this._myDebugRaycast.setStartDirectionLength(
                this._myParams.myRaycastResult.myRaycastSetup.myOrigin,
                this._myParams.myRaycastResult.myRaycastSetup.myDirection,
                this._myParams.myRaycastResult.myHits[0].myDistance);

            this._myDebugRaycastHit.setStartDirectionLength(
                this._myParams.myRaycastResult.myRaycastSetup.myOrigin,
                this._myParams.myRaycastResult.myRaycastSetup.myDirection.vec3_negate(),
                this._myParams.myNormalLength);

            this._myDebugRaycastHit.setVisible(this._myVisible);
        } else {
            this._myDebugRaycast.setStartDirectionLength(
                this._myParams.myRaycastResult.myRaycastSetup.myOrigin,
                this._myParams.myRaycastResult.myRaycastSetup.myDirection,
                this._myParams.myRaycastResult.myRaycastSetup.myDistance);

            this._myDebugRaycastHit.setVisible(false);
        }

        this._myDebugRaycast.setThickness(this._myParams.myThickness);
        this._myDebugRaycastHit.setThickness(this._myParams.myThickness);
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.DebugRaycastParams();
        clonedParams.myRaycastResult = this._myParams.myRaycastResult;
        clonedParams.myNormalLength = this._myParams.myNormalLength;
        clonedParams.myThickness = this._myParams.myThickness;

        let clone = new PP.DebugRaycast(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }
};