WL.registerComponent('pp-visual-manager', {
}, {
    init: function () {
        if (this.active) {
            PP.myVisualData.myRootObject = WL.scene.addObject(null);

            PP.myVisualManager = new PP.VisualManager();
        }
    },
    start() {
    },
    update(dt) {
        PP.myVisualManager.update(dt);
    }
});

PP.myVisualManager = null;

PP.myVisualData = {
    myRootObject: null
};