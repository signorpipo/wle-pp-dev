import { Component } from "@wonderlandengine/api";
import { Globals } from "../../../pp/globals.js";

export class CopyPlayerTransformComponent extends Component {
    static TypeName = "pp-copy-player-transform";

    update(dt) {
        let player = Globals.getPlayerObjects(this.engine).myPlayer;
        this.object.pp_setTransformQuat(player.pp_getTransformQuat());
        this.object.pp_setScale(player.pp_getScale());
    }
}