import { Component } from "@wonderlandengine/api";
import { Timer } from "../../pp/cauldron/cauldron/timer";

export class Vec3FunctionCountComponent extends Component {
    static TypeName = "vec3-function-count";
    static Properties = {};

    start() {
        this.vec3_addTotal = 0;
        this.vec3_scaleTotal = 0;
        this.vec3_copyTotal = 0;
        this.vec3_lengthTotal = 0;
        this.vec3_normalizeTotal = 0;
        this.vec3_angleTotal = 0;
        this.vec3_angleSignedTotal = 0;
        this.vec3_rotateAxisTotal = 0;
        this.vec3_componentAlongAxisTotal = 0;
        this.vec3_subTotal = 0;
        this.vec3_isConcordantTotal = 0;
        this.vec3_zeroTotal = 0;

        this._myTimer = new Timer(2);
    }

    update(dt) {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            this._myTimer.start();

            this.vec3_addTotal = vec3_addTotal;
            this.vec3_scaleTotal = Math.max(this.vec3_scaleTotal, vec3_scaleTotal);
            this.vec3_copyTotal = Math.max(this.vec3_copyTotal, vec3_copyTotal);
            this.vec3_lengthTotal = vec3_lengthTotal;
            this.vec3_normalizeTotal = Math.max(this.vec3_normalizeTotal, vec3_normalizeTotal);
            this.vec3_angleTotal = Math.max(this.vec3_angleTotal, vec3_angleTotal);
            this.vec3_angleSignedTotal = Math.max(this.vec3_angleSignedTotal, vec3_angleSignedTotal);
            this.vec3_rotateAxisTotal = Math.max(this.vec3_rotateAxisTotal, vec3_rotateAxisTotal);
            this.vec3_componentAlongAxisTotal = Math.max(this.vec3_componentAlongAxisTotal, vec3_componentAlongAxisTotal);
            this.vec3_subTotal = Math.max(this.vec3_subTotal, vec3_subTotal);
            this.vec3_isConcordantTotal = Math.max(this.vec3_isConcordantTotal, vec3_isConcordantTotal);
            this.vec3_zeroTotal = Math.max(this.vec3_zeroTotal, vec3_zeroTotal);

            console.error("add:", this.vec3_addTotal);
            console.error("scale:", this.vec3_scaleTotal);
            console.error("copy:", this.vec3_copyTotal);
            console.error("length:", this.vec3_lengthTotal);
            console.error("normalize:", this.vec3_normalizeTotal);
            console.error("angle:", this.vec3_angleTotal);
            console.error("angleSigned:", this.vec3_angleSignedTotal);
            console.error("rotateAxis:", this.vec3_rotateAxisTotal);
            console.error("componentAlongAxis:", this.vec3_componentAlongAxisTotal);
            console.error("subTotal:", this.vec3_subTotal);
            console.error("isConcordantTotal:", this.vec3_isConcordantTotal);
            console.error("zeroTotal:", this.vec3_zeroTotal);
            console.error(" ");
        }

        vec3_addTotal = 0;
        vec3_scaleTotal = 0;
        vec3_copyTotal = 0;
        vec3_lengthTotal = 0;
        vec3_normalizeTotal = 0;
        vec3_angleTotal = 0;
        vec3_angleSignedTotal = 0;
        vec3_rotateAxisTotal = 0;
        vec3_componentAlongAxisTotal = 0;
        vec3_subTotal = 0;
        vec3_isConcordantTotal = 0;
        vec3_zeroTotal = 0;
    }
}
