import { Component, Scene } from "@wonderlandengine/api";
import { GamepadButtonID, Globals } from "wle-pp";

let mainScene: Scene | null = null;
let nextScene: Scene | null = null;

export class SwitchSceneTestComponent extends Component {
    public static override TypeName = "switch-scene-test";

    public override start(): void {
        if (mainScene == null) {
            mainScene = Globals.getScene(this.engine);
        }

        if (nextScene == null) {
            this.engine.loadScene("wle-pp-dev-locomotion.bin").then((scene) => nextScene = scene);
        }
    }

    public override update(dt: number): void {
        if (Globals.getRightGamepad(this.engine)!.getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressEnd(2)) {
            if (mainScene == Globals.getScene(this.engine)) {
                this.engine.switchTo(nextScene!);
            } else {
                this.engine.switchTo(mainScene!);
            }
        }
    }
}