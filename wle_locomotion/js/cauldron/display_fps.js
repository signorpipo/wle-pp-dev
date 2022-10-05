WL.registerComponent('display-fps', {
    _myRefreshTime: { type: WL.Type.Float, default: 0.25 }
}, {
    init: function () {
    },
    start() {
        this._myTimer = new PP.Timer(this._myRefreshTime);
        this._myTotalDT = 0;
        this._myFrames = 0;

        this._myVisualFPSParent = this.object.pp_addObject();

        let visualParams = new PP.VisualTextParams();
        visualParams.myText = "0";

        visualParams.myTransform.mat4_setPositionRotationScale([-0.115, -0.115, 0.35], [0, 180, 0], [0.3, 0.3, 0.3]);

        visualParams.myMaterial = PP.myDefaultResources.myMaterials.myText.clone();
        visualParams.myMaterial.color = [0, 1, 0, 1];

        visualParams.myParent = this._myVisualFPSParent;

        this._myVisualFPS = new PP.VisualText(visualParams);

        this._myTempQuat2 = PP.quat2_create();

        //PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Z", 0.35, 0.1, 3));
        //PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Y", -0.115, 0.1, 3));
        //PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("X", 0.115, 0.1, 3));
    },
    update(dt) {
        this._myTotalDT += dt;
        this._myFrames++;

        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            let fps = Math.round(this._myFrames / this._myTotalDT);

            this._myVisualFPS.getParams().myText = fps.toFixed(0);
            this._myVisualFPS.paramsUpdated();

            this._myTotalDT = 0;
            this._myFrames = 0;
        }

        this._myVisualFPSParent.pp_setTransformQuat(PP.myPlayerObjects.myHead.pp_getTransformQuat(this._myTempQuat2));
    }
});