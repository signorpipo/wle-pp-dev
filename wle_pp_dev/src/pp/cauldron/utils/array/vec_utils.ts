import { Vector } from "../../type_definitions/array_type_definitions.js";
import { MathUtils } from "../math_utils.js";
import { ArrayUtils } from "./array_utils.js";

export function zero<T extends Vector>(vector: T): T {
    for (let i = 0; i < vector.length; i++) {
        vector[i] = 0;
    }

    return vector;
}

export function isZero(vector: Readonly<Vector>, epsilon = 0): boolean {
    let zero = true;

    for (let i = 0; i < vector.length && zero; i++) {
        zero = zero && (Math.abs(vector[i]) <= epsilon);
    }

    return zero;
}

export function scale<T extends Vector>(vector: Readonly<Vector>, value: number, out?: T): T {
    out = _prepareOut(vector, out);

    for (let i = 0; i < out.length; i++) {
        out[i] = out[i] * value;
    }

    return out;
}

export function round<T extends Vector>(vector: Readonly<Vector>, out?: T): T {
    out = _prepareOut(vector, out);

    for (let i = 0; i < out.length; i++) {
        out[i] = Math.round(out[i]);
    }

    return out;
}

export function floor<T extends Vector>(vector: Readonly<Vector>, out?: T): T {
    out = _prepareOut(vector, out);

    for (let i = 0; i < out.length; i++) {
        out[i] = Math.floor(out[i]);
    }

    return out;
}

export function ceil<T extends Vector>(vector: Readonly<Vector>, out?: T): T {
    out = _prepareOut(vector, out);

    for (let i = 0; i < out.length; i++) {
        out[i] = Math.ceil(out[i]);
    }

    return out;
}

export function clamp<T extends Vector>(vector: Readonly<Vector>, start: number, end: number, out?: T): T {
    out = _prepareOut(vector, out);

    const fixedStart = (start != null) ? start : -Number.MAX_VALUE;
    const fixedEnd = (end != null) ? end : Number.MAX_VALUE;
    const min = Math.min(fixedStart, fixedEnd);
    const max = Math.max(fixedStart, fixedEnd);

    for (let i = 0; i < out.length; i++) {
        out[i] = MathUtils.clamp(out[i], min, max);
    }

    return out;
}

export function equals(vector: Readonly<Vector>, other: Readonly<Vector>, epsilon: number = 0): boolean {
    let equals = vector.length == other.length;

    for (let i = 0; i < vector.length && equals; i++) {
        equals = equals && (Math.abs(vector[i] - other[i]) <= epsilon);
    }

    return equals;
}

export function toString(vector: Readonly<Vector>, decimalPlaces?: number): string {
    const message = _buildConsoleMessage(vector, decimalPlaces);
    return message;
}

export function log(vector: Readonly<Vector>, decimalPlaces: number = 4): Vector {
    const message = _buildConsoleMessage(vector, decimalPlaces);
    console.log(message);

    return vector;
}

export function error(vector: Readonly<Vector>, decimalPlaces: number = 4): Vector {
    const message = _buildConsoleMessage(vector, decimalPlaces);
    console.error(message);

    return vector;
}

export function warn(vector: Readonly<Vector>, decimalPlaces: number = 4): Vector {
    const message = _buildConsoleMessage(vector, decimalPlaces);
    console.warn(message);

    return vector;
}

export const VecUtils = {
    zero,
    isZero,
    scale,
    round,
    floor,
    ceil,
    clamp,
    equals,
    toString,
    log,
    error,
    warn
} as const;



function _buildConsoleMessage(vector: Readonly<Vector>, decimalPlaces?: number): string {
    let message = "[";

    for (let i = 0; i < vector.length; i++) {
        if (i != 0) {
            message = message.concat(", ");
        }

        if (decimalPlaces != null) {
            message = message.concat(vector[i].toFixed(decimalPlaces));
        } else {
            message = message.concat(vector[i].toString());
        }
    }

    message = message.concat("]");
    return message;
}

function _prepareOut<T extends Vector>(vector: Readonly<Vector>, out?: T): T {
    if (out == null) {
        out = ArrayUtils.clone(vector) as T;
    } else if (out != vector) {
        ArrayUtils.copy(vector, out);
    }

    return out;
}