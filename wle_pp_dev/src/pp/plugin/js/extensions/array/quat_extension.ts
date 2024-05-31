import { Mat3Utils } from "wle-pp/cauldron/utils/array/mat3_utils.js";
import { QuatUtils } from "wle-pp/cauldron/utils/array/quat_utils.js";
import { Vec3Utils } from "wle-pp/cauldron/utils/array/vec3_utils.js";
import { EasingFunction } from "wle-pp/cauldron/utils/math_utils.js";
import { Matrix3, Quaternion, Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";
import { QuaternionExtension } from "./quat_type_extension.js";

import "./quat_type_extension.js";

export function initQuatExtension(): void {
    _initQuatExtensionProtoype();
}

function _initQuatExtensionProtoype(): void {

    const quatExtension: QuaternionExtension<Quaternion> = {

        quat_set<T extends Quaternion>(quat: T, x: number, y?: number, z?: number, w?: number): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_copy<T extends Quaternion>(this: T, quat: Readonly<Quaternion>): T {
            return QuatUtils.copy(quat, this);
        },

        quat_clone<T extends Quaternion>(quat: Readonly<T>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_isNormalized(quat: Readonly<Quaternion>, epsilon?: number): boolean {
            return QuatUtils.asdasdasd(this);
        },

        quat_normalize<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_length(quat: Readonly<Quaternion>): number {
            return QuatUtils.asdasdasd(this);
        },

        quat_lengthSquared(quat: Readonly<Quaternion>): number {
            return QuatUtils.asdasdasd(this);
        },

        quat_identity<T extends Quaternion>(quat: Readonly<T>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_mul<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out: T | U = QuatUtils.clone(first)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_invert<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_conjugate<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_lerp<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, out: T | U = QuatUtils.clone(from)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_interpolate<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction, out: T | U = QuatUtils.clone(from)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_slerp<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, out: T | U = QuatUtils.clone(from)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_interpolateSpherical<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction, out: T | U = QuatUtils.clone(from)): T | U {
            return QuatUtils.asdasdasd(this);
        },
        quat_getAngle(quat: Readonly<Quaternion>): number {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAngleDegrees(quat: Readonly<Quaternion>): number {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAngleRadians(quat: Readonly<Quaternion>): number {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAxis<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAxisScaled<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAxisScaledDegrees<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAxisScaledRadians<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getAxes<T extends Vector3, U extends Vector3, V extends Vector3>(quat: Readonly<Quaternion>, out?: [Vector3, Vector3, Vector3] | [T, U, V]): [Vector3, Vector3, Vector3] | [T, U, V] {
            return QuatUtils.asdasdasd(this);
        },
        quat_getForward<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getBackward<T extends Vector3>(quat: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getLeft<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getRight<T extends Vector3>(quat: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_getUp<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setAxes<T extends Quaternion>(quat: T, left: Readonly<Vector3>, up: Readonly<Vector3>, forward: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setForward<T extends Quaternion>(quat: T, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setBackward<T extends Quaternion>(quat: T, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setUp<T extends Quaternion>(quat: T, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setDown<T extends Quaternion>(quat: T, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setLeft<T extends Quaternion>(quat: T, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_setRight<T extends Quaternion>(quat: T, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T {
            return QuatUtils.asdasdasd(this);
        },

        quat_toWorld<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, parentRotationQuat: Readonly<Quaternion>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_toLocal<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, parentRotationQuat: Readonly<Quaternion>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_fromDegrees<T extends Quaternion>(this: T, rotation: Readonly<Vector3>): T {
            return QuatUtils.fromDegrees(rotation, this);
        },

        quat_fromRadians<T extends Quaternion>(this: T, rotation: Readonly<Vector3>): T {
            return QuatUtils.fromRadians(rotation, this);
        },

        quat_fromAxis<T extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>): T {
            return QuatUtils.fromAxis(angle, axis, this);
        },

        quat_fromAxisDegrees<T extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>): T {
            return QuatUtils.fromAxisDegrees(angle, axis, this);
        },

        quat_fromAxisRadians<T extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>): T {
            return QuatUtils.fromAxisRadians(angle, axis, this);
        },

        quat_fromAxes<T extends Quaternion>(this: T, left: Readonly<Vector3>, up: Readonly<Vector3>, forward: Readonly<Vector3>): Quaternion | T {
            return QuatUtils.fromAxes(left, up, forward, this);
        },

        quat_toDegrees<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_toRadians<T extends Vector3>(quat: Readonly<Quaternion>, out: Vector3 | T = Vec3Utils.create()): Vector3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_toMatrix<T extends Matrix3>(quat: Readonly<Quaternion>, out: Matrix3 | T = Mat3Utils.create()): Matrix3 | T {
            return QuatUtils.asdasdasd(this);
        },

        quat_addRotation<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_addRotationDegrees<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_addRotationRadians<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_addRotationQuat<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out: T | U = QuatUtils.clone(first)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_subRotation<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_subRotationDegrees<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_subRotationRadians<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_subRotationQuat<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out: T | U = QuatUtils.clone(first)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationTo<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationToDegrees<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationToRadians<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationToQuat<T extends Quaternion, U extends Quaternion>(from: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationAroundAxis<T extends Vector3, U extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationAroundAxisDegrees<T extends Vector3, U extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>, out: T | U = Vec3Utils.clone(axis)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationAroundAxisRadians<T extends Vector3, U extends Vector3>(quat: Readonly<Quaternion>, axis: Readonly<T>, out: T | U = Vec3Utils.clone(axis)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotationAroundAxisQuat<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_getTwist<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_getSwing<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, axis: Readonly<Vector3>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_getSwingFromTwist<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, twist: Readonly<Quaternion>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_getTwistFromSwing<T extends Quaternion, U extends Quaternion>(quat: Readonly<T>, swing: Readonly<Quaternion>, out: T | U = QuatUtils.clone(quat)): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_fromTwistSwing<T extends Quaternion>(this: T, twist: Readonly<Quaternion>, swing: Readonly<Quaternion>): T {
            return QuatUtils.fromTwistSwing(twist, swing, this);
        },

        quat_rotate<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateDegrees<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateRadians<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateQuat<T extends Quaternion, U extends Quaternion>(first: Readonly<T>, second: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateAxis<T extends Quaternion, U extends Quaternion>(quat: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateAxisDegrees<T extends Quaternion, U extends Quaternion>(quat: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        },

        quat_rotateAxisRadians<T extends Quaternion, U extends Quaternion>(quat: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.asdasdasd(this);
        }
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(quatExtension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}