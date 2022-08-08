WL.registerComponent('player-locomotion', {
    _myMaxSpeed: { type: WL.Type.Float, default: 2 },
    _myMaxRotationSpeed: { type: WL.Type.Float, default: 100 },
    _myIsSnapTurn: { type: WL.Type.Bool, default: true },
    _mySnapTurnAngle: { type: WL.Type.Float, default: 30 },
    _myFlyEnabled: { type: WL.Type.Bool, default: false },
    _myMinAngleToFlyUpHead: { type: WL.Type.Float, default: 30 },
    _myMinAngleToFlyDownHead: { type: WL.Type.Float, default: 50 },
    _myMinAngleToFlyUpHand: { type: WL.Type.Float, default: 60 },
    _myMinAngleToFlyDownHand: { type: WL.Type.Float, default: 1 },
    _myMinAngleToFlyRight: { type: WL.Type.Float, default: 30 },
    _myDirectionReferenceType: { type: WL.Type.Enum, values: ['head', 'hand left', 'hand right'], default: 'hand left' }
}, {
    init() {
    },
    start() {
        CollisionCheckGlobal = new CollisionCheck();
        let params = new PlayerLocomotionParams();
        params.myMaxSpeed = this._myMaxSpeed;
        params.myMaxRotationSpeed = this._myMaxRotationSpeed;

        params.myIsSnapTurn = this._myIsSnapTurn;
        params.mySnapTurnAngle = this._mySnapTurnAngle;

        params.myFlyEnabled = this._myFlyEnabled;
        params.myMinAngleToFlyUpHead = this._myMinAngleToFlyUpHead;
        params.myMinAngleToFlyDownHead = this._myMinAngleToFlyDownHead;
        params.myMinAngleToFlyUpHand = this._myMinAngleToFlyUpHand;
        params.myMinAngleToFlyDownHand = this._myMinAngleToFlyDownHand;
        params.myMinAngleToFlyRight = this._myMinAngleToFlyRight;

        params.myDirectionReferenceType = this._myDirectionReferenceType;

        params.myForeheadExtraHeight = 0.15;

        this._myPlayerLocomotion = new PlayerLocomotion(params);
        this._myPlayerLocomotion.start();
    },
    update(dt) {
        _myTotalRaycasts = 0; // debug stuff, remove later

        this._myPlayerLocomotion.update(dt);
    }
});

CollisionCheckGlobal = null;