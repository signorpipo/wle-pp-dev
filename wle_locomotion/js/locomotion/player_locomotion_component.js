WL.registerComponent('player-locomotion', {
    _myMaxSpeed: { type: WL.Type.Float, default: 2 },
    _myMaxRotationSpeed: { type: WL.Type.Float, default: 100 },
    _myIsSnapTurn: { type: WL.Type.Bool, default: true },
    _mySnapTurnAngle: { type: WL.Type.Float, default: 30 },
    _myFlyEnabled: { type: WL.Type.Bool, default: false },
    _myMinAngleToFlyUpNonVR: { type: WL.Type.Float, default: 30 },
    _myMinAngleToFlyDownNonVR: { type: WL.Type.Float, default: 50 },
    _myMinAngleToFlyUpVR: { type: WL.Type.Float, default: 60 },
    _myMinAngleToFlyDownVR: { type: WL.Type.Float, default: 1 },
    _myMinAngleToFlyRight: { type: WL.Type.Float, default: 30 },
    _myMainHand: { type: WL.Type.Enum, values: ['left', 'right'], default: 'left' },
    _myVRDirectionReferenceType: { type: WL.Type.Enum, values: ['head', 'hand', 'custom object'], default: 'hand' },
    _myVRDirectionReferenceObject: { type: WL.Type.Object }
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
        params.myMinAngleToFlyUpNonVR = this._myMinAngleToFlyUpNonVR;
        params.myMinAngleToFlyDownNonVR = this._myMinAngleToFlyDownNonVR;
        params.myMinAngleToFlyUpVR = this._myMinAngleToFlyUpVR;
        params.myMinAngleToFlyDownVR = this._myMinAngleToFlyDownVR;
        params.myMinAngleToFlyRight = this._myMinAngleToFlyRight;

        params.myMainHand = PP.InputUtils.getHandednessByIndex(this._myMainHand);

        params.myVRDirectionReferenceType = this._myVRDirectionReferenceType;
        params.myVRDirectionReferenceObject = this._myVRDirectionReferenceObject;

        params.myForeheadExtraHeight = 0.15;

        this._myPlayerLocomotion = new PlayerLocomotion(params);
        this._myPlayerLocomotion.start();
    },
    update(dt) {
        _myTotalRaycasts = 0; // #TODO debug stuff, remove later

        this._myPlayerLocomotion.update(dt);
    },
    onActivate() {
        this._myPlayerLocomotion.setIdle(false);
    },
    onDeactivate() {
        this._myPlayerLocomotion.setIdle(true);
    }
});

CollisionCheckGlobal = null;