/*
let visualParams = new PP.VisualRaycastParams();
visualParams.myRaycastResult = raycastResult;
PP.myVisualManager.draw(visualParams);

or

let visualRaycast = new PP.VisualRaycast(visualParams);
*/

PP.VisualRaycastParams = class VisualRaycastParams {

    constructor() {
        this._myRaycastResult = new PP.RaycastResult();

        this.myHitNormalLength = 0.2;
        this.myThickness = 0.005;

        this.myShowOnlyFirstHit = true;

        this.myRayMaterial = null;
        this.myHitNormalMaterial = null;

        this.myType = PP.VisualElementType.RAYCAST;
    }

    get myRaycastResult() {
        return this._myRaycastResult;
    }

    set myRaycastResult(result) {
        this._myRaycastResult.copy(result);
    }
};

PP.VisualRaycast = class VisualRaycast {

    constructor(params = new PP.VisualRaycastParams()) {
        this._myParams = params;

        this._myVisible = false;
        this._myAutoRefresh = true;

        this._myDirty = false;

        this._myVisualRaycast = new PP.VisualArrow();

        if (this._myParams.myRayMaterial == null) {
            this._myVisualRaycast.getParams().myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            this._myVisualRaycast.getParams().myMaterial.color = [0, 1, 0, 1];
        } else {
            this._myVisualRaycast.getParams().myMaterial = this._myParams.myRayMaterial;
        }

        this._myVisualRaycast.setAutoRefresh(false);

        this._myVisualRaycastHitList = [];
        this._addVisualRaycastHit();

        this._refresh();

        this.setVisible(true);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;
            if (this._myParams.myRaycastResult.myRaycastSetup != null) {
                this._myVisualRaycast.setVisible(visible);
            } else {
                this._myVisualRaycast.setVisible(false);
            }

            if (this._myParams.myRaycastResult.myHits.length > 0) {
                for (let visualRaycastHit of this._myVisualRaycastHitList) {
                    visualRaycastHit.setVisible(visible);
                }
            } else {
                for (let visualRaycastHit of this._myVisualRaycastHitList) {
                    visualRaycastHit.setVisible(false);
                }
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

    paramsUpdated() {
        this._markDirty();
    }

    refresh() {
        this.update(0);
    }

    update(dt) {
        if (this._myDirty) {
            this._refresh();
            this._myDirty = false;
        }

        this._myVisualRaycast.update(dt);
        for (let visualRaycastHit of this._myVisualRaycastHitList) {
            visualRaycastHit.update(dt);
        }
    }

    _refresh() {
        for (let visualRaycastHit of this._myVisualRaycastHitList) {
            visualRaycastHit.setVisible(false);
        }

        if (this._myParams.myRaycastResult.myHits.length > 0) {
            let raycastDistance = this._myParams.myShowOnlyFirstHit ?
                this._myParams.myRaycastResult.myHits.pp_first().myDistance :
                this._myParams.myRaycastResult.myHits.pp_last().myDistance;

            {
                let visualRaycastParams = this._myVisualRaycast.getParams();
                visualRaycastParams.myStart.vec3_copy(this._myParams.myRaycastResult.myRaycastSetup.myOrigin);
                visualRaycastParams.myDirection.vec3_copy(this._myParams.myRaycastResult.myRaycastSetup.myDirection);
                visualRaycastParams.myLength = raycastDistance;
                visualRaycastParams.myThickness = this._myParams.myThickness;

                if (this._myParams.myRayMaterial != null) {
                    visualRaycastParams.myRayMaterial = this._myParams.myRayMaterial;
                }

                this._myVisualRaycast.paramsUpdated();

                this._myVisualRaycast.setVisible(this._myVisible);
            }

            let hitsToShow = this._myParams.myShowOnlyFirstHit ? 1 : this._myParams.myRaycastResult.myHits.length;
            while (hitsToShow > this._myVisualRaycastHitList.length) {
                this._addVisualRaycastHit();
            }

            for (let i = 0; i < hitsToShow; i++) {
                let visualRaycastHit = this._myVisualRaycastHitList[i];

                {
                    let visualRaycastHitParams = visualRaycastHit.getParams();
                    visualRaycastHitParams.myStart.vec3_copy(this._myParams.myRaycastResult.myHits[i].myPosition);
                    visualRaycastHitParams.myDirection.vec3_copy(this._myParams.myRaycastResult.myHits[i].myNormal);
                    visualRaycastHitParams.myLength = this._myParams.myHitNormalLength;
                    visualRaycastHitParams.myThickness = this._myParams.myThickness;

                    if (this._myParams.myHitNormalMaterial != null) {
                        visualRaycastHitParams.myHitNormalMaterial = this._myParams.myHitNormalMaterial;
                    }

                    visualRaycastHit.paramsUpdated();

                    visualRaycastHit.setVisible(this._myVisible);
                }
            }

        } else if (this._myParams.myRaycastResult.myRaycastSetup != null) {
            {
                let visualRaycastParams = this._myVisualRaycast.getParams();
                visualRaycastParams.myStart.vec3_copy(this._myParams.myRaycastResult.myRaycastSetup.myOrigin);
                visualRaycastParams.myDirection.vec3_copy(this._myParams.myRaycastResult.myRaycastSetup.myDirection);
                visualRaycastParams.myLength = this._myParams.myRaycastResult.myRaycastSetup.myDistance;
                visualRaycastParams.myThickness = this._myParams.myThickness;

                if (this._myParams.myRayMaterial != null) {
                    visualRaycastParams.myRayMaterial = this._myParams.myRayMaterial;
                }

                this._myVisualRaycast.paramsUpdated();

                this._myVisualRaycast.setVisible(this._myVisible);
            }
        } else {
            this._myVisualRaycast.setVisible(false);
        }
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualRaycastParams();
        clonedParams.myRaycastResult = this._myParams.myRaycastResult;
        clonedParams.myHitNormalLength = this._myParams.myHitNormalLength;
        clonedParams.myThickness = this._myParams.myThickness;
        clonedParams.myShowOnlyFirstHit = this._myParams.myShowOnlyFirstHit;

        if (this._myParams.myRayMaterial != null) {
            clonedParams.myRayMaterial = this._myParams.myRayMaterial.clone();
        }

        if (this._myParams.myHitNormalMaterial != null) {
            clonedParams.myHitNormalMaterial = this._myParams.myHitNormalMaterial.clone();
        }

        let clone = new PP.VisualRaycast(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }

    _addVisualRaycastHit() {
        let visualRaycastHit = new PP.VisualArrow();

        if (this._myParams.myHitNormalMaterial == null) {
            visualRaycastHit.getParams().myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            visualRaycastHit.getParams().myMaterial.color = [1, 0, 0, 1];
        } else {
            visualRaycastHit.getParams().myMaterial = this._myParams.myHitNormalMaterial;
        }

        visualRaycastHit.setAutoRefresh(false);

        this._myVisualRaycastHitList.push(visualRaycastHit);
    }
};