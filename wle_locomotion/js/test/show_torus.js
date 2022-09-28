WL.registerComponent('show-torus', {
}, {
    init: function () {
    },
    start() {
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Torus Radius", 0.25, 0.1, 3));
        PP.myEasyTuneVariables.add(new PP.EasyTuneInt("Torus Segments", 12, 1));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Torus Thickness", 0.05, 0.1, 3));
        PP.myEasyTuneVariables.add(new PP.EasyTuneNumber("Torus Extra Length Multiplier", 1, 0.1, 3));

        this._myMaterial = PP.myDefaultResources.myMaterials.myPhongOpaque.clone();
        this._myMaterial.diffuseColor = [1, 0.5, 0.5, 1];
    },
    update(dt) {
        let visualParams = new PP.VisualTorusParams();
        visualParams.myRadius = PP.myEasyTuneVariables.get("Torus Radius");
        visualParams.mySegmentAmount = PP.myEasyTuneVariables.get("Torus Segments");
        visualParams.mySegmentThickness = PP.myEasyTuneVariables.get("Torus Thickness");
        visualParams.myMaterial = this._myMaterial;
        visualParams.myParent = this.object;
        PP.myVisualManager.draw(visualParams, 0);
    }
});