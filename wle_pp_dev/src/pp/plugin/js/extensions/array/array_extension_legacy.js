/*
 * How to use
 * 
 * #WARN The extension is a WIP so not all the functions are available for all kinds of vector.
 * 
 * By default rotations are in Degrees and transforms are Matrix 4 (and not Quat 2)    
 * For functions that work with rotations, Matrix means Matrix 3 and Quat means Quat
 * For functions that work with transforms, Matrix means Matrix 4 and Quat means Quat 2
 * 
 * For rotations u can add a suffix like Degrees/Radians/Quat/Matrix to use a specific version, example:
 *     - vec3_rotateAroundRadians
 *     - vec3_degreesAddRotationDegrees
 *     
 * For transform u can add a suffix like Quat/Matrix to use a specific version, example:
 *     - vec3_convertPositionToWorldMatrix
 *     - vec3_convertDirectionToWorldQuat
 * 
 * Some vec3 functions let u add a prefix to specify if the vec3 represent a rotation in degrees or radians, where degrees is the default:
 *     - vec3_toQuat
 *     - vec3_degreesToQuat
 *     - vec3_radiansToQuat
 *     - vec3_degreesAddRotation
 * 
 * Rotation operations return a rotation of the same kind of the starting variable:
 *     - vec3_degreesAddRotationQuat   -> returns a rotation in degrees
 *     - quat_addRotationDegrees       -> returns a rotation in quat
 * 
 * The functions leave u the choice of forwarding an out parameter or just get the return value, example:
 *     - let quat = this.vec3_toQuat()
 *     - this.vec3_toQuat(quat)
 *     - the out parameter is always the last one
 * 
 * List of functions:
 *     Notes:
 *         - If a group of functions starts with ○ it means it modifies the variable itself
 *         - The suffixes (like Matrix or Radians) or prefixes (like degrees) are omitted 
 * 
 *     CREATION (u can call these functions without any object):
 *         - vec2_create
 *         - vec3_create
 *         - vec4_create
 *         - quat_create
 *         - quat2_create
 *         - mat3_create
 *         - mat4_create    
 * 
 *     GENERIC VECTOR (array with only numbers):
 *         ° vec_zero
 *         - vec_isZero
 *         - vec_scale
 *         - vec_round     / vec_floor         / vec_ceil      / vec_clamp
 *         - vec_log       / vec_error         / vec_warn   
 *         - vec_equals   
 * 
 *     VECTOR 2:
 *         ○ vec2_set      / vec2_copy     / vec2_zero
 *         - vec2_clone 
 *         - vec2_normalize
 *         - vec2_length
 *         - vec2_isZero
 * 
 *     VECTOR 3:
 *         ○ vec3_set      / vec3_copy     / vec3_zero
 *         - vec3_clone 
 *         - vec3_normalize    / vec3_negate
 *         - vec3_isNormalized / vec3_isZero
 *         - vec3_length       / vec3_lengthSquared        / vec3_lengthSigned
 *         - vec3_distance     / vec3_distanceSquared
 *         - vec3_add              / vec3_sub              / vec3_mul      / vec3_div      / vec3_scale    / vec3_dot
 *         - vec3_equals
 *         - vec3_transformQuat    / vec3_transformMat3    / vec3_transformMat4
 *         - vec3_componentAlongAxis           / vec3_removeComponentAlongAxis / vec3_copyComponentAlongAxis   / vec3_valueAlongAxis  
 *         - vec3_isConcordant
 *         - vec3_isFartherAlongAxis
 *         - vec3_isToTheRight
 *         - vec3_isOnAxis
 *         - vec3_isOnPlane
 *         - vec3_signTo
 *         - vec3_projectOnAxis                / vec3_projectOnAxisAlongAxis
 *         - vec3_projectOnPlane               / vec3_projectOnPlaneAlongAxis
 *         - vec3_convertPositionToWorld       / vec3_convertPositionToLocal 
 *         - vec3_convertDirectionToWorld      / vec3_convertDirectionToLocal   
 *         - vec3_angle            / vec3_angleSigned          / vec3_anglePivoted
 *         - vec3_rotate           / vec3_rotateAxis           / vec3_rotateAround / vec3_rotateAroundAxis
 *         - vec3_rotationTo       / vec3_rotationToPivoted
 *         - vec3_toRadians        / vec3_toDegrees            / vec3_toQuat       / vec3_toMatrix
 *         - vec3_addRotation  
 *         - vec3_lerp      / vec3_interpolate 
 *         - vec3_perpendicularAny 
 *         
 *     VECTOR 4:
 *         ○ vec4_set      / vec4_copy
 *         - vec4_clone 
 * 
 *     QUAT:
 *         ○ quat_set          / quat_copy     / quat_identity
 *         - quat_clone 
 *         - quat_normalize    / quat_invert   / quat_conjugate
 *         - quat_isNormalized
 *         - quat_length       / quat_lengthSquared
 *         - quat_mul
 *         - quat_getAxis          / quat_getAngle         / quat_getAxisScaled
 *         - quat_getAxes          / quat_getRight         / quat_getUp    / quat_getForward   / quat_getLeft  / quat_getDown  / quat_getBackward
 *         ○ quat_setAxes          / quat_setRight         / quat_setUp    / quat_setForward   / quat_setLeft  / quat_setDown  / quat_setBackward
 *         - quat_toWorld          / quat_toLocal
 *         - quat_rotate           / quat_rotateAxis  
 *         - quat_rotationTo     
 *         - quat_rotationAroundAxis    
 *         - quat_getTwist         / quat_getSwing         / quat_getTwistFromSwing    / quat_getSwingFromTwist    / quat_fromTwistSwing
 *         ○ quat_fromRadians      / quat_fromDegrees      / quat_fromAxis / quat_fromAxes
 *         - quat_toRadians        / quat_toDegrees        / quat_toMatrix
 *         - quat_addRotation      / quat_subRotation
 *         - quat_lerp             / quat_interpolate      / quat_slerp    / quat_interpolateSpherical
 * 
 *     QUAT 2:
 *         ○ quat2_set             / quat2_copy        / quat2_identity
 *         - quat2_normalize       / quat2_invert      / quat2_conjugate
 *         - quat2_isNormalized
 *         - quat2_length          / quat2_lengthSquared
 *         - quat2_mul
 *         - quat2_getPosition     / quat2_getRotation
 *         ○ quat2_setPosition     / quat2_setRotation     / quat2_setPositionRotation
 *         - quat2_getAxes     / quat2_getRight    / quat2_getUp   / quat2_getForward  / quat2_getLeft    / quat2_getDown   / quat2_getBackward
 *         - quat2_toWorld     / quat2_toLocal
 *         - quat2_rotateAxis  
 *         - quat2_toMatrix
 *         ○ quat2_fromMatrix
 *         - quat2_lerp        / quat2_interpolate / quat2_slerp    / quat2_interpolateSpherical
 * 
 *     MATRIX 3:
 *         ○ mat3_set
 *         - mat3_toDegrees    / mat3_toRadians    / mat3_toQuat
 *         - mat3_fromAxes
 * 
 *     MATRIX 4:
 *         ○ mat4_set          / mat4_copy         / mat4_identity
 *         - mat4_clone
 *         - mat4_invert
 *         - mat_mul           / mat4_scale
 *         - mat4_getPosition  / mat4_getRotation  / mat4_getScale
 *         ○ mat4_setPosition  / mat4_setRotation  / mat4_setScale
 *         ○ mat4_setPositionRotation      / mat4_setPositionRotationScale
 *         - mat4_getAxes     / mat4_getRight    / mat4_getUp   / mat4_getForward  / mat4_getLeft    / mat4_getDown   / mat4_getBackward
 *         - mat4_toWorld      / mat4_toLocal
 *         - mat4_hasUniformScale
 *         - mat4_toQuat
 *         ○ mat4_fromQuat
 */

import { Mat3Utils } from "../../../../cauldron/utils/array/mat3_utils.js";
import { QuatUtils } from "../../../../cauldron/utils/array/quat_utils.js";
import { Vec3Utils } from "../../../../cauldron/utils/array/vec3_utils.js";
import { EasingFunction, MathUtils } from "../../../../cauldron/utils/math_utils.js";
import { PluginUtils } from "../../../utils/plugin_utils.js";

export function initArrayExtensionLegacy() {
    _initArrayExtensionLegacyProtoype();
}

export function _initArrayExtensionLegacyProtoype() {

    // VECTOR 3

    let vec3Extension = {};

    vec3Extension.vec3_set = function vec3_set(x, y, z) {
        return Vec3Utils.set(this, x, y, z);
    };

    vec3Extension.vec3_normalize = function vec3_normalize(out = Vec3Utils.create()) {
        return Vec3Utils.normalize(this, out);
    };
    vec3Extension.vec3_copy = function vec3_copy(vector) {
        return Vec3Utils.copy(vector, this);
    };

    vec3Extension.vec3_clone = function vec3_clone(out = Vec3Utils.create()) {
        return Vec3Utils.clone(this, out);
    };

    vec3Extension.vec3_zero = function vec3_zero() {
        return Vec3Utils.zero(this);
    };

    vec3Extension.vec3_angle = function vec3_angle(vector) {
        return Vec3Utils.angle(this, vector);
    };

    vec3Extension.vec3_angleDegrees = function vec3_angleDegrees(vector) {
        return Vec3Utils.angleDegrees(this, vector);
    };

    vec3Extension.vec3_angleRadians = function vec3_angleRadians(vector) {
        return Vec3Utils.angleRadians(this, vector);
    };

    vec3Extension.vec3_equals = function vec3_equals(vector, epsilon = 0) {
        return Vec3Utils.equals(this, vector, epsilon);
    };

    vec3Extension.vec3_length = function vec3_length() {
        return Vec3Utils.length(this);
    };

    vec3Extension.vec3_lengthSquared = function vec3_lengthSquared() {
        return Vec3Utils.lengthSquared(this);
    };

    vec3Extension.vec3_distance = function vec3_distance(vector) {
        return Vec3Utils.distance(this, vector);
    };

    vec3Extension.vec3_distanceSquared = function vec3_distanceSquared(vector) {
        return Vec3Utils.distanceSquared(this, vector);
    };

    vec3Extension.vec3_add = function vec3_add(vector, out = Vec3Utils.create()) {
        return Vec3Utils.add(this, vector, out);
    };

    vec3Extension.vec3_sub = function vec3_sub(vector, out = Vec3Utils.create()) {
        return Vec3Utils.sub(this, vector, out);
    };

    vec3Extension.vec3_mul = function vec3_mul(vector, out = Vec3Utils.create()) {
        return Vec3Utils.mul(this, vector, out);
    };

    vec3Extension.vec3_div = function vec3_div(vector, out = Vec3Utils.create()) {
        return Vec3Utils.div(this, vector, out);
    };

    vec3Extension.vec3_scale = function vec3_scale(value, out = Vec3Utils.create()) {
        return Vec3Utils.scale(this, value, out);
    };

    vec3Extension.vec3_dot = function vec3_dot(vector) {
        return Vec3Utils.dot(this, vector);
    };

    vec3Extension.vec3_negate = function vec3_negate(out = Vec3Utils.create()) {
        return Vec3Utils.negate(this, out);
    };

    vec3Extension.vec3_cross = function vec3_cross(vector, out = Vec3Utils.create()) {
        return Vec3Utils.cross(this, vector, out);
    };

    vec3Extension.vec3_transformQuat = function vec3_transformQuat(quat, out = Vec3Utils.create()) {
        return Vec3Utils.transformQuat(this, quat, out);
    };

    vec3Extension.vec3_transformMat3 = function vec3_transformMat3(matrix, out = Vec3Utils.create()) {
        return Vec3Utils.transformMat3(this, matrix, out);
    };

    vec3Extension.vec3_transformMat4 = function vec3_transformMat4(matrix, out = Vec3Utils.create()) {
        return Vec3Utils.transformMat4(this, matrix, out);
    };

    vec3Extension.vec3_lengthSigned = function vec3_lengthSigned(positiveDirection) {
        return Vec3Utils.lengthSigned(this, positiveDirection);
    };

    vec3Extension.vec3_angleSigned = function vec3_angleSigned(vector, referenceAxis) {
        return Vec3Utils.angleSigned(this, vector, referenceAxis);
    };

    vec3Extension.vec3_angleSignedDegrees = function vec3_angleSignedDegrees(vector, referenceAxis) {
        return Vec3Utils.angleSignedDegrees(this, vector, referenceAxis);
    };

    vec3Extension.vec3_angleSignedRadians = function vec3_angleSignedRadians(vector, referenceAxis) {
        return Vec3Utils.angleSignedRadians(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivoted = function vec3_anglePivoted(vector, referenceAxis) {
        return Vec3Utils.anglePivoted(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivotedDegrees = function vec3_anglePivotedDegrees(vector, referenceAxis) {
        return Vec3Utils.anglePivotedDegrees(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivotedRadians = function vec3_anglePivotedRadians(vector, referenceAxis) {
        return Vec3Utils.anglePivotedRadians(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivotedSigned = function vec3_anglePivotedSigned(vector, referenceAxis) {
        return Vec3Utils.anglePivotedSigned(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivotedSignedDegrees = function vec3_anglePivotedSignedDegrees(vector, referenceAxis) {
        return Vec3Utils.anglePivotedSignedDegrees(this, vector, referenceAxis);
    };

    vec3Extension.vec3_anglePivotedSignedRadians = function vec3_anglePivotedSignedRadians(vector, referenceAxis) {
        return Vec3Utils.anglePivotedSignedRadians(this, vector, referenceAxis);
    };

    vec3Extension.vec3_toRadians = function vec3_toRadians(out = Vec3Utils.create()) {
        return Vec3Utils.toRadians(this, out);
    };

    vec3Extension.vec3_toDegrees = function vec3_toDegrees(out = Vec3Utils.create()) {
        return Vec3Utils.toDegrees(this, out);
    };

    vec3Extension.vec3_toQuat = function vec3_toQuat(out) {
        return Vec3Utils.toQuat(this, out);
    };

    vec3Extension.vec3_radiansToQuat = function vec3_radiansToQuat(out = QuatUtils.create()) {
        return Vec3Utils.radiansToQuat(this, out);
    };

    vec3Extension.vec3_degreesToQuat = function vec3_degreesToQuat(out = QuatUtils.create()) {
        return Vec3Utils.degreesToQuat(this, out);
    };

    vec3Extension.vec3_isNormalized = function vec3_isNormalized(epsilon = MathUtils.EPSILON) {
        return Vec3Utils.isNormalized(this, epsilon);
    };

    vec3Extension.vec3_isZero = function vec3_isZero(epsilon = 0) {
        return Vec3Utils.isZero(this, epsilon);
    };

    vec3Extension.vec3_valueAlongAxis = function vec3_valueAlongAxis(axis) {
        return Vec3Utils.valueAlongAxis(this, axis);
    };

    vec3Extension.vec3_valueAlongPlane = function vec3_valueAlongPlane(planeNormal) {
        return Vec3Utils.valueAlongPlane(this, planeNormal);
    };

    vec3Extension.vec3_componentAlongAxis = function vec3_componentAlongAxis(axis, out = Vec3Utils.create()) {
        return Vec3Utils.componentAlongAxis(this, axis, out);
    };

    vec3Extension.vec3_removeComponentAlongAxis = function vec3_removeComponentAlongAxis(axis, out = Vec3Utils.create()) {
        return Vec3Utils.removeComponentAlongAxis(this, axis, out);
    };

    vec3Extension.vec3_copyComponentAlongAxis = function vec3_copyComponentAlongAxis(vector, axis, out = Vec3Utils.create()) {
        return Vec3Utils.copyComponentAlongAxis(vector, this, axis, out);
    };

    vec3Extension.vec3_isConcordant = function vec3_isConcordant(vector) {
        return Vec3Utils.isConcordant(this, vector);
    };

    vec3Extension.vec3_isFartherAlongAxis = function vec3_isFartherAlongAxis(vector, axis) {
        return Vec3Utils.isFartherAlongAxis(this, vector, axis);
    };

    vec3Extension.vec3_isToTheRight = function vec3_isToTheRight(vector, referenceAxis) {
        return Vec3Utils.isToTheRight(this, vector, referenceAxis);
    };

    vec3Extension.vec3_signTo = function vec3_signTo(vector, referenceAxis, zeroSign = 1) {
        return Vec3Utils.signTo(this, vector, referenceAxis, zeroSign);
    };

    vec3Extension.vec3_projectOnAxis = function vec3_projectOnAxis(axis, out = Vec3Utils.create()) {
        return Vec3Utils.projectOnAxis(this, axis, out);
    };

    vec3Extension.vec3_projectOnAxisAlongAxis = function vec3_projectOnAxisAlongAxis(axis, projectAlongAxis, out = Vec3Utils.create()) {
        return Vec3Utils.projectOnAxisAlongAxis(this, axis, projectAlongAxis, out);
    };

    vec3Extension.vec3_projectOnPlane = function vec3_projectOnPlane(planeNormal, out = Vec3Utils.create()) {
        return Vec3Utils.projectOnPlane(this, planeNormal, out);
    };

    vec3Extension.vec3_projectOnPlaneAlongAxis = function vec3_projectOnPlaneAlongAxis(planeNormal, projectAlongAxis, out = Vec3Utils.create()) {
        return Vec3Utils.projectOnPlaneAlongAxis(this, planeNormal, projectAlongAxis, out);
    };

    vec3Extension.vec3_isOnAxis = function vec3_isOnAxis(axis) {
        return Vec3Utils.isOnAxis(this, axis);
    };

    vec3Extension.vec3_isOnPlane = function vec3_isOnPlane(planeNormal) {
        return Vec3Utils.isOnPlane(this, planeNormal);
    };

    vec3Extension.vec3_rotate = function vec3_rotate(rotation, out) {
        return Vec3Utils.rotate(this, rotation, out);
    };

    vec3Extension.vec3_rotateDegrees = function vec3_rotateDegrees(rotation, out) {
        return Vec3Utils.rotateDegrees(this, rotation, out);
    };

    vec3Extension.vec3_rotateRadians = function vec3_rotateRadians(rotation, out) {
        return Vec3Utils.rotateRadians(this, rotation, out);
    };

    vec3Extension.vec3_rotateQuat = function vec3_rotateQuat(rotation, out) {
        return Vec3Utils.rotateQuat(this, rotation, out);
    };

    vec3Extension.vec3_rotateAxis = function vec3_rotateAxis(angle, axis, out) {
        return Vec3Utils.rotateAxis(this, angle, axis, out);
    };

    vec3Extension.vec3_rotateAxisDegrees = function vec3_rotateAxisDegrees(angle, axis, out) {
        return Vec3Utils.rotateAxisDegrees(this, angle, axis, out);
    };

    vec3Extension.vec3_rotateAxisRadians = function vec3_rotateAxisRadians(angle, axis, out) {
        return Vec3Utils.rotateAxisRadians(this, angle, axis, out);
    };

    vec3Extension.vec3_rotateAround = function vec3_rotateAround(rotation, origin, out) {
        return Vec3Utils.rotateAround(this, rotation, origin, out);
    };

    vec3Extension.vec3_rotateAroundDegrees = function vec3_rotateAroundDegrees(rotation, origin, out = Vec3Utils.create()) {
        return Vec3Utils.rotateAroundDegrees(this, rotation, origin, out);
    };

    vec3Extension.vec3_rotateAroundRadians = function vec3_rotateAroundRadians(rotation, origin, out = Vec3Utils.create()) {
        return Vec3Utils.rotateAroundRadians(this, rotation, origin, out);
    };

    vec3Extension.vec3_rotateAroundQuat = function vec3_rotateAroundQuat(rotation, origin, out = Vec3Utils.create()) {
        return Vec3Utils.rotateAroundQuat(this, rotation, origin, out);
    };

    vec3Extension.vec3_rotateAroundAxis = function vec3_rotateAroundAxis(angle, axis, origin, out) {
        return Vec3Utils.rotateAroundAxis(this, angle, axis, origin, out);
    };

    vec3Extension.vec3_rotateAroundAxisDegrees = function vec3_rotateAroundAxisDegrees(angle, axis, origin, out) {
        return Vec3Utils.rotateAroundAxisDegrees(this, angle, axis, origin, out);
    };

    vec3Extension.vec3_rotateAroundAxisRadians = function vec3_rotateAroundAxisRadians(angle, axis, origin, out = Vec3Utils.create()) {
        return Vec3Utils.rotateAroundAxisRadians(this, angle, axis, origin, out);
    };

    vec3Extension.vec3_convertPositionToWorld = function vec3_convertPositionToWorld(parentTransform, out) {
        return Vec3Utils.convertPositionToWorld(this, parentTransform, out);
    };

    vec3Extension.vec3_convertPositionToLocal = function vec3_convertPositionToLocal(parentTransform, out) {
        return Vec3Utils.convertPositionToLocal(this, parentTransform, out);
    };

    vec3Extension.vec3_convertPositionToWorldMatrix = function vec3_convertPositionToWorldMatrix(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertPositionToWorldMatrix(this, parentTransform, out);
    };

    vec3Extension.vec3_convertPositionToLocalMatrix = function vec3_convertPositionToLocalMatrix(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertPositionToLocalMatrix(this, parentTransform, out);
    };

    vec3Extension.vec3_convertPositionToWorldQuat = function vec3_convertPositionToWorldQuat(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertPositionToWorldQuat(this, parentTransform, out);
    };

    vec3Extension.vec3_convertPositionToLocalQuat = function vec3_convertPositionToLocalQuat(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertPositionToLocalQuat(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToWorld = function vec3_convertDirectionToWorld(parentTransform, out) {
        return Vec3Utils.convertDirectionToWorld(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToLocal = function vec3_convertDirectionToLocal(parentTransform, out) {
        return Vec3Utils.convertDirectionToLocal(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToWorldMatrix = function vec3_convertDirectionToWorldMatrix(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertDirectionToWorldMatrix(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToLocalMatrix = function vec3_convertDirectionToLocalMatrix(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertDirectionToLocalMatrix(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToWorldQuat = function vec3_convertDirectionToWorldQuat(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertDirectionToWorldQuat(this, parentTransform, out);
    };

    vec3Extension.vec3_convertDirectionToLocalQuat = function vec3_convertDirectionToLocalQuat(parentTransform, out = Vec3Utils.create()) {
        return Vec3Utils.convertDirectionToLocalQuat(this, parentTransform, out);
    };

    vec3Extension.vec3_addRotation = function vec3_addRotation(rotation, out) {
        return Vec3Utils.addRotation(this, rotation, out);
    };

    vec3Extension.vec3_addRotationDegrees = function vec3_addRotationDegrees(rotation, out) {
        return Vec3Utils.addRotationDegrees(this, rotation, out);
    };

    vec3Extension.vec3_addRotationRadians = function vec3_addRotationRadians(rotation, out) {
        return Vec3Utils.addRotationRadians(this, rotation, out);
    };

    vec3Extension.vec3_addRotationQuat = function vec3_addRotationQuat(rotation, out) {
        return Vec3Utils.addRotationQuat(this, rotation, out);
    };

    vec3Extension.vec3_degreesAddRotation = function vec3_degreesAddRotation(rotation, out) {
        return Vec3Utils.degreesAddRotation(this, rotation, out);
    };

    vec3Extension.vec3_degreesAddRotationDegrees = function vec3_degreesAddRotationDegrees(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.degreesAddRotationDegrees(this, rotation, out);
    };

    vec3Extension.vec3_degreesAddRotationRadians = function vec3_degreesAddRotationRadians(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.degreesAddRotationRadians(this, rotation, out);
    };

    vec3Extension.vec3_degreesAddRotationQuat = function vec3_degreesAddRotationQuat(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.degreesAddRotationQuat(this, rotation, out);
    };

    vec3Extension.vec3_radiansAddRotation = function vec3_radiansAddRotation(rotation, out) {
        return Vec3Utils.radiansAddRotation(this, rotation, out);
    };

    vec3Extension.vec3_radiansAddRotationDegrees = function vec3_radiansAddRotationDegrees(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.radiansAddRotationDegrees(this, rotation, out);
    };

    vec3Extension.vec3_radiansAddRotationRadians = function vec3_radiansAddRotationRadians(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.radiansAddRotationRadians(this, rotation, out);
    };

    vec3Extension.vec3_radiansAddRotationQuat = function vec3_radiansAddRotationQuat(rotation, out = Vec3Utils.create()) {
        return Vec3Utils.radiansAddRotationQuat(this, rotation, out);
    };

    vec3Extension.vec3_toMatrix = function vec3_toMatrix(out = Mat3Utils.create()) {
        return Vec3Utils.toMatrix(this, out);
    };

    vec3Extension.vec3_degreesToMatrix = function vec3_degreesToMatrix(out = Mat3Utils.create()) {
        return Vec3Utils.degreesToMatrix(this, out);
    };

    vec3Extension.vec3_radiansToMatrix = function vec3_radiansToMatrix(out = Mat3Utils.create()) {
        return Vec3Utils.radiansToMatrix(this, out);
    };

    vec3Extension.vec3_rotationTo = function vec3_rotationTo(to, out) {
        return Vec3Utils.rotationTo(this, to, out);
    };

    vec3Extension.vec3_rotationToDegrees = function vec3_rotationToDegrees(to, out = Vec3Utils.create()) {
        return Vec3Utils.rotationToDegrees(this, to, out);
    };

    vec3Extension.vec3_rotationToRadians = function vec3_rotationToRadians(to, out = Vec3Utils.create()) {
        return Vec3Utils.rotationToRadians(this, to, out);
    };

    vec3Extension.vec3_rotationToQuat = function vec3_rotationToQuat(to, out = QuatUtils.create()) {
        return Vec3Utils.rotationToQuat(this, to, out);
    };

    vec3Extension.vec3_rotationToPivoted = function vec3_rotationToPivoted(to, pivotAxis, out) {
        return Vec3Utils.rotationToPivoted(this, to, pivotAxis, out);
    };

    vec3Extension.vec3_rotationToPivotedDegrees = function vec3_rotationToPivotedDegrees(to, pivotAxis, out = Vec3Utils.create()) {
        return Vec3Utils.rotationToPivotedDegrees(this, to, pivotAxis, out);
    };

    vec3Extension.vec3_rotationToPivotedRadians = function vec3_rotationToPivotedRadians(to, pivotAxis, out = Vec3Utils.create()) {
        return Vec3Utils.rotationToPivotedRadians(this, to, pivotAxis, out);
    };

    vec3Extension.vec3_rotationToPivotedQuat = function vec3_rotationToPivotedQuat(to, pivotAxis, out = QuatUtils.create()) {
        return Vec3Utils.rotationToPivotedQuat(this, to, pivotAxis, out);
    };

    vec3Extension.vec3_lerp = function vec3_lerp(to, interpolationFactor, out = Vec3Utils.create()) {
        return Vec3Utils.lerp(this, to, interpolationFactor, out);
    };

    vec3Extension.vec3_interpolate = function vec3_interpolate(to, interpolationFactor, easingFunction = EasingFunction.linear, out = Vec3Utils.create()) {
        return Vec3Utils.interpolate(this, to, interpolationFactor, easingFunction, out);
    };

    vec3Extension.vec3_perpendicularAny = function vec3_perpendicularAny(out = Vec3Utils.create()) {
        return Vec3Utils.perpendicularAny(this, out);
    };

    let arrayPrototypesToExtend = [
        Array.prototype, Uint8ClampedArray.prototype, Uint8Array.prototype, Uint16Array.prototype, Uint32Array.prototype, Int8Array.prototype,
        Int16Array.prototype, Int32Array.prototype, Float32Array.prototype, Float64Array.prototype];

    for (let arrayPrototypeToExtend of arrayPrototypesToExtend) {
        PluginUtils.injectOwnProperties(vec3Extension, arrayPrototypeToExtend, false, true, true);
    }
}