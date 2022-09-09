/*
let visualParams = new PP.VisualPointParams();
visualParams.myPosition = position;
visualParams.myRadius = 0.01;
visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
visualParams.myMaterial.color = [1, 1, 1, 1];
PP.myVisualManager.draw(visualParams);

or

let visuaLine = new PP.VisualLine(visualParams);
*/

PP.VisualPointParams = class VisualPointParams {

    constructor() {
        this.myPosition = [0, 0, 0];
        this.myRadius = 0;

        this.myMaterial = null;

        this.myType = PP.VisualElementType.POINT;
    }
};

PP.VisualPoint = class VisualPoint {

    constructor(params = new PP.VisualPointParams()) {
        this._myParams = params;

        this._myPointObject = null;
        this._myPointMeshComponent = null;

        this._myVisible = true;
        this._myAutoRefresh = true;

        this._myDirty = false;

        this._build();
        this._refresh();

        this.setVisible(true);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;
            this._myPointObject.pp_setActive(visible);
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
    }

    _refresh() {
        this._myPointObject.pp_setPosition(this._myParams.myPosition);
        this._myPointObject.pp_setScale(this._myParams.myRadius);

        if (this._myParams.myMaterial != null) {
            this._myPointMeshComponent.material = this._myParams.myMaterial;
        }
    }

    _build() {
        this._myPointObject = WL.scene.addObject(PP.myVisualData.myRootObject);

        this._myPointMeshComponent = this._myPointObject.addComponent('mesh');
        this._myPointMeshComponent.mesh = PP.myDefaultResources.myMeshes.mySphere;

        if (this._myParams.myMaterial == null) {
            this._myPointMeshComponent.material = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
        } else {
            this._myPointMeshComponent.material = this._myParams.myMaterial;
        }
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualPointParams();
        clonedParams.myPosition.pp_copy(this._myParams.myPosition);
        clonedParams.myRadius = this._myParams.myRadius;

        if (this._myParams.myMaterial != null) {
            clonedParams.myMaterial = this._myParams.myMaterial.clone();
        }

        let clone = new PP.VisualPoint(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }
};