WL.registerComponent("pp-player-occlusion", {
}, {
    init() {
    },
    start() {
        this._myPlayerOcclusion = new PP.PlayerOcclusion();
    },
    update(dt) {
        this._myPlayerOcclusion.update(dt);
    },
    getPlayerOcclusion() {
        return this._myPlayerOcclusion;
    }
});