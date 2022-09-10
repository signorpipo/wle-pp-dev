WL.registerComponent('show-line-test', {
}, {
    init: function () {
    },
    start() {
    },
    update(dt) {
        let visualParams = new PP.VisualLineParams();
        visualParams.myStart = this.object.pp_getPosition();
        visualParams.myDirection = this.object.pp_getForward();
        visualParams.myLength = 0.4;
        visualParams.myMaterial = PP.myDefaultResources.myMaterials.myFlatOpaque.clone();
        visualParams.myMaterial.color = [0, 0, 1, 1];
        PP.myVisualManager.draw(visualParams);
    }
});