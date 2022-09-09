/*
let visualParams = new PP.VisualTransformParams();
visualParams.myTransform = transform;
visualParams.myLength = 0.1;
PP.myVisualManager.draw(visualParams);

or

let visualTransform = new PP.VisualTransform(visualParams);
*/

PP.VisualTransformParams = class VisualTransformParams {

    constructor() {
        this.myTransform = PP.mat4_create();
        this.myLength = 0.1;
        this.myThickness = 0.005;

        this.myForwardMaterial = null;
        this.myUpMaterial = null;
        this.myRightMaterial = null;

        this.myType = PP.VisualElementType.TRANSFORM;
    }
};

PP.VisualTransform = class VisualTransform {

    constructor(params = new PP.VisualTransformParams()) {
        this._myParams = params;

        this._myVisible = false;
        this._myAutoRefresh = true;

        this._myDirty = false;

        this._myVisualRight = new PP.VisualArrow();
        this._myVisualUp = new PP.VisualArrow();
        this._myVisualForward = new PP.VisualArrow();

        if (this._myParams.myRightMaterial == null) {
            this._myVisualRight.getParams().myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            this._myVisualRight.getParams().myMaterial.color = [1, 0, 0, 1];
        } else {
            this._myVisualRight.getParams().myMaterial = this._myParams.myRightMaterial;
        }

        if (this._myParams.myUpMaterial == null) {
            this._myVisualUp.getParams().myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            this._myVisualUp.getParams().myMaterial.color = [0, 1, 0, 1];
        } else {
            this._myVisualUp.getParams().myMaterial = this._myParams.myUpMaterial;
        }

        if (this._myParams.myForwardMaterial == null) {
            this._myVisualForward.getParams().myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
            this._myVisualForward.getParams().myMaterial.color = [0, 0, 1, 1];
        } else {
            this._myVisualForward.getParams().myMaterial = this._myParams.myForwardMaterial;
        }

        this._myVisualRight.setAutoRefresh(false);
        this._myVisualUp.setAutoRefresh(false);
        this._myVisualForward.setAutoRefresh(false);

        this._refresh();

        this.setVisible(true);
    }

    setVisible(visible) {
        if (this._myVisible != visible) {
            this._myVisible = visible;
            this._myVisualRight.setVisible(visible);
            this._myVisualUp.setVisible(visible);
            this._myVisualForward.setVisible(visible);
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

        this._myVisualRight.update(dt);
        this._myVisualUp.update(dt);
        this._myVisualForward.update(dt);
    }

    _refresh() {
        let axes = this._myParams.myTransform.mat4_getAxes();
        let scale = this._myParams.myTransform.mat4_getScale();
        let maxValue = 0;
        for (let value of scale) {
            maxValue = Math.max(value, maxValue);
        }

        if (maxValue == 0) {
            scale[0] = 1;
            scale[1] = 1;
            scale[2] = 1;
        } else {
            scale[0] = scale[0] / maxValue;
            scale[1] = scale[1] / maxValue;
            scale[2] = scale[2] / maxValue;
        }

        let position = this._myParams.myTransform.mat4_getPosition();

        {
            let visualLineParams = this._myVisualRight.getParams();
            visualLineParams.myStart.vec3_copy(position);
            visualLineParams.myDirection = axes[0].vec3_negate(visualLineParams.myDirection).vec3_normalize(visualLineParams.myDirection);
            visualLineParams.myLength = Math.max(this._myParams.myLength * scale[0], 0.001);
            visualLineParams.myThickness = this._myParams.myThickness;

            if (this._myParams.myRightMaterial != null) {
                visualLineParams.myRightMaterial = this._myParams.myRightMaterial;
            }

            this._myVisualRight.paramsUpdated();
        }

        {
            let visualLineParams = this._myVisualUp.getParams();
            visualLineParams.myStart.vec3_copy(position);
            visualLineParams.myDirection = axes[1].vec3_normalize(visualLineParams.myDirection);
            visualLineParams.myLength = Math.max(this._myParams.myLength * scale[1], 0.001);
            visualLineParams.myThickness = this._myParams.myThickness;

            if (this._myParams.myUpMaterial != null) {
                visualLineParams.myUpMaterial = this._myParams.myUpMaterial;
            }

            this._myVisualUp.paramsUpdated();
        }

        {
            let visualLineParams = this._myVisualForward.getParams();
            visualLineParams.myStart.vec3_copy(position);
            visualLineParams.myDirection = axes[2].vec3_normalize(visualLineParams.myDirection);
            visualLineParams.myLength = Math.max(this._myParams.myLength * scale[2], 0.001);
            visualLineParams.myThickness = this._myParams.myThickness;

            if (this._myParams.myForwardMaterial != null) {
                visualLineParams.myForwardMaterial = this._myParams.myForwardMaterial;
            }

            this._myVisualForward.paramsUpdated();
        }

    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualTransformParams();
        clonedParams.myTransform.pp_copy(this._myParams.myTransform);
        clonedParams.myLength = this._myParams.myLength;
        clonedParams.myThickness = this._myParams.myThickness;

        if (this._myParams.myRightMaterial != null) {
            clonedParams.myRightMaterial = this._myParams.myRightMaterial.clone();
        }

        if (this._myParams.myUpMaterial != null) {
            clonedParams.myUpMaterial = this._myParams.myUpMaterial.clone();
        }

        if (this._myParams.myForwardMaterial != null) {
            clonedParams.myForwardMaterial = this._myParams.myForwardMaterial.clone();
        }

        let clone = new PP.VisualTransform(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }
};