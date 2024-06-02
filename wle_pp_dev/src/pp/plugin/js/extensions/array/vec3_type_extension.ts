/**
 * #WARN this type extension is actually added at runtime only if you call `initVec3Extension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { EasingFunction } from "wle-pp/cauldron/utils/math_utils.js";
import { Matrix3, Matrix4, Quaternion, Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface Vector3Extension<VectorType extends Vector3> {
    vec3_set<T extends Vector3>(vector: T, x: number, y: number, z: number): T;
    vec3_set<T extends Vector3>(vector: T, uniformValue: number): T;


    vec3_copy<T extends VectorType>(this: T, vector: Readonly<VectorType>): this;
    vec3_clone<T extends VectorType>(this: Readonly<T>): T;


    vec3_isNormalized(vector: Readonly<Vector3>, epsilon?: number): boolean;

    vec3_normalize<T extends Vector3>(vector: Readonly<T>): T;
    vec3_normalize<T extends Vector3>(vector: Readonly<Vector3>, out: T): T;

    vec3_isZero(vector: Readonly<Vector3>, epsilon?: number): boolean;

    vec3_zero<T extends Vector3>(vector: T): T;


    vec3_length(vector: Readonly<Vector3>): number;


    vec3_lengthSquared(vector: Readonly<Vector3>): number;

    vec3_lengthSigned(vector: Readonly<Vector3>, positiveDirection: Readonly<Vector3>): number;

    vec3_distance(first: Readonly<Vector3>, second: Readonly<Vector3>): number;

    vec3_distanceSquared(first: Readonly<Vector3>, second: Readonly<Vector3>): number;


    vec3_equals(first: Readonly<Vector3>, second: Readonly<Vector3>, epsilon?: number): boolean;


    vec3_add<T extends Vector3>(first: Readonly<T>, second: Readonly<Vector3>): T;
    vec3_add<T extends Vector3>(first: Readonly<Vector3>, second: Readonly<Vector3>, out: T): T;

    vec3_sub<T extends Vector3>(first: Readonly<T>, second: Readonly<Vector3>): T;
    vec3_sub<T extends Vector3>(first: Readonly<Vector3>, second: Readonly<Vector3>, out: T): T;

    vec3_mul<T extends Vector3>(first: Readonly<T>, second: Readonly<Vector3>): T;
    vec3_mul<T extends Vector3>(first: Readonly<Vector3>, second: Readonly<Vector3>, out: T): T;

    vec3_div<T extends Vector3>(first: Readonly<T>, second: Readonly<Vector3>): T;
    vec3_div<T extends Vector3>(first: Readonly<Vector3>, second: Readonly<Vector3>, out: T): T;

    vec3_scale<T extends Vector3>(vector: Readonly<T>, value: number): T;
    vec3_scale<T extends Vector3>(vector: Readonly<Vector3>, value: number, out: T): T;

    vec3_dot(first: Readonly<Vector3>, second: Readonly<Vector3>): number;

    vec3_negate<T extends Vector3>(vector: Readonly<T>): T;
    vec3_negate<T extends Vector3>(vector: Readonly<Vector3>, out: T): T;

    vec3_cross<T extends Vector3>(first: Readonly<T>, second: Readonly<Vector3>): T;
    vec3_cross<T extends Vector3>(first: Readonly<Vector3>, second: Readonly<Vector3>, out: T): T;

    vec3_transformQuat<T extends Vector3>(vector: Readonly<T>, quat: Readonly<Quaternion>): T;
    vec3_transformQuat<T extends Vector3>(vector: Readonly<Vector3>, quat: Readonly<Quaternion>, out: T): T;

    vec3_transformMat3<T extends Vector3>(vector: Readonly<T>, matrix: Readonly<Matrix3>): T;
    vec3_transformMat3<T extends Vector3>(vector: Readonly<Vector3>, matrix: Readonly<Matrix3>, out: T): T;

    vec3_transformMat4<T extends Vector3>(vector: Readonly<T>, matrix: Readonly<Matrix4>): T;
    vec3_transformMat4<T extends Vector3>(vector: Readonly<Vector3>, matrix: Readonly<Matrix4>, out: T): T;

    vec3_lerp<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>, interpolationFactor: number): T;
    vec3_lerp<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, interpolationFactor: number, out: T): T;


    vec3_interpolate<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>, interpolationFactor: number, easingFunction?: EasingFunction): T;
    vec3_interpolate<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, interpolationFactor: number, easingFunction: EasingFunction, out: T): T;

    vec3_angle(first: Readonly<Vector3>, second: Readonly<Vector3>): number;


    vec3_angleDegrees(first: Readonly<Vector3>, second: Readonly<Vector3>): number;

    vec3_angleRadians(first: Readonly<Vector3>, second: Readonly<Vector3>): number;


    vec3_angleSigned(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_angleSignedDegrees(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_angleSignedRadians(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_anglePivoted(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_anglePivotedDegrees(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_anglePivotedRadians(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;


    vec3_anglePivotedSigned(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_anglePivotedSignedDegrees(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;

    vec3_anglePivotedSignedRadians(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): number;


    vec3_toRadians<T extends Vector3>(vector: Readonly<T>): T;
    vec3_toRadians<T extends Vector3>(vector: Readonly<Vector3>, out: T): T;


    vec3_toDegrees<T extends Vector3>(vector: Readonly<T>): T;
    vec3_toDegrees<T extends Vector3>(vector: Readonly<Vector3>, out: T): T;

    vec3_toQuat(vector: Readonly<Vector3>): Quaternion;
    vec3_toQuat<T extends Quaternion>(vector: Readonly<Vector3>, out: T): T;

    vec3_radiansToQuat(vector: Readonly<Vector3>): Quaternion;
    vec3_radiansToQuat<T extends Quaternion>(vector: Readonly<Vector3>, out: T): T;


    vec3_degreesToQuat(vector: Readonly<Vector3>): Quaternion;
    vec3_degreesToQuat<T extends Quaternion>(vector: Readonly<Vector3>, out: T): T;


    vec3_toMatrix(vector: Readonly<Vector3>): Matrix3;
    vec3_toMatrix<T extends Matrix3>(vector: Readonly<Vector3>, out: T): T;


    vec3_degreesToMatrix(vector: Readonly<Vector3>): Matrix3;
    vec3_degreesToMatrix<T extends Matrix3>(vector: Readonly<Vector3>, out: T): T;

    vec3_radiansToMatrix(vector: Readonly<Vector3>): Matrix3;
    vec3_radiansToMatrix<T extends Matrix3>(vector: Readonly<Vector3>, out: T): T;

    vec3_valueAlongAxis(vector: Readonly<Vector3>, axis: Readonly<Vector3>): number;

    vec3_valueAlongPlane(vector: Readonly<Vector3>, planeNormal: Readonly<Vector3>): number;

    vec3_componentAlongAxis<T extends Vector3>(vector: Readonly<T>, axis: Readonly<Vector3>): T;
    vec3_componentAlongAxis<T extends Vector3>(vector: Readonly<Vector3>, axis: Readonly<Vector3>, out: T): T;

    vec3_removeComponentAlongAxis<T extends Vector3>(vector: Readonly<T>, axis: Readonly<Vector3>): T;
    vec3_removeComponentAlongAxis<T extends Vector3>(vector: Readonly<Vector3>, axis: Readonly<Vector3>, out: T): T;

    vec3_copyComponentAlongAxis<T extends VectorType>(this: Readonly<T>, vector: Readonly<Vector3>, axis: Readonly<Vector3>): T;
    vec3_copyComponentAlongAxis<T extends VectorType, U extends Vector3>(this: Readonly<T>, vector: Readonly<Vector3>, axis: Readonly<Vector3>, out: U): U;


    vec3_isConcordant(first: Readonly<Vector3>, second: Readonly<Vector3>): boolean;

    vec3_isFartherAlongAxis(first: Readonly<Vector3>, second: Readonly<Vector3>, axis: Readonly<Vector3>): boolean;

    vec3_isToTheRight(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>): boolean;

    vec3_signTo(first: Readonly<Vector3>, second: Readonly<Vector3>, referenceAxis: Readonly<Vector3>, zeroSign?: number): number;


    vec3_projectOnAxis<T extends Vector3>(vector: Readonly<T>, axis: Readonly<Vector3>): T;
    vec3_projectOnAxis<T extends Vector3>(vector: Readonly<Vector3>, axis: Readonly<Vector3>, out: T): T;


    vec3_projectOnAxisAlongAxis<T extends Vector3>(vector: Readonly<T>, axis: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>): T;
    vec3_projectOnAxisAlongAxis<T extends Vector3>(vector: Readonly<Vector3>, axis: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>, out: T): T;


    vec3_projectOnPlane<T extends Vector3>(vector: Readonly<T>, planeNormal: Readonly<Vector3>): T;
    vec3_projectOnPlane<T extends Vector3>(vector: Readonly<Vector3>, planeNormal: Readonly<Vector3>, out: T): T;


    vec3_projectOnPlaneAlongAxis<T extends Vector3>(vector: Readonly<T>, planeNormal: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>): T;
    vec3_projectOnPlaneAlongAxis<T extends Vector3>(vector: Readonly<Vector3>, planeNormal: Readonly<Vector3>, projectAlongAxis: Readonly<Vector3>, out: T): T;

    vec3_isOnAxis(vector: Readonly<Vector3>, axis: Readonly<Vector3>): boolean;

    vec3_isOnPlane(vector: Readonly<Vector3>, planeNormal: Readonly<Vector3>): boolean;


    vec3_perpendicularAny<T extends Vector3>(vector: Readonly<T>): T;
    vec3_perpendicularAny<T extends Vector3>(vector: Readonly<Vector3>, out: T): T;


    vec3_rotate<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_rotate<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_rotateDegrees<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_rotateDegrees<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_rotateRadians<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_rotateRadians<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_rotateQuat<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Quaternion>): T;
    vec3_rotateQuat<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Quaternion>, out: T): T;

    vec3_rotateAxis<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>): T;
    vec3_rotateAxis<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, out: T): T;


    vec3_rotateAxisDegrees<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>): T;
    vec3_rotateAxisDegrees<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, out: T): T;

    vec3_rotateAxisRadians<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>): T;
    vec3_rotateAxisRadians<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, out: T): T;


    vec3_rotateAround<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAround<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;

    vec3_rotateAroundDegrees<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundDegrees<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;

    vec3_rotateAroundRadians<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundRadians<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;

    vec3_rotateAroundQuat<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundQuat<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>, out: T): T;

    vec3_rotateAroundAxis<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundAxis<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;


    vec3_rotateAroundAxisDegrees<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundAxisDegrees<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;


    vec3_rotateAroundAxisRadians<T extends Vector3>(vector: Readonly<T>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): T;
    vec3_rotateAroundAxisRadians<T extends Vector3>(vector: Readonly<Vector3>, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>, out: T): T;

    vec3_addRotation<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_addRotation<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_addRotationDegrees<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_addRotationDegrees<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_addRotationRadians<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_addRotationRadians<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_addRotationQuat<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Quaternion>): T;
    vec3_addRotationQuat<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Quaternion>, out: T): T;

    vec3_degreesAddRotation<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_degreesAddRotation<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;

    vec3_degreesAddRotationDegrees<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, out: T): T;
    vec3_degreesAddRotationDegrees<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_degreesAddRotationRadians<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, out: T): T;
    vec3_degreesAddRotationRadians<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_degreesAddRotationQuat<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Quaternion>, out: T): T;
    vec3_degreesAddRotationQuat<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Quaternion>, out: T): T;


    vec3_radiansAddRotation<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>): T;
    vec3_radiansAddRotation<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_radiansAddRotationDegrees<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, out: T): T;
    vec3_radiansAddRotationDegrees<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_radiansAddRotationRadians<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Vector3>, out: T): T;
    vec3_radiansAddRotationRadians<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Vector3>, out: T): T;


    vec3_radiansAddRotationQuat<T extends Vector3>(vector: Readonly<T>, rotation: Readonly<Quaternion>, out: T): T;
    vec3_radiansAddRotationQuat<T extends Vector3>(vector: Readonly<Vector3>, rotation: Readonly<Quaternion>, out: T): T;

    vec3_rotationTo<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>): T;
    vec3_rotationTo<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, out: T): T;


    vec3_rotationToDegrees<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>): T;
    vec3_rotationToDegrees<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, out: T): T;


    vec3_rotationToRadians<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>): T;
    vec3_rotationToRadians<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, out: T): T;


    vec3_rotationToQuat(from: Readonly<Vector3>, to: Readonly<Vector3>): Quaternion;
    vec3_rotationToQuat<T extends Quaternion>(from: Readonly<Vector3>, to: Readonly<Vector3>, out: T): T;


    vec3_rotationToPivoted<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>): T;
    vec3_rotationToPivoted<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T): T;


    vec3_rotationToPivotedDegrees<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>): T;
    vec3_rotationToPivotedDegrees<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T): T;

    vec3_rotationToPivotedRadians<T extends Vector3>(from: Readonly<T>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>): T;
    vec3_rotationToPivotedRadians<T extends Vector3>(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T): T;


    vec3_rotationToPivotedQuat(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>): Quaternion;
    vec3_rotationToPivotedQuat<T extends Quaternion>(from: Readonly<Vector3>, to: Readonly<Vector3>, pivotAxis: Readonly<Vector3>, out: T): T;

    vec3_convertPositionToWorld<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertPositionToWorld<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;

    vec3_convertPositionToLocal<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertPositionToLocal<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;

    vec3_convertPositionToWorldMatrix<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertPositionToWorldMatrix<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertPositionToLocalMatrix<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertPositionToLocalMatrix<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertPositionToWorldQuat<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Quaternion>): T;
    vec3_convertPositionToWorldQuat<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Quaternion>, out: T): T;


    vec3_convertPositionToLocalQuat<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Quaternion>): T;
    vec3_convertPositionToLocalQuat<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Quaternion>, out: T): T;


    vec3_convertDirectionToWorld<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertDirectionToWorld<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertDirectionToLocal<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertDirectionToLocal<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertDirectionToWorldMatrix<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertDirectionToWorldMatrix<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertDirectionToLocalMatrix<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Matrix4>): T;
    vec3_convertDirectionToLocalMatrix<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Matrix4>, out: T): T;


    vec3_convertDirectionToWorldQuat<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Quaternion>): T;
    vec3_convertDirectionToWorldQuat<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Quaternion>, out: T): T;


    vec3_convertDirectionToLocalQuat<T extends Vector3>(vector: Readonly<T>, parentTransform: Readonly<Quaternion>): T;
    vec3_convertDirectionToLocalQuat<T extends Vector3>(vector: Readonly<Vector3>, parentTransform: Readonly<Quaternion>, out: T): T;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends Vector3Extension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends Vector3Extension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends Vector3Extension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends Vector3Extension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends Vector3Extension<Uint32Array> { }
}

declare global {
    interface Int8Array extends Vector3Extension<Int8Array> { }
}

declare global {
    interface Int16Array extends Vector3Extension<Int16Array> { }
}

declare global {
    interface Int32Array extends Vector3Extension<Int32Array> { }
}

declare global {
    interface Float32Array extends Vector3Extension<Float32Array> { }
}

declare global {
    interface Float64Array extends Vector3Extension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends Vector3Extension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends Vector3Extension<DynamicArrayLike<number>> { }

    interface Vector extends Vector3Extension<Vector> { }

    interface Vector2 extends Vector3Extension<Vector2> { }

    interface Vector3 extends Vector3Extension<Vector3> { }

    interface Vector4 extends Vector3Extension<Vector4> { }

    interface Quaternion extends Vector3Extension<Quaternion> { }

    interface Quaternion2 extends Vector3Extension<Quaternion2> { }

    interface Matrix2 extends Vector3Extension<Matrix2> { }

    interface Matrix3 extends Vector3Extension<Matrix3> { }

    interface Matrix4 extends Vector3Extension<Matrix4> { }
}