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