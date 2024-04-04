/**
 *  How to use
 * 
 *  Warning: The extension is a WIP so not all the functions are available for all kinds of vector.
 * 
 *  By default rotations are in Degrees and transforms are Matrix 4 (and not Quat 2)    
 *  For functions that work with rotations, Matrix means Matrix 3 and Quat means Quat
 *  For functions that work with transforms, Matrix means Matrix 4 and Quat means Quat 2
 *  
 *  For rotations u can add a suffix like Degrees/Radians/Quat/Matrix to use a specific version, example:
 *      - vec3_rotateAroundRadians
 *      - vec3_degreesAddRotationDegrees
 *      
 *  For transform u can add a suffix like Quat/Matrix to use a specific version, example:
 *      - vec3_convertPositionToWorldMatrix
 *      - vec3_convertDirectionToWorldQuat
 * 
 *  Some vec3 functions let u add a prefix to specify if the vec3 represent a rotation in degrees or radians, where degrees is the default:
 *      - vec3_toQuat
 *      - vec3_degreesToQuat
 *      - vec3_radiansToQuat
 *      - vec3_degreesAddRotation
 * 
 *  Rotation operations return a rotation of the same kind of the starting variable:
 *      - vec3_degreesAddRotationQuat   -> returns a rotation in degrees
 *      - quat_addRotationDegrees       -> returns a rotation in quat
 * 
 *  The functions leave u the choice of forwarding an out parameter or just get the return value, example:
 *      - let quat = this.vec3_toQuat()
 *      - this.vec3_toQuat(quat)
 *      - the out parameter is always the last one
*/