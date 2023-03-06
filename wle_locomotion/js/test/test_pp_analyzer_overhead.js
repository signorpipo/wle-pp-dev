WL.registerComponent('pp-analyzer-overhead', {
}, {
    init: function () {
    },
    start: function () {
        this._myCurrentActive = true;
    },
    update: function (dt) {
        for (let i = 0; i < 10000; i++) {
            PP.myTestAnalyzerOverhead();
        }

        //console.error("\n\n\n");
    },
});

PP.myTestAnalyzerOverhead = function myTestAnalyzerOverhead() {
    return null;
};