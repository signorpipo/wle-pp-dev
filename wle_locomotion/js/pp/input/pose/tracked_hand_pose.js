PP.TrackedHandPoseParams = class TrackedHandPoseParams extends PP.BasePoseParams {
    constructor(addAllJointTypes = true) {
        super();

        this.myTrackedHandJointTypeList = [];

        if (addAllJointTypes) {
            for (let typeKey in PP.TrackedHandJointType) {
                this.myTrackedHandJointTypeList.push([PP.TrackedHandJointType[typeKey]]);
            }
        }
    }
};

PP.TrackedHandPose = class TrackedHandPose {
    constructor(handedness, trackedHandPoseParams = new PP.TrackedHandPoseParams()) {
        this._myHandedness = handedness;

        this._myFixForward = trackedHandPoseParams.myFixForward;
        this._myForceEmulatedVelocities = trackedHandPoseParams.myForceEmulatedVelocities;
        this._myReferenceObject = trackedHandPoseParams.myReferenceObject;

        this._myTrackedHandJointPoseParams = new PP.BasePoseParams();
        this._myTrackedHandJointPoseParams.myFixForward = this._myFixForward;
        this._myTrackedHandJointPoseParams.myForceEmulatedVelocities = this._myForceEmulatedVelocities;
        this._myTrackedHandJointPoseParams.myReferenceObject = this._myReferenceObject;

        this._myTrackedHandJointPoseList = [];
        for (let jointType of trackedHandPoseParams.myTrackedHandJointTypeList) {
            let trackedHandJointPose = new PP.TrackedHandJointPose(this._myHandedness, jointType, this._myTrackedHandJointPoseParams);
            this._myTrackedHandJointPoseList.push(trackedHandJointPose);
        }
    }

    start() {
        for (let jointPose of this._myTrackedHandJointPoseList) {
            jointPose.start();
        }
    }

    update(dt) {
        for (let jointPose of this._myTrackedHandJointPoseList) {
            jointPose.update(dt);
        }
    }

    addTrackedHandJointType(jointType) {
        if (!this._myTrackedHandJointPoseList.pp_has(element => element.getTrackedHandJointType() == jointType)) {
            let trackedHandJointPose = new PP.TrackedHandJointPose(this._myHandedness, jointType, this._myTrackedHandJointPoseParams);
            this._myTrackedHandJointPoseList.push(trackedHandJointPose);
        }
    }

    removeTrackedHandJointType(jointType) {
        this._myTrackedHandJointPoseList.pp_remove(element => element.getTrackedHandJointType() == jointType);
    }

    setReferenceObject(referenceObject) {
        this._myReferenceObject = referenceObject;
        this._myTrackedHandJointPoseParams.myReferenceObject = this._myReferenceObject;
        for (let jointPose of this._myTrackedHandJointPoseList) {
            jointPose.setReferenceObject(referenceObject);
        }
    }

    getReferenceObject() {
        return this._myReferenceObject;
    }

    setFixForward(fixForward) {
        this._myFixForward = fixForward;
        this._myTrackedHandJointPoseParams.myFixForward = this._myFixForward;
        for (let jointPose of this._myTrackedHandJointPoseList) {
            jointPose.setFixForward(fixForward);
        }
    }

    isFixForward() {
        return this._myFixForward;
    }

    setForceEmulatedVelocities(forceEmulatedVelocities) {
        this._myForceEmulatedVelocities = forceEmulatedVelocities;
        this._myTrackedHandJointPoseParams.myForceEmulatedVelocities = this._myForceEmulatedVelocities;
        for (let jointPose of this._myTrackedHandJointPoseList) {
            jointPose.setForceEmulatedVelocities(forceEmulatedVelocities);
        }
    }

    isForceEmulatedVelocities() {
        return this._myForceEmulatedVelocities;
    }
};