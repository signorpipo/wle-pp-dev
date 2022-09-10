WL.registerComponent('display-fps', {
    _myRefreshTime: { type: WL.Type.Float, default: 0.25 }
}, {
    init: function () {
    },
    start() {
        this._myTimer = new PP.Timer(this._myRefreshTime);
        this._myTotalDT = 0;
        this._myFrames = 0;

        this._myFPS = 0;

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

            this._myFPS = Math.round(this._myFrames / this._myTotalDT);

            this._myTotalDT = 0;
            this._myFrames = 0;
        }

        let head = PP.myPlayerObjects.myHead;
        let headPosition = head.pp_getPosition();
        let textPosition = headPosition.vec3_add(head.pp_getForward().vec3_scale(0.35))
            .vec3_add(head.pp_getUp().vec3_scale(-0.115)).vec3_add(head.pp_getRight().vec3_scale(0.115));

        let visualParams = new PP.VisualTextParams();
        visualParams.myText = this._myFPS.toFixed(0);

        let rotation = PP.quat_create();
        rotation.quat_setForward(head.pp_getForward().vec3_negate(), head.pp_getUp());
        visualParams.myTransform.mat4_setPositionRotationQuatScale(textPosition, rotation, [0.3, 0.3, 0.3]);

        visualParams.myMaterial = PP.myDefaultResources.myMaterials.myText.clone();
        visualParams.myMaterial.color = [0, 1, 0, 1];

        PP.myVisualManager.draw(visualParams);
    }
});