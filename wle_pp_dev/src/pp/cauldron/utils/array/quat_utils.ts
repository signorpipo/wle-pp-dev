import { mat3 as gl_mat3, quat as gl_quat, type quat as gl_quat_type } from "gl-matrix";
import { Quaternion, Vector3 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { EasingFunction, MathUtils } from "../math_utils.js";
import { ArrayUtils } from "./array_utils.js";
import { Mat3Utils, create as mat3_utils_create } from "./mat3_utils.js";
import { Vec3Utils, create as vec3_utils_create } from "./vec3_utils.js";


export function create(): Quaternion;
export function create(x: number, y: number, z: number, w: number): Quaternion;
export function create(uniformValue: number): Quaternion;
export function create(x?: number, y?: number, z?: number, w?: number): Quaternion {
    const out = gl_quat.create() as unknown as Quaternion;

    if (x != null) {
        QuatUtils.set(out, x, y!, z!, w!);
    }

    return out;
}

export function set<T extends Quaternion>(quat: T, x: number, y: number, z: number, w: number): T;
export function set<T extends Quaternion>(quat: T, uniformValue: number): T;
export function set<T extends Quaternion>(quat: T, x: number, y?: number, z?: number, w?: number): T {
    if (y == null) {
        gl_quat.set(quat as unknown as gl_quat_type, x, x, x, x);
    } else {
        gl_quat.set(quat as unknown as gl_quat_type, x, y, z!, w!);
    }

    return quat;
}

export function copy<T extends Quaternion>(from: Readonly<Quaternion>, to: T): T {
    gl_quat.copy(to as unknown as gl_quat_type, from as unknown as gl_quat_type);
    return to;
}

/** The overload where `T extends Quaternion` does also get `array` as `Readonly<T>`, but is not marked as such due to 
    Typescript having issues with inferring the proper type of `T` when `Readonly` is used */
export function clone<T extends Quaternion>(quat: Readonly<T>): T;
export function clone(quat: Readonly<number[]>): number[];
export function clone<T extends Quaternion>(quat: T): T;
export function clone<T extends Quaternion>(quat: Readonly<T>): T {
    return quat.slice(0) as T;
}

export function isNormalized(quat: Readonly<Quaternion>, epsilon = MathUtils.EPSILON) {
    return Math.abs(QuatUtils.lengthSquared(quat) - 1) < epsilon;
}

export function normalize(quat, out = QuatUtils.create()) {
    gl_quat.normalize(out, quat);
    return out;
}

export function identity(quat) {
    gl_quat.identity(quat);
    return quat;
}

export function length(quat: Readonly<Quaternion>) {
    return gl_quat.length(quat);
}

export function lengthSquared(quat: Readonly<Quaternion>) {
    return gl_quat.squaredLength(quat);
}

export function invert(quat, out = QuatUtils.create()) {
    gl_quat.invert(out, quat);
    return out;
}

export function conjugate(quat, out = QuatUtils.create()) {
    gl_quat.conjugate(out, quat);
    return out;
}

export function mul(first, second, out = QuatUtils.create()) {
    gl_quat.mul(out, first, second);
    return out;
}

export const getAxis = function () {
    const zero = vec3_utils_create(0, 0, 0);
    return function getAxis(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        const angle = gl_quat.getAxisAngle(out, quat);
        if (angle <= MathUtils.EPSILON) {
            Vec3Utils.copy(zero, out);
        }
        return out;
    };
}();

export function getAngle(quat: Readonly<Quaternion>) {
    return QuatUtils.getAngleDegrees(quat);
}

export function getAngleDegrees(quat: Readonly<Quaternion>) {
    const angle = QuatUtils.getAngleRadians(quat);
    return MathUtils.toDegrees(angle);
}

export const getAngleRadians = function () {
    const vector = vec3_utils_create();
    return function getAngleRadians(quat: Readonly<Quaternion>) {
        const angle = gl_quat.getAxisAngle(vector, quat);
        return angle;
    };
}();

export function getAxisScaled(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
    return QuatUtils.getAxisScaledDegrees(quat, out);
}

export function getAxisScaledDegrees(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
    QuatUtils.getAxis(quat, out);
    const angle = QuatUtils.getAngleDegrees(quat);
    Vec3Utils.scale(out, angle, out);
    return out;
}

export const getAxisScaledRadians = function () {
    const zero = vec3_utils_create(0, 0, 0);
    return function getAxisScaledRadians(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        QuatUtils.getAxis(quat, out);
        const angle = QuatUtils.getAngleRadians(quat);
        if (angle <= MathUtils.EPSILON) {
            Vec3Utils.copy(zero, out);
        } else {
            Vec3Utils.scale(out, angle, out);
        }
        return out;
    };
}();

export function getAxes(quat: Readonly<Quaternion>, out = [Vec3Utils.create(), Vec3Utils.create(), Vec3Utils.create()]) {
    QuatUtils.getLeft(quat, out[0]);
    QuatUtils.getUp(quat, out[1]);
    QuatUtils.getForward(quat, out[2]);
    return out;
}

export const getForward = function () {
    const rotationMatrix = mat3_utils_create();
    return function getForward(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        QuatUtils.toMatrix(quat, rotationMatrix);

        Vec3Utils.set(out, rotationMatrix[6], rotationMatrix[7], rotationMatrix[8]);

        return out;
    };
}();

export function getBackward(quat: Readonly<Quaternion>, out) {
    out = QuatUtils.getForward(quat, out);
    Vec3Utils.negate(out, out);
    return out;
}

export const getLeft = function () {
    const rotationMatrix = mat3_utils_create();
    return function getLeft(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        QuatUtils.toMatrix(quat, rotationMatrix);

        Vec3Utils.set(out, rotationMatrix[0], rotationMatrix[1], rotationMatrix[2]);

        return out;
    };
}();

export function getRight(quat: Readonly<Quaternion>, out) {
    out = QuatUtils.getLeft(quat, out);
    Vec3Utils.negate(out, out);
    return out;
}

export const getUp = function () {
    const rotationMatrix = mat3_utils_create();
    return function getUp(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        QuatUtils.toMatrix(quat, rotationMatrix);

        Vec3Utils.set(out, rotationMatrix[3], rotationMatrix[4], rotationMatrix[5]);

        return out;
    };
}();

export function getDown(quat: Readonly<Quaternion>, out) {
    out = QuatUtils.getUp(quat, out);
    Vec3Utils.negate(out, out);
    return out;
}

export function setAxes(quat, left, up, forward) {
    if (forward != null) {
        return QuatUtils.setForward(quat, forward, up, left);
    } else if (up != null) {
        return QuatUtils.setUp(quat, up, forward, left);
    } else {
        return QuatUtils.setLeft(quat, left, up, forward);
    }
}

export const setForward = function () {
    const axes = [null, null, null];
    const priority = [2, 1, 0];

    /**
     * TS type inference helper
     * 
     * @param {any} up
     * @param {any} left
     */
    return function setForward(quat, forward, up = null, left = null) {
        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export const setBackward = function () {
    const forward = vec3_utils_create();

    const axes = [null, null, null];
    const priority = [2, 1, 0];
    return function setBackward(quat, backward, up = null, left = null) {
        Vec3Utils.negate(backward, forward);

        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export const setUp = function () {
    const axes = [null, null, null];
    const priority = [1, 2, 0];
    return function setUp(quat, up, forward = null, left = null) {
        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export const setDown = function () {
    const up = vec3_utils_create();

    const axes = [null, null, null];
    const priority = [1, 2, 0];
    return function setDown(quat, down, forward = null, left = null) {
        Vec3Utils.negate(down, up);

        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export const setLeft = function () {
    const axes = [null, null, null];
    const priority = [0, 1, 2];
    return function setLeft(quat, left, up = null, forward = null) {
        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export const setRight = function () {
    const left = vec3_utils_create();

    const axes = [null, null, null];
    const priority = [0, 1, 2];

    /**
     * TS type inference helper
     * 
     * @param {any} up
     */
    return function setRight(quat, right, up = null, forward = null) {
        Vec3Utils.negate(right, left);

        axes[0] = left;
        axes[1] = up;
        axes[2] = forward;

        _setAxes(quat, axes, priority);

        axes[0] = null;
        axes[1] = null;
        axes[2] = null;

        return quat;
    };
}();

export function toWorld(quat, parentQuat, out = QuatUtils.create()) {
    QuatUtils.mul(parentQuat, quat, out);
    return out;
}

export const toLocal = function () {
    const invertQuat = create();
    return function toLocal(quat, parentQuat, out = QuatUtils.create()) {
        QuatUtils.conjugate(parentQuat, invertQuat);
        QuatUtils.mul(invertQuat, quat, out);
        return out;
    };
}();

export function fromAxis(angle, axis, out = QuatUtils.create()) {
    return QuatUtils.fromAxisDegrees(angle, axis, out);
}

export function fromAxisDegrees(angle, axis, out = QuatUtils.create()) {
    QuatUtils.fromAxisRadians(MathUtils.toRadians(angle), axis, out);
    return out;
}

export function fromAxisRadians(angle, axis, out = QuatUtils.create()) {
    gl_quat.setAxisAngle(out, axis, angle);
    return out;
}

export const fromAxes = function () {
    const matrix = mat3_utils_create();
    return function fromAxes(leftAxis, upAxis, forwardAxis, out = QuatUtils.create()) {
        Mat3Utils.fromAxes(leftAxis, upAxis, forwardAxis, matrix);
        return Mat3Utils.toQuat(matrix, out);
    };
}();

export const fromRadians = function () {
    const vector = vec3_utils_create();
    return function fromRadians(radiansRotation, out = QuatUtils.create()) {
        Vec3Utils.toDegrees(radiansRotation, vector);
        return QuatUtils.fromDegrees(vector, out);
    };
}();

export function fromDegrees(degreesRotation, out = QuatUtils.create()) {
    gl_quat.fromEuler(out, degreesRotation[0], degreesRotation[1], degreesRotation[2]);
    return out;
}

export const toRadians = function () {
    const matrix = mat3_utils_create();
    return function toRadians(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
        QuatUtils.toMatrix(quat, matrix);

        // Rotation order is ZYX 
        out[1] = Math.asin(-MathUtils.clamp(matrix[2], -1, 1));

        if (Math.abs(matrix[2]) < (1 - MathUtils.EPSILON)) {
            out[0] = Math.atan2(matrix[5], matrix[8]);
            out[2] = Math.atan2(matrix[1], matrix[0]);
        } else {
            out[0] = 0;
            out[2] = Math.atan2(-matrix[3], matrix[4]);
        }

        return out;
    };
}();

export function toDegrees(quat: Readonly<Quaternion>, out = Vec3Utils.create()) {
    QuatUtils.toRadians(quat, out);
    Vec3Utils.toDegrees(out, out);
    return out;
}

export function addRotation(first, second, out) {
    return QuatUtils.addRotationDegrees(first, second, out);
}

export const addRotationDegrees = function () {
    const secondQuat = create();
    return function addRotationDegrees(first, second, out) {
        Vec3Utils.degreesToQuat(second, secondQuat);
        return QuatUtils.addRotationQuat(first, secondQuat, out);
    };
}();

export const addRotationRadians = function () {
    const secondQuat = create();
    return function addRotationRadians(first, second, out) {
        Vec3Utils.radiansToQuat(second, secondQuat);
        return QuatUtils.addRotationQuat(first, secondQuat, out);
    };
}();

export function addRotationQuat(first, second, out = QuatUtils.create()) {
    QuatUtils.mul(second, first, out);
    return out;
}

export function subRotation(first, second, out) {
    return QuatUtils.subRotationDegrees(first, second, out);
}

export const subRotationDegrees = function () {
    const secondQuat = create();
    return function subRotationDegrees(first, second, out) {
        Vec3Utils.degreesToQuat(second, secondQuat);
        return QuatUtils.subRotationQuat(first, secondQuat, out);
    };
}();

export const subRotationRadians = function () {
    const secondQuat = create();
    return function subRotationRadians(first, second, out) {
        Vec3Utils.radiansToQuat(second, secondQuat);
        return QuatUtils.subRotationQuat(first, secondQuat, out);
    };
}();

export const subRotationQuat = function () {
    const inverse = create();
    return function subRotationQuat(first, second, out = QuatUtils.create()) {
        QuatUtils.invert(second, inverse);
        QuatUtils.mul(first, inverse, out);
        return out;
    };
}();

export function rotationTo(from, to, out) {
    return QuatUtils.rotationToDegrees(from, to, out);
}

export const rotationToDegrees = function () {
    const toQuat = create();
    return function rotationToDegrees(from, to, out) {
        Vec3Utils.degreesToQuat(to, toQuat);
        return QuatUtils.rotationToQuat(from, toQuat, out);
    };
}();

export const rotationToRadians = function () {
    const toQuat = create();
    return function rotationToRadians(from, to, out) {
        Vec3Utils.radiansToQuat(to, toQuat);
        return QuatUtils.rotationToQuat(from, toQuat, out);
    };
}();

export function rotationToQuat(from, to, out) {
    return QuatUtils.normalize(QuatUtils.subRotationQuat(to, from, out), out);
}

export function rotationAroundAxis(quat: Readonly<Quaternion>, axis, out) {
    return QuatUtils.rotationAroundAxisDegrees(quat, axis, out);
}

export const rotationAroundAxisDegrees = function () {
    const rotationAroundQuat = create();
    return function rotationAroundAxisDegrees(quat: Readonly<Quaternion>, axis, out = Vec3Utils.create()) {
        QuatUtils.rotationAroundAxisQuat(quat, axis, rotationAroundQuat);
        return QuatUtils.toDegrees(rotationAroundQuat, out);
    };
}();

export const rotationAroundAxisRadians = function () {
    const rotationAroundQuat = create();
    return function rotationAroundAxisRadians(quat: Readonly<Quaternion>, axis, out = Vec3Utils.create()) {
        QuatUtils.rotationAroundAxisQuat(quat, axis, rotationAroundQuat);
        return QuatUtils.toRadians(rotationAroundQuat, out);
    };
}();

export function rotationAroundAxisQuat(quat, axis, out = QuatUtils.create()) {
    return QuatUtils.getTwist(quat, axis, out);
}

export const getTwist = function () {
    const rotationAxis = vec3_utils_create();
    const projection = vec3_utils_create();
    const rotationAlongAxis = create();
    return function getTwist(quat, axis, out = QuatUtils.create()) {
        rotationAxis[0] = quat[0];
        rotationAxis[1] = quat[1];
        rotationAxis[2] = quat[2];

        const dotProd = Vec3Utils.dot(axis, rotationAxis);
        Vec3Utils.scale(axis, dotProd, projection);
        rotationAlongAxis[0] = projection[0];
        rotationAlongAxis[1] = projection[1];
        rotationAlongAxis[2] = projection[2];
        rotationAlongAxis[3] = quat[3];
        QuatUtils.normalize(rotationAlongAxis, rotationAlongAxis);
        if (dotProd < 0) {
            rotationAlongAxis[0] = -rotationAlongAxis[0];
            rotationAlongAxis[1] = -rotationAlongAxis[1];
            rotationAlongAxis[2] = -rotationAlongAxis[2];
            rotationAlongAxis[3] = -rotationAlongAxis[3];
        }

        return QuatUtils.copy(rotationAlongAxis, out);
    };
}();

export const getSwing = function () {
    const twist = create();
    return function getSwing(quat, axis, out = QuatUtils.create()) {
        QuatUtils.getTwist(quat, axis, twist);
        QuatUtils.getSwingFromTwist(quat, twist, out);
        return out;
    };
}();

export function getSwingFromTwist(quat, twist, out = QuatUtils.create()) {
    return QuatUtils.subRotationQuat(quat, twist, out);
}

export const getTwistFromSwing = function () {
    const inverse = create();
    return function getTwistFromSwing(quat, swing, out = QuatUtils.create()) {
        QuatUtils.conjugate(swing, inverse);
        QuatUtils.addRotationQuat(quat, inverse, out);
        return out;
    };
}();

export function fromTwistSwing(twist, swing, out = QuatUtils.create()) {
    return QuatUtils.addRotationQuat(twist, swing, out);
}

export function toMatrix(quat: Readonly<Quaternion>, out = Mat3Utils.create()) {
    gl_mat3.fromQuat(out, quat);
    return out;
}

export function rotate(first, second, out) {
    return QuatUtils.rotateDegrees(first, second, out);
}

export function rotateDegrees(first, second, out) {
    return QuatUtils.addRotationDegrees(first, second, out);
}

export function rotateRadians(first, second, out) {
    return QuatUtils.addRotationRadians(first, second, out);
}

export function rotateQuat(first, second, out) {
    return QuatUtils.addRotationQuat(first, second, out);
}

export function rotateAxis(quat, angle, axis, out) {
    return QuatUtils.rotateAxisDegrees(quat, angle, axis, out);
}

export const rotateAxisDegrees = function () {
    const secondQuat = create();
    return function rotateAxisDegrees(quat, angle, axis, out) {
        QuatUtils.fromAxisDegrees(angle, axis, secondQuat);
        return QuatUtils.rotateQuat(quat, secondQuat, out);
    };
}();

export const rotateAxisRadians = function () {
    const secondQuat = create();
    return function rotateAxisRadians(quat, angle, axis, out) {
        QuatUtils.fromAxisRadians(angle, axis, secondQuat);
        return QuatUtils.rotateQuat(quat, secondQuat, out);
    };
}();

export function lerp(from, to, interpolationFactor, out = QuatUtils.create()) {
    if (interpolationFactor <= 0) {
        QuatUtils.copy(from, out);
        return out;
    } else if (interpolationFactor >= 1) {
        QuatUtils.copy(to, out);
        return out;
    }

    gl_quat.lerp(out, from, to, interpolationFactor);
    return out;
}

export function interpolate(from, to, interpolationFactor, easingFunction = EasingFunction.linear, out = QuatUtils.create()) {
    const lerpFactor = easingFunction(interpolationFactor);
    return QuatUtils.lerp(from, to, lerpFactor, out);
}

export function slerp(from, to, interpolationFactor, out = QuatUtils.create()) {
    if (interpolationFactor <= 0) {
        QuatUtils.copy(from, out);
        return out;
    } else if (interpolationFactor >= 1) {
        QuatUtils.copy(to, out);
        return out;
    }

    gl_quat.slerp(out, from, to, interpolationFactor);
    return out;
}

export function interpolateSpherical(from, to, interpolationFactor, easingFunction = EasingFunction.linear, out = QuatUtils.create()) {
    const lerpFactor = easingFunction(interpolationFactor);
    return QuatUtils.slerp(from, to, lerpFactor, out);
}

export const QuatUtils = {
    create,
    set,
    copy,
    clone,
    isNormalized,
    normalize,
    identity,
    length,
    lengthSquared,
    invert,
    conjugate,
    mul,
    getAxis,
    getAngle,
    getAngleDegrees,
    getAngleRadians,
    getAxisScaled,
    getAxisScaledDegrees,
    getAxisScaledRadians,
    getAxes,
    getForward,
    getBackward,
    getLeft,
    getRight,
    getUp,
    getDown,
    setAxes,
    setForward,
    setBackward,
    setUp,
    setDown,
    setLeft,
    setRight,
    toWorld,
    toLocal,
    fromAxis,
    fromAxisDegrees,
    fromAxisRadians,
    fromAxes,
    fromRadians,
    fromDegrees,
    toRadians,
    toDegrees,
    addRotation,
    addRotationDegrees,
    addRotationRadians,
    addRotationQuat,
    subRotation,
    subRotationDegrees,
    subRotationRadians,
    subRotationQuat,
    rotationTo,
    rotationToDegrees,
    rotationToRadians,
    rotationToQuat,
    rotationAroundAxis,
    rotationAroundAxisDegrees,
    rotationAroundAxisRadians,
    rotationAroundAxisQuat,
    getTwist,
    getSwing,
    getSwingFromTwist,
    getTwistFromSwing,
    fromTwistSwing,
    toMatrix,
    rotate,
    rotateDegrees,
    rotateRadians,
    rotateQuat,
    rotateAxis,
    rotateAxisDegrees,
    rotateAxisRadians,
    lerp,
    interpolate,
    slerp,
    interpolateSpherical
} as const;



const _setAxes = function () {
    const fixedAxes = [vec3_utils_create(), vec3_utils_create(), vec3_utils_create()];

    const fixedAxesFixSignMap = [
        [1, -1, 1],
        [1, 1, -1],
        [-1, 1, -1]
    ];

    const fixedLeft = vec3_utils_create();
    const fixedUp = vec3_utils_create();
    const fixedForward = vec3_utils_create();

    const currentAxis = vec3_utils_create();

    const rotationAxis = vec3_utils_create();
    const rotationMat = mat3_utils_create();
    const rotationQuat = create();
    return function _setAxes(quat: Quaternion, axes: Readonly<[Readonly<Vector3>, Readonly<Vector3>, Readonly<Vector3>]>, priority: Readonly<Vector3>): Quaternion {
        const firstAxis = axes[priority[0]];
        const secondAxis = axes[priority[1]];
        const thirdAxis = axes[priority[2]];

        if (firstAxis == null || Vec3Utils.isZero(firstAxis, MathUtils.EPSILON)) {
            return quat;
        }

        let secondAxisValid = false;
        if (secondAxis != null) {
            const angleBetween = Vec3Utils.angleRadians(firstAxis, secondAxis);
            if (angleBetween > MathUtils.EPSILON) {
                secondAxisValid = true;
            }
        }

        let thirdAxisValid = false;
        if (thirdAxis != null) {
            const angleBetween = Vec3Utils.angleRadians(firstAxis, thirdAxis);
            if (angleBetween > MathUtils.EPSILON) {
                thirdAxisValid = true;
            }
        }

        if (secondAxisValid || thirdAxisValid) {
            let crossAxis = null;
            let secondAxisIndex = null;
            let thirdAxisIndex = null;
            if (secondAxisValid) {
                crossAxis = secondAxis;
                secondAxisIndex = 1;
                thirdAxisIndex = 2;
            } else {
                crossAxis = thirdAxis;
                secondAxisIndex = 2;
                thirdAxisIndex = 1;
            }

            const fixSignMap = fixedAxesFixSignMap[priority[0]];

            Vec3Utils.cross(firstAxis, crossAxis, fixedAxes[thirdAxisIndex]);
            Vec3Utils.scale(fixedAxes[thirdAxisIndex], fixSignMap[priority[thirdAxisIndex]], fixedAxes[thirdAxisIndex]);

            Vec3Utils.cross(firstAxis, fixedAxes[thirdAxisIndex], fixedAxes[secondAxisIndex]);
            Vec3Utils.scale(fixedAxes[secondAxisIndex], fixSignMap[priority[secondAxisIndex]], fixedAxes[secondAxisIndex]);

            Vec3Utils.cross(fixedAxes[1], fixedAxes[2], fixedAxes[0]);
            Vec3Utils.scale(fixedAxes[0], fixSignMap[priority[0]], fixedAxes[0]);

            Vec3Utils.normalize(fixedAxes[ArrayUtils.findIndexEqual(priority, 0)], fixedLeft);
            Vec3Utils.normalize(fixedAxes[ArrayUtils.findIndexEqual(priority, 1)], fixedUp);
            Vec3Utils.normalize(fixedAxes[ArrayUtils.findIndexEqual(priority, 2)], fixedForward);

            Mat3Utils.set(rotationMat,
                fixedLeft[0], fixedLeft[1], fixedLeft[2],
                fixedUp[0], fixedUp[1], fixedUp[2],
                fixedForward[0], fixedForward[1], fixedForward[2]
            );

            Mat3Utils.toQuat(rotationMat, rotationQuat);

            QuatUtils.copy(rotationQuat, quat);
        } else {
            if (priority[0] == 0) {
                QuatUtils.getLeft(quat, currentAxis);
            } else if (priority[0] == 1) {
                QuatUtils.getUp(quat, currentAxis);
            } else {
                QuatUtils.getForward(quat, currentAxis);
            }

            const angleBetween = Vec3Utils.angleRadians(firstAxis, currentAxis);
            if (angleBetween > MathUtils.EPSILON) {
                Vec3Utils.cross(currentAxis, firstAxis, rotationAxis);
                Vec3Utils.normalize(rotationAxis, rotationAxis);

                if (Vec3Utils.isZero(rotationAxis)) {
                    Vec3Utils.perpendicularRandom(currentAxis, rotationAxis);
                    Vec3Utils.normalize(rotationAxis, rotationAxis);
                }

                QuatUtils.fromAxisRadians(angleBetween, rotationAxis, rotationQuat);
                QuatUtils.rotateQuat(quat, rotationQuat, quat);
            }
        }

        return quat;
    };
}();