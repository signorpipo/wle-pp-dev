TeleportDetectorTest = class TeleportDetectorTest {
    constructor() {
        this._myMouse = new PP.Mouse();
    }

    update(dt) {
        this._myMouse.update(dt);

        if (this._myMouse.isButtonPressed(PP.MouseButtonType.LEFT)) {
            let raycastSetup = new PP.RaycastSetup();

            raycastSetup.myDistance = 100;

            raycastSetup.myBlockLayerFlags.setAllFlagsActive(true);

            raycastSetup.myObjectsToIgnore = [];
            raycastSetup.myIgnoreHitsInsideCollision = false;

            let raycastResult = this._myMouse.raycastWorld(raycastSetup);

            let debugParams = new PP.DebugRaycastParams();
            debugParams.myRaycastResult = raycastResult;
            debugParams.myNormalLength = 0.2;
            debugParams.myThickness = 0.005;
            debugParams.myShowOnlyFirstHit = false;
            PP.myDebugManager.draw(debugParams, 0);
        }
    }
};