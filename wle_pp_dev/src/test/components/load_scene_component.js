import { Component } from "@wonderlandengine/api";
import { GamepadButtonID, Globals } from "wle-pp";

export class LoadSceneComponent extends Component {
    static TypeName = "load-scene";

    update(dt) {
        if (Globals.getLeftGamepad(this.engine).getButtonInfo(GamepadButtonID.SELECT).isPressEnd()) {
            Globals.getScene(this.engine).load("wle-pp-dev-pplayground.bin");
        }
    }
}