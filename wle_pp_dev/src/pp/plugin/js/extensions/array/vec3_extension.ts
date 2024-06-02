import { Mat3Utils } from "wle-pp/cauldron/utils/array/mat3_utils.js";
import { QuatUtils } from "wle-pp/cauldron/utils/array/quat_utils.js";
import { Vec3Utils } from "wle-pp/cauldron/utils/array/vec3_utils.js";
import { EasingFunction } from "wle-pp/cauldron/utils/math_utils.js";
import { Matrix3, Matrix4, Quaternion, Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";
import { ArrayExtensionUtils } from "./array_extension_utils.js";
import { Vector3Extension } from "./vec3_type_extension.js";

import "./vec3_type_extension.js";
import { first } from "wle-pp/cauldron/utils/array/array_utils.js";

export function initVec3Extension(): void {
    _initVec3ExtensionProtoype();
}

function _initVec3ExtensionProtoype(): void {

    const vec3Extension: Vector3Extension<Vector3> = {

        vec3_set<T extends Vector3>(this: T, x: number, y?: number, z?: number): T {
            return Vec3Utils.set(this, x!, y!, z!);
        },

        vec3_copy<T extends Vector3>(this: T, vector: Readonly<Vector3>): T {
            return Vec3Utils.copy(vector, this);
        },

        vec3_clone<T extends Vector3>(this: Readonly<T>): T {
            return Vec3Utils.clone(this);
        },

        vec3_isNormalized(this: Readonly<Vector3>, epsilon?: number): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_normalize<T extends Vector3, U extends Vector3>(this: Readonly<T>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },
        vec3_isZero(this: Readonly<Vector3>, epsilon?: number): boolean {
            return Vec3Utils.asdasd(this);
        },
        vec3_zero<T extends Vector3>(this: T): T {
            return Vec3Utils.asdasd(this);
        },

        vec3_length(this: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_lengthSquared(this: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_lengthSigned(this: Readonly<Vector3>, positiveDirection: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_distance(this: Readonly<Vector3>, vector: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },
        vec3_distanceSquared(this: Readonly<Vector3>, vector: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_equals(this: Readonly<Vector3>, vector: Readonly<Vector3>, epsilon?: number): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_add<T extends Vector3, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, out: T | U = Vec3Utils.clone(first)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_sub<T extends Vector3, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, out: T | U = Vec3Utils.clone(first)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_mul<T extends Vector3, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, out: T | U = Vec3Utils.clone(first)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_div<T extends Vector3, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, out: T | U = Vec3Utils.clone(first)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_scale<T extends Vector3, U extends Vector3>(this: Readonly<T>, value: number, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_negate<T extends Vector3, U extends Vector3>(this: Readonly<T>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_dot(this: Readonly<Vector3>, vector: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_cross<T extends Vector3, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, out: T | U = Vec3Utils.clone(first)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_transformQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, quat: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_transformMat3<T extends Vector3, U extends Vector3>(this: Readonly<T>, matrix: Readonly<Matrix3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_transformMat4<T extends Vector3, U extends Vector3>(this: Readonly<T>, matrix: Readonly<Matrix4>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_lerp<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, interpolationFactor: number, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_interpolate<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, interpolationFactor: number, easingFunction: EasingFunction = EasingFunction.linear, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_angleDegrees(this: Readonly<Vector3>, vector: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_angleRadians(this: Readonly<Vector3>, vector: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_angleSigned(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_angleSignedDegrees(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_angleSignedRadians(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivoted(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivotedDegrees(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivotedRadians(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivotedSigned(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivotedSignedDegrees(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_anglePivotedSignedRadians(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_valueAlongAxis(this: Readonly<Vector3>, axis: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_valueAlongPlane(this: Readonly<Vector3>, planeNormal: Readonly<Vector3>): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_componentAlongAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, axis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_removeComponentAlongAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, axis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_copyComponentAlongAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, axis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },
        vec3_isConcordant(this: Readonly<Vector3>, vector: Readonly<Vector3>): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_isFartherAlongAxis(this: Readonly<Vector3>, vector: Readonly<Vector3>, axis: Readonly<Vector3>): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_isToTheRight(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_signTo(this: Readonly<Vector3>, vector: Readonly<Vector3>, referenceAxis: Readonly<Vector3>, zeroSign: number = 1): number {
            return Vec3Utils.asdasd(this);
        },

        vec3_projectOnAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, axis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_projectOnAxisAlongAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, axis: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_projectOnPlane<T extends Vector3, U extends Vector3>(this: Readonly<T>, planeNormal: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_projectOnPlaneAlongAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, planeNormal: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_isOnAxis(this: Readonly<Vector3>, axis: Readonly<Vector3>): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_isOnPlane(this: Readonly<Vector3>, planeNormal: Readonly<Vector3>): boolean {
            return Vec3Utils.asdasd(this);
        },

        vec3_perpendicularAny<T extends Vector3, U extends Vector3>(this: Readonly<T>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotate<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Quaternion>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAxisDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAxisRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAround<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundAxis<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundAxisDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotateAroundAxisRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_addRotation<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_addRotationDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_addRotationRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_addRotationQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Quaternion>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesAddRotation<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesAddRotationDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesAddRotationRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesAddRotationQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansAddRotation<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansAddRotationDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansAddRotationRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Vector3>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansAddRotationQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, rotation: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationTo<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToQuat<T extends Quaternion>(from: Readonly<Vector3>, to: Readonly<Vector3>, out: Quaternion | T = QuatUtils.create()): Quaternion | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToPivoted<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToPivotedDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToPivotedRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T | U = Vec3Utils.clone(from)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_rotationToPivotedQuat<T extends Quaternion>(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: Quaternion | T = QuatUtils.create()): Quaternion | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToWorld<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToLocal<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToWorldMatrix<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToLocalMatrix<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToWorldQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertPositionToLocalQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToWorld<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToLocal<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out?: T | U): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToWorldMatrix<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToLocalMatrix<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Matrix4>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToWorldQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_convertDirectionToLocalQuat<T extends Vector3, U extends Vector3>(this: Readonly<T>, parentTransform: Readonly<Quaternion>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_toRadians<T extends Vector3, U extends Vector3>(this: Readonly<T>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_toDegrees<T extends Vector3, U extends Vector3>(this: Readonly<T>, out: T | U = Vec3Utils.clone(vector)): T | U {
            return Vec3Utils.asdasd(this);
        },

        vec3_toQuat<T extends Quaternion>(this: Readonly<Vector3>, out: Quaternion | T = QuatUtils.create()): Quaternion | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansToQuat<T extends Quaternion>(this: Readonly<Vector3>, out: Quaternion | T = QuatUtils.create()): Quaternion | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesToQuat<T extends Quaternion>(this: Readonly<Vector3>, out: Quaternion | T = QuatUtils.create()): Quaternion | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_toMatrix<T extends Matrix3>(this: Readonly<Vector3>, out: Matrix3 | T = Mat3Utils.create()): Matrix3 | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_degreesToMatrix<T extends Matrix3>(this: Readonly<Vector3>, out: Matrix3 | T = Mat3Utils.create()): Matrix3 | T {
            return Vec3Utils.asdasd(this);
        },

        vec3_radiansToMatrix<T extends Matrix3>(this: Readonly<Vector3>, out: Matrix3 | T = Mat3Utils.create()): Matrix3 | T {
            return Vec3Utils.asdasd(this);
        }
    };

    for (const arrayLikeClassToExtend of ArrayExtensionUtils.ARRAY_LIKE_CLASSES) {
        PluginUtils.injectOwnProperties(vec3Extension, arrayLikeClassToExtend.prototype, false, true, true);
    }
}