/**
 * #WARN this type extension is actually added at runtime only if you call `initQuatExtension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { EasingFunction } from "wle-pp/cauldron/utils/math_utils.js";
import { Matrix3, Quaternion, Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface QuaternionExtension<QuaternionType extends Quaternion> {
    quat_set<T extends QuaternionType>(this: T, x: number, y: number, z: number, w: number): T;
    quat_set<T extends QuaternionType>(this: T, uniformValue: number): T;


    quat_copy<T extends QuaternionType>(this: T, quat: Readonly<Quaternion>): this;
    quat_clone<T extends QuaternionType>(this: Readonly<T>): T;


    quat_isNormalized(quat: Readonly<Quaternion>, epsilon?: number): boolean;


    quat_normalize<T extends Quaternion>(quat: Readonly<T>): T;
    quat_normalize<T extends Quaternion>(quat: Readonly<Quaternion>, out: T): T;


    quat_length(quat: Readonly<Quaternion>): number;


    quat_lengthSquared(quat: Readonly<Quaternion>): number;


    quat_identity<T extends Quaternion>(quat: Readonly<T>): T;


    quat_mul<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_mul<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_invert<T extends Quaternion>(quat: Readonly<T>): T;
    quat_invert<T extends Quaternion>(quat: Readonly<Quaternion>, out: T): T;

    quat_conjugate<T extends Quaternion>(quat: Readonly<T>): T;
    quat_conjugate<T extends Quaternion>(quat: Readonly<Quaternion>, out: T): T;


    quat_lerp<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number): T;
    quat_lerp<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, interpolationFactor: number, out: T): T;


    quat_interpolate<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction): T;
    quat_interpolate<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction: EasingFunction, out: T): T;


    quat_slerp<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number): T;
    quat_slerp<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, interpolationFactor: number, out: T): T;


    quat_interpolateSpherical<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction): T;
    quat_interpolateSpherical<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction: EasingFunction, out: T): T;


    quat_getAxis(quat: Readonly<Quaternion>): Vector3;
    quat_getAxis<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getAngle(quat: Readonly<Quaternion>): number;

    quat_getAngleDegrees(quat: Readonly<Quaternion>): number;

    quat_getAngleRadians(quat: Readonly<Quaternion>): number;


    quat_getAxisScaled(quat: Readonly<Quaternion>): Vector3;
    quat_getAxisScaled<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getAxisScaledDegrees(quat: Readonly<Quaternion>): Vector3;
    quat_getAxisScaledDegrees<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getAxisScaledRadians(quat: Readonly<Quaternion>): Vector3;
    quat_getAxisScaledRadians<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getAxes(quat: Readonly<Quaternion>): [Vector3, Vector3, Vector3];
    quat_getAxes<T extends Vector3, U extends Vector3, V extends Vector3>(quat: Readonly<Quaternion>, out: [T, U, V]): [T, U, V];


    quat_getForward(quat: Readonly<Quaternion>): Vector3;
    quat_getForward<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getBackward(quat: Readonly<Quaternion>): Vector3;
    quat_getBackward<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getLeft(quat: Readonly<Quaternion>): Vector3;
    quat_getLeft<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;

    quat_getRight(quat: Readonly<Quaternion>): Vector3;
    quat_getRight<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getUp(quat: Readonly<Quaternion>): Vector3;
    quat_getUp<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_getDown(quat: Readonly<Quaternion>): Vector3;
    quat_getDown<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;

    quat_setAxes<T extends QuaternionType>(this: T, left: Readonly<Vector3>, up: Readonly<Vector3>, forward: Readonly<Vector3>): T;

    quat_setForward<T extends QuaternionType>(this: T, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T;

    quat_setBackward<T extends QuaternionType>(this: T, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T;

    quat_setUp<T extends QuaternionType>(this: T, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T;

    quat_setDown<T extends QuaternionType>(this: T, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T;

    quat_setLeft<T extends QuaternionType>(this: T, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T;

    quat_setRight<T extends QuaternionType>(this: T, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T;


    quat_toWorld<T extends Quaternion>(quat: Readonly<T>, parentRotationQuat: Readonly<Quaternion>): T;
    quat_toWorld<T extends Quaternion>(quat: Readonly<Quaternion>, parentRotationQuat: Readonly<Quaternion>, out: T): T;


    quat_toLocal<T extends Quaternion>(quat: Readonly<T>, parentRotationQuat: Readonly<Quaternion>): T;
    quat_toLocal<T extends Quaternion>(quat: Readonly<Quaternion>, parentRotationQuat: Readonly<Quaternion>, out: T): T;



    quat_fromAxis<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): this;
    quat_fromAxisDegrees<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): this;
    quat_fromAxisRadians<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): this;

    quat_fromAxes<T extends QuaternionType>(this: T, leftAxis: Readonly<Vector3>, upAxis: Readonly<Vector3>, forwardAxis: Readonly<Vector3>): this;

    quat_fromRadians<T extends QuaternionType>(this: T, rotation: Readonly<Vector3>): this;
    quat_fromDegrees<T extends QuaternionType>(this: T, rotation: Readonly<Vector3>): this;



    quat_toRadians(quat: Readonly<Quaternion>): Vector3;
    quat_toRadians<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_toDegrees(quat: Readonly<Quaternion>): Vector3;
    quat_toDegrees<T extends Vector3>(quat: Readonly<Quaternion>, out: T): T;


    quat_addRotation<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_addRotation<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_addRotationDegrees<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_addRotationDegrees<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_addRotationRadians<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_addRotationRadians<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_addRotationQuat<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_addRotationQuat<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;

    quat_subRotation<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_subRotation<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_subRotationDegrees<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_subRotationDegrees<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;

    quat_subRotationRadians<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_subRotationRadians<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_subRotationQuat<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_subRotationQuat<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_rotationTo<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>): T;
    quat_rotationTo<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, out: T): T;


    quat_rotationToDegrees<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>): T;
    quat_rotationToDegrees<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, out: T): T;


    quat_rotationToRadians<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>): T;
    quat_rotationToRadians<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, out: T): T;


    quat_rotationToQuat<T extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>): T;
    quat_rotationToQuat<T extends Quaternion>(from: Readonly<Quaternion>, to: Readonly<Quaternion>, out: T): T;


    quat_rotationAroundAxis<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>): T;
    quat_rotationAroundAxis<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_rotationAroundAxisDegrees<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>): T;
    quat_rotationAroundAxisDegrees<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_rotationAroundAxisRadians<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>): T;
    quat_rotationAroundAxisRadians<T extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_rotationAroundAxisQuat<T extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>): T;
    quat_rotationAroundAxisQuat<T extends Quaternion>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_getTwist<T extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>): T;
    quat_getTwist<T extends Quaternion>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_getSwing<T extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>): T;
    quat_getSwing<T extends Quaternion>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_getSwingFromTwist<T extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>): T;
    quat_getSwingFromTwist<T extends Quaternion>(quat: Readonly<Quaternion>, axis: Readonly<Vector3>, out: T): T;


    quat_getTwistFromSwing<T extends Quaternion>(quat: Readonly<T>, swing: Readonly<Quaternion>): T;
    quat_getTwistFromSwing<T extends Quaternion>(quat: Readonly<Quaternion>, swing: Readonly<Quaternion>, out: T): T;


    quat_fromTwistSwing<T extends QuaternionType>(this: T, twist: Readonly<Quaternion>, swing: Readonly<Quaternion>): this;

    quat_toMatrix(quat: Readonly<Quaternion>): Matrix3;
    quat_toMatrix<T extends Matrix3>(quat: Readonly<Quaternion>, out: T): T;


    quat_rotate<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_rotate<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_rotateDegrees<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_rotateDegrees<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_rotateRadians<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_rotateRadians<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;

    quat_rotateQuat<T extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>): T;
    quat_rotateQuat<T extends Quaternion>(first: Readonly<Quaternion>, second: Readonly<Quaternion>, out: T): T;


    quat_rotateAxis<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): T;
    quat_rotateAxis<T extends Quaternion>(quat: Quaternion, angle: number, axis: Readonly<Vector3>, ou?: T): T;


    quat_rotateAxisDegrees<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): T;
    quat_rotateAxisDegrees<T extends Quaternion>(quat: Quaternion, angle: number, axis: Readonly<Vector3>, ou?: T): T;

    quat_rotateAxisRadians<T extends QuaternionType>(this: T, angle: number, axis: Readonly<Vector3>): T;
    quat_rotateAxisRadians<T extends Quaternion>(quat: Quaternion, angle: number, axis: Readonly<Vector3>, ou?: T): T;

}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends QuaternionExtension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends QuaternionExtension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends QuaternionExtension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends QuaternionExtension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends QuaternionExtension<Uint32Array> { }
}

declare global {
    interface Int8Array extends QuaternionExtension<Int8Array> { }
}

declare global {
    interface Int16Array extends QuaternionExtension<Int16Array> { }
}

declare global {
    interface Int32Array extends QuaternionExtension<Int32Array> { }
}

declare global {
    interface Float32Array extends QuaternionExtension<Float32Array> { }
}

declare global {
    interface Float64Array extends QuaternionExtension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends QuaternionExtension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends QuaternionExtension<DynamicArrayLike<number>> { }

    interface Vector extends QuaternionExtension<Vector> { }

    interface Vector2 extends QuaternionExtension<Vector2> { }

    interface Vector3 extends QuaternionExtension<Vector3> { }

    interface Vector4 extends QuaternionExtension<Vector4> { }

    interface Quaternion extends QuaternionExtension<Quaternion> { }

    interface Quaternion2 extends QuaternionExtension<Quaternion2> { }

    interface Matrix2 extends QuaternionExtension<Matrix2> { }

    interface Matrix3 extends QuaternionExtension<Matrix3> { }

    interface Matrix4 extends QuaternionExtension<Matrix4> { }
}