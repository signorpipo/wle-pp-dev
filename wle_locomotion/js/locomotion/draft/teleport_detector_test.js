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

            let visualParams = new PP.VisualRaycastParams();
            visualParams.myRaycastResult = raycastResult;
            visualParams.myNormalLength = 0.2;
            visualParams.myThickness = 0.005;
            visualParams.myShowOnlyFirstHit = false;
            PP.myDebugVisualManager.draw(visualParams, 0);
        }
    }
};