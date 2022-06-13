WL.registerComponent('touch-start-test', {
}, {
    init: function () {

    },
    start: function () {
        WL.canvas.addEventListener('touchstart', function (e) {
            console.error("index:", e);
        }.bind(this));
        WL.canvas.addEventListener('touchend', function (e) {
            console.error("index:", e);
        }.bind(this));

    },
    update: function (dt) {

    },
});