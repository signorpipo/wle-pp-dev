import { Component, Type } from "@wonderlandengine/api";

export let myTestAnalyzerOverhead = {};
myTestAnalyzerOverhead.myFunction = function myTestAnalyzerOverhead() {
    return null;
};

export class TestPPAnalyzerOverheadComponent extends Component {
    static TypeName = "test-pp-analyzer-overhead";
    static Properties = {
    };

    start() {
        this._myCurrentActive = true;
    }

    update(dt) {
        for (let i = 0; i < 10000; i++) {
            myTestAnalyzerOverhead();
        }

        //console.error("\n\n\n");
    }
}