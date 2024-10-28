import { Component, Scene } from "@wonderlandengine/api";
import { GamepadButtonID, Globals } from "wle-pp";

let mainScene: Scene | null = null;
let nextScene: Scene | null = null;

export class SwitchSceneTestComponent extends Component {
    public static override TypeName = "switch-scene-test";

    public override start(): void {
        if (mainScene == null) {
            mainScene = Globals.getScene();
        }

        if (nextScene == null) {
            Globals.getMainEngine()!.loadScene("wle-pp-dev-locomotion.bin").then((scene) => nextScene = scene);
        }
    }

    public override update(dt: number): void {
        if (Globals.getLeftGamepad(this.engine)!.getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressEnd(2)) {
            if (mainScene == Globals.getScene()) {
                Globals.getMainEngine()!.switchTo(nextScene!);
            } else {
                Globals.getMainEngine()!.switchTo(mainScene!);
            }
        }
    }
}