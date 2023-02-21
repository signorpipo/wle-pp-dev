WL.registerComponent('test-get-transform-local', {
}, {
    init: function () {
    },
    start() {
    },
    update(dt) {
        for (let i = 0; i < 2000; i++) {
            let b = this.object.transformLocal;
        }
    }
});