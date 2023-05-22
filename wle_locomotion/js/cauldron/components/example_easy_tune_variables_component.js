import { Component } from "@wonderlandengine/api";
import { mat4_create } from "../../pp/plugin/js/extensions/array_extension";
import { Globals } from "../../pp/pp/globals";
import { EasyTuneBool, EasyTuneBoolArray, EasyTuneInt, EasyTuneIntArray, EasyTuneNumber, EasyTuneNumberArray, EasyTuneTransform } from "../../pp/tool/easy_tune/easy_tune_variable_types";

export class ExampleEasyTuneVariablesComponent extends Component {
    static TypeName = "example-easy-tune-variables";
    static Properties = {};

    start() {
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumber("Float", 1.00, 0.1, 3));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneNumberArray("Float Array", [1.00, 2.00, 3.00], 0.1, 3));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneInt("Int", 1, 1));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneIntArray("Int Array", [1, 2, 3], 1));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneBool("Bool", false));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneBoolArray("Bool Array", [false, true, false]));
        Globals.getEasyTuneVariables(this.engine).add(new EasyTuneTransform("Transform", mat4_create(), true));
    }
}