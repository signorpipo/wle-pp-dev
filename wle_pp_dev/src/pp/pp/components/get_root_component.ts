import { Component, Object3D } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { ObjectUtils } from "wle-pp/cauldron/wl/utils/object_utils.js";
import { Globals } from "../globals.js";

export class GetRootComponent extends Component {
    public static override TypeName = "pp-get-root";

    @property.object()
    private _myRoot!: Object3D;

    private _myAdjustedRoot: Object3D | null = null;

    public override init(): void {
        // Prevents double global from same engine
        if (!Globals.hasRoot(this.engine)) {
            if (this._myRoot == null) {
                // As long as this is safe, is possible to avoid having to specify a root object
                this._myAdjustedRoot = ObjectUtils.wrapObject(0, this.engine);
            }

            if (this._myAdjustedRoot != null) {
                Globals.setRoot(this._myAdjustedRoot, this.engine);
            }
        }
    }

    public override onDestroy(): void {
        if (this._myAdjustedRoot != null && Globals.getRoot(this.engine) == this._myAdjustedRoot) {
            Globals.removeRoot(this.engine);
        }
    }
}