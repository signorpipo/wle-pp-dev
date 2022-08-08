PlayerLocomotionDirectionReferenceType = {
    HEAD: 0,
    HAND_LEFT: 1,
    HAND_RIGHT: 2,
};

PlayerLocomotionParams = class PlayerLocomotionParams {
    constructor() {
        this.myMaxSpeed = 0;
        this.myMaxRotationSpeed = 0;

        this.myIsSnapTurn = false;
        this.mySnapTurnAngle = 0;

        this.myFlyEnabled = false;
        this.myMinAngleToFlyUpHead = 0;
        this.myMinAngleToFlyDownHead = 0;
        this.myMinAngleToFlyUpHand = 0;
        this.myMinAngleToFlyDownHand = 0;
        this.myMinAngleToFlyRight = 0;

        this.myDirectionReferenceType = PlayerLocomotionDirectionReferenceType.HEAD;
    }
};

// #TODO add lerped snap on vertical over like half a second to avoid the "snap effect"
// this could be done by detatching the actual vertical position of the player from the collision real one when a snap is detected above a certain threshold
// with a timer, after which the vertical position is just copied, while during the detatching is lerped toward the collision vertical one
PlayerLocomotion = class PlayerLocomotion {
    constructor(params) {
        this._myParams = params;

        this._myPlayerHeadManager = new PlayerHeadManager();

        {
            let params = new PlayerLocomotionRotateParams();

            params.myPlayerHeadManager = this._myPlayerHeadManager;

            params.myMaxRotationSpeed = this._myParams.myMaxRotationSpeed;
            params.myIsSnapTurn = this._myParams.myIsSnapTurn;
            params.mySnapTurnAngle = this._myParams.mySnapTurnAngle;

            params.myRotationMinIntensityThreshold = 0.1;
            params.mySnapTurnActivateThreshold = 0.5;
            params.mySnapTurnResetThreshold = 0.4;

            params.myClampVerticalAngle = true;
            params.myMaxVerticalAngle = 90;

            this._myPlayerLocomotionRotate = new PlayerLocomotionRotate(params);
        }
    }

    start() {
        this._fixAlmostUp();
        this._myPlayerHeadManager.start();
        this._myPlayerLocomotionRotate.start();
    }

    update(dt) {
        this._myPlayerHeadManager.update(dt);
        if (this._myPlayerHeadManager.isSynced()) {
            this._myPlayerLocomotionRotate.update(dt);
        }
    }

    _fixAlmostUp() {
        // get rotation on y and adjust if it's slightly tilted when it's almsot 0,1,0

        let defaultUp = [0, 1, 0];
        let angleWithDefaultUp = PP.myPlayerObjects.myPlayer.pp_getUp().vec3_angle(defaultUp);
        if (angleWithDefaultUp < 1) {
            let forward = PP.myPlayerObjects.myPlayer.pp_getForward();
            let flatForward = forward.vec3_clone();
            flatForward[1] = 0;

            let defaultForward = [0, 0, 1];
            let angleWithDefaultForward = defaultForward.vec3_angleSigned(flatForward, defaultUp);

            PP.myPlayerObjects.myPlayer.pp_resetRotation();
            PP.myPlayerObjects.myPlayer.pp_rotateAxis(angleWithDefaultForward, defaultUp);
        }
    }
};