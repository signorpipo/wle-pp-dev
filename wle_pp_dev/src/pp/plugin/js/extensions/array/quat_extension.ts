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

        quat_set<T extends Quaternion>(this: T, x: number, y?: number, z?: number, w?: number): T {
            return QuatUtils.set(this);
        },

        quat_copy<T extends Quaternion>(this: T, quat: Readonly<Quaternion>): T {
            return QuatUtils.copy(quat, this);
        },

        quat_clone<T extends Quaternion>(this: Readonly<T>): T {
            return QuatUtils.clone(this);
        },

        quat_isNormalized(this: Readonly<Quaternion>, epsilon?: number): boolean {
            return QuatUtils.isNormalized(this);
        },

        quat_normalize<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.normalize(this);
        },

        quat_length(this: Readonly<Quaternion>): number {
            return QuatUtils.length(this);
        },

        quat_lengthSquared(this: Readonly<Quaternion>): number {
            return QuatUtils.lengthSquared(this);
        },

        quat_identity<T extends Quaternion>(this: Readonly<T>): T {
            return QuatUtils.identity(this);
        },

        quat_mul<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.mul(this);
        },

        quat_invert<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.invert(this);
        },

        quat_conjugate<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.conjugate(this);
        },

        quat_lerp<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, out?: T | U): T | U {
            return QuatUtils.lerp(this, to, interpolationFactor, out!);
        },

        quat_interpolate<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction, out?: T | U): T | U {
            return QuatUtils.interpolate(this);
        },

        quat_slerp<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, out?: T | U): T | U {
            return QuatUtils.slerp(this);
        },

        quat_interpolateSpherical<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, interpolationFactor: number, easingFunction?: EasingFunction, out?: T | U): T | U {
            return QuatUtils.interpolateSpherical(this);
        },
        quat_getAngle(this: Readonly<Quaternion>): number {
            return QuatUtils.getAngle(this);
        },

        quat_getAngleDegrees(this: Readonly<Quaternion>): number {
            return QuatUtils.getAngleDegrees(this);
        },

        quat_getAngleRadians(this: Readonly<Quaternion>): number {
            return QuatUtils.getAngleRadians(this);
        },

        quat_getAxis<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getAxis(this);
        },

        quat_getAxisScaled<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getAxisScaled(this);
        },

        quat_getAxisScaledDegrees<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getAxisScaledDegrees(this);
        },

        quat_getAxisScaledRadians<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getAxisScaledRadians(this);
        },

        quat_getAxes<T extends Vector3, U extends Vector3, V extends Vector3>(this: Readonly<Quaternion>, out?: [Vector3, Vector3, Vector3] | [T, U, V]): [Vector3, Vector3, Vector3] | [T, U, V] {
            return QuatUtils.getAxes(this);
        },
        quat_getForward<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getForward(this);
        },

        quat_getBackward<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getBackward(this);
        },

        quat_getLeft<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getLeft(this);
        },

        quat_getRight<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getRight(this);
        },

        quat_getUp<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.getUp(this);
        },

        quat_setAxes<T extends Quaternion>(this: T, left: Readonly<Vector3>, up: Readonly<Vector3>, forward: Readonly<Vector3>): T {
            return QuatUtils.setAxes(this);
        },

        quat_setForward<T extends Quaternion>(this: T, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.setForward(this);
        },

        quat_setBackward<T extends Quaternion>(this: T, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.setBackward(this);
        },

        quat_setUp<T extends Quaternion>(this: T, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.setUp(this);
        },

        quat_setDown<T extends Quaternion>(this: T, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): T {
            return QuatUtils.setDown(this);
        },

        quat_setLeft<T extends Quaternion>(this: T, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T {
            return QuatUtils.setLeft(this);
        },

        quat_setRight<T extends Quaternion>(this: T, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): T {
            return QuatUtils.setRight(this);
        },

        quat_toWorld<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, parentRotationQuat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.toWorld(this);
        },

        quat_toLocal<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, parentRotationQuat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.toLocal(this);
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

        quat_toDegrees<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.toDegrees(this);
        },

        quat_toRadians<T extends Vector3>(this: Readonly<Quaternion>, out?: Vector3 | T): Vector3 | T {
            return QuatUtils.toRadians(this);
        },

        quat_toMatrix<T extends Matrix3>(this: Readonly<Quaternion>, out?: Matrix3 | T): Matrix3 | T {
            return QuatUtils.toMatrix(this);
        },

        quat_addRotation<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.addRotation(this);
        },

        quat_addRotationDegrees<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.addRotationDegrees(this);
        },

        quat_addRotationRadians<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.addRotationRadians(this);
        },

        quat_addRotationQuat<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.addRotationQuat(this);
        },

        quat_subRotation<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.subRotation(this);
        },

        quat_subRotationDegrees<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.subRotationDegrees(this);
        },

        quat_subRotationRadians<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.subRotationRadians(this);
        },

        quat_subRotationQuat<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.subRotationQuat(this);
        },

        quat_rotationTo<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotationTo(this);
        },

        quat_rotationToDegrees<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotationToDegrees(this);
        },

        quat_rotationToRadians<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotationToRadians(this);
        },

        quat_rotationToQuat<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, to: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotationToQuat(this);
        },

        quat_rotationAroundAxis<T extends Vector3, U extends Vector3>(this: Readonly<Quaternion>, axis: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.rotationAroundAxis(this);
        },

        quat_rotationAroundAxisDegrees<T extends Vector3, U extends Vector3>(this: Readonly<Quaternion>, axis: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.rotationAroundAxisDegrees(this);
        },

        quat_rotationAroundAxisRadians<T extends Vector3, U extends Vector3>(this: Readonly<Quaternion>, axis: Readonly<T>, out?: T | U): T | U {
            return QuatUtils.rotationAroundAxisRadians(this);
        },

        quat_rotationAroundAxisQuat<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.rotationAroundAxisQuat(this);
        },

        quat_getTwist<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.getTwist(this);
        },

        quat_getSwing<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.getSwing(this);
        },

        quat_getSwingFromTwist<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, twist: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.getSwingFromTwist(this);
        },

        quat_getTwistFromSwing<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, swing: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.getTwistFromSwing(this);
        },

        quat_fromTwistSwing<T extends Quaternion>(this: T, twist: Readonly<Quaternion>, swing: Readonly<Quaternion>): T {
            return QuatUtils.fromTwistSwing(twist, swing, this);
        },

        quat_rotate<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotate(this);
        },

        quat_rotateDegrees<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotateDegrees(this);
        },

        quat_rotateRadians<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotateRadians(this);
        },

        quat_rotateQuat<T extends Quaternion, U extends Quaternion>(this: Readonly<T>, quat: Readonly<Quaternion>, out?: T | U): T | U {
            return QuatUtils.rotateQuat(this);
        },

        quat_rotateAxis<T extends Quaternion, U extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.rotateAxis(this);
        },

        quat_rotateAxisDegrees<T extends Quaternion, U extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.rotateAxisDegrees(this);
        },

        quat_rotateAxisRadians<T extends Quaternion, U extends Quaternion>(this: T, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return QuatUtils.rotateAxisRadians(this);
        }
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(quatExtension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}