WL.registerComponent('locomotion-floating-error', {
    _myPlayerObject: { type: WL.Type.Object },
    _myHeadObject: { type: WL.Type.Object },
    _myMaxSpeed: { type: WL.Type.Float, default: 2 }
}, {
    init: function () {
    },
    start() {
        this._myTotalError = 0;
        this._myTotalErrorAbs = 0;
        this._myTotalErrorTime = 0;
        this._myOriginalHeadPosition = this._myHeadObject.pp_getPosition();
        this._myOriginalHeadPositionError = 0;
    },
    update(dt) {
        let testTime = 1;
        for (let i = 0; i < testTime; i++) {
            this._myTotalErrorTime += dt;

            let positionChanged = false;
            let rotationChanged = false;

            let newHeadPosition = this._myHeadObject.pp_getPosition();
            let headMovement = [0, 0, 0];
            //headMovement = [0, 0, 0.001];
            //headMovement = [-0.075, 0.005, 0.01];

            {
                let axes = PP.myRightGamepad.getAxesInfo().getAxes();
                let minIntensityThreshold = 0.1;
                if (axes.vec2_length() > minIntensityThreshold) {
                    let movementIntensity = axes.vec2_length();
                    let direction = [axes[0], 0, axes[1]];
                    direction.vec3_normalize(direction);

                    let speed = Math.pp_lerp(0, this._myMaxSpeed, movementIntensity);

                    let headPosition = this._myHeadObject.pp_getPosition();
                    direction.vec3_scale(speed, headMovement);
                    headPosition.vec3_add(headMovement, newHeadPosition);

                    positionChanged = true;
                }
            }

            if (positionChanged || true) {
                this._moveFeet(headMovement);
            }

            let headRotation = [0, 0, 0].vec3_degreesToQuat();
            //headRotation = [0.001, 0.002, -0.003].vec3_degreesToQuat();
            headRotation = [1, 2, -1].vec3_degreesToQuat();

            if (rotationChanged || true) {
                this._rotateHead(headRotation);
            }
        }

        //this._myPlayerObject.pp_getTransformQuat().vec_error();
        //this._myHeadObject.pp_getRotationQuat().vec_error();
        //this._myHeadObject.pp_getPosition().vec_error();

        console.error("Error:", this._myTotalError.toFixed(7), " - Error From Original Position:", this._myOriginalHeadPositionError.toFixed(7), " - Time", this._myTotalErrorTime.toFixed(2));
    },
    _computeNewPlayerTransform(newHeadPosition, newHeadRotation) {
        let currentHeadTransform = this._myHeadObject.pp_getTransformQuat();

        let newHeadTransform = PP.quat2_create();
        newHeadTransform.quat2_setPositionRotationQuat(newHeadPosition, newHeadRotation);

        let playerTransform = this._myPlayerObject.pp_getTransformQuat();
        let localPlayerTransform = playerTransform.quat2_toLocal(currentHeadTransform);
        let newPlayerTransform = localPlayerTransform.quat2_toWorld(newHeadTransform);

        this._myPlayerObject.pp_setTransformQuat(newPlayerTransform);
    },
    _moveFeet(movement) {
        this._myPlayerObject.pp_translate(movement);
    },
    _rotateHead(rotation) {
        let currentHeadPosition = this._myHeadObject.pp_getPosition();

        this._myPlayerObject.pp_rotateAroundQuat(rotation, this._myHeadObject.pp_getPosition());

        let newHeadPosition = this._myHeadObject.pp_getPosition();
        let adjustmentMovement = currentHeadPosition.vec3_sub(newHeadPosition);

        this._moveFeet(adjustmentMovement);

        let adjustedHeadPosition = this._myHeadObject.pp_getPosition();
        let error = adjustedHeadPosition.vec3_sub(currentHeadPosition);
        this._myTotalError += error.vec3_length();
        this._myTotalErrorAbs += Math.abs(error.vec3_length());

        let originalHeadPositionError = this._myOriginalHeadPosition.vec3_sub(newHeadPosition).vec3_length();
        this._myOriginalHeadPositionError = originalHeadPositionError;
    }
});