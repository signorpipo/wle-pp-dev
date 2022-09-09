/*
let visualParams = new PP.VisualTextParams();
visualParams.myText = text;
visualParams.myTransform = transform;
visualParams.myMaterial = PP.myDefaultResources.myMaterials.myText.clone();
visualParams.myMaterial.color = [1, 1, 1, 1];
PP.myVisualManager.draw(visualParams);

or

let visualText = new PP.VisualText(visualParams);
*/

PP.VisualTextParams = class VisualTextParams {

    constructor() {
        this.myText = "";
        this.myAlignment = WL.Alignment.Center;
        this.myJustification = WL.Justification.Middle;

        this.myTransform = PP.mat4_create();

        this.myMaterial = null;

        this.myType = PP.VisualElementType.TEXT;
    }
};

PP.VisualText = class VisualText {

    constructor(params = new PP.VisualTextParams()) {
        this._myParams = params;

        this._myTextObject = null;
        this._myTextComponent = null;

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
            this._myTextObject.pp_setActive(visible);
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
        this._myTextObject.pp_setTransform(this._myParams.myTransform);

        if (this._myParams.myMaterial != null) {
            this._myTextComponent.material = this._myParams.myMaterial;
        }

        this._myTextComponent.text = this._myParams.myText;
        this._myTextComponent.alignment = this._myParams.myAlignment;
        this._myTextComponent.justification = this._myParams.myJustification;

        this._myDirty = false;
    }

    _build() {
        this._myTextObject = WL.scene.addObject(PP.myVisualData.myRootObject);
        this._myTextComponent = this._myTextObject.addComponent('text');

        if (this._myParams.myMaterial == null) {
            this._myTextComponent.material = PP.myDefaultResources.myMaterials.myText.clone();
        } else {
            this._myTextComponent.material = this._myParams.myMaterial;
        }
    }

    _markDirty() {
        this._myDirty = true;

        if (this._myAutoRefresh) {
            this.update(0);
        }
    }

    clone() {
        let clonedParams = new PP.VisualTextParams();

        clonedParams.myText = this._myParams.myText.slice(0);
        clonedParams.myAlignment = this._myParams.myAlignment;
        clonedParams.myJustification = this._myParams.myJustification;

        clonedParams.myTransform.pp_copy(this._myParams.myTransform);

        if (this._myParams.myMaterial != null) {
            clonedParams.myMaterial = this._myParams.myMaterial.clone();
        }

        let clone = new PP.VisualText(clonedParams);
        clone.setAutoRefresh(this._myAutoRefresh);
        clone.setVisible(this._myVisible);
        clone._myDirty = this._myDirty;

        return clone;
    }
};