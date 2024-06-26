import { Component } from "@wonderlandengine/api";
import { mat4_create } from "../../pp/plugin/js/extensions/array/vec_create_extension.js";
import { Globals } from "../../pp/pp/globals.js";
import { EasyTuneBool, EasyTuneBoolArray, EasyTuneInt, EasyTuneIntArray, EasyTuneNumber, EasyTuneNumberArray, EasyTuneTransform } from "../../pp/tool/easy_tune/easy_tune_variable_types.js";

export class ExampleEasyTuneVariablesComponent extends Component {
    public static override TypeName = "example-easy-tune-variables";

    public override start(): void {
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneNumber("Float", 1.00, undefined, true, 3, 0.1));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneNumberArray("Float Array", [1.00, 2.00, 3.00], undefined, true, 3, 0.1));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneInt("Int", 1, undefined, true, 1));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneIntArray("Int Array", [1, 2, 3], undefined, true, 1));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneBool("Bool", false, undefined, true));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneBoolArray("Bool Array", [false, true, false], undefined, true));
        Globals.getEasyTuneVariables(this.engine)!.add(new EasyTuneTransform("Transform", mat4_create(), undefined, true, true, 3));
    }
}