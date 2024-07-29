import { mat3 as gl_mat3, mat4 as gl_mat4, quat as gl_quat, quat2 as gl_quat2, vec2 as gl_vec2, vec3 as gl_vec3, vec4 as gl_vec4, glMatrix } from "gl-matrix";
import { Matrix3, Matrix4, Quaternion, Quaternion2, Vector, Vector2, Vector3, Vector4 } from "../../type_definitions/array_type_definitions.js";

export let _myVectorCreateFunction: (length: number) => Vector = () => { return new glMatrix.ARRAY_TYPE(length); };

export function setVectorCreateFunction(createFunction: (length: number) => Vector): void {
    _myVectorCreateFunction = createFunction;
}

export function getVectorCreateFunction(): (length: number) => Vector {
    return _myVectorCreateFunction;
}



export let _myVector2CreateFunction: () => Vector2 = gl_vec2.create;

export function setVector2CreateFunction(createFunction: () => Vector2): void {
    _myVector2CreateFunction = createFunction;
}

export function getVector2CreateFunction(): () => Vector2 {
    return _myVector2CreateFunction;
}



export let _myVector3CreateFunction: () => Vector3 = gl_vec3.create;

export function setVector3CreateFunction(createFunction: () => Vector3): void {
    _myVector3CreateFunction = createFunction;
}

export function getVector3CreateFunction(): () => Vector3 {
    return _myVector3CreateFunction;
}



export let _myVector4CreateFunction: () => Vector4 = gl_vec4.create;

export function setVector4CreateFunction(createFunction: () => Vector4): void {
    _myVector4CreateFunction = createFunction;
}

export function getVector4CreateFunction(): () => Vector4 {
    return _myVector4CreateFunction;
}



export let _myQuaternionCreateFunction: () => Quaternion = gl_quat.create;

export function setQuaternionCreateFunction(createFunction: () => Quaternion): void {
    _myQuaternionCreateFunction = createFunction;
}

export function getQuaternionCreateFunction(): () => Quaternion {
    return _myQuaternionCreateFunction;
}



export let _myQuaternion2CreateFunction: () => Quaternion2 = gl_quat2.create;

export function setQuaternion2CreateFunction(createFunction: () => Quaternion2): void {
    _myQuaternion2CreateFunction = createFunction;
}

export function getQuaternion2CreateFunction(): () => Quaternion2 {
    return _myQuaternion2CreateFunction;
}



export let _myMatrix3CreateFunction: () => Matrix3 = gl_mat3.create;

export function setMatrix3CreateFunction(createFunction: () => Matrix3): void {
    _myMatrix3CreateFunction = createFunction;
}

export function getMatrix3CreateFunction(): () => Matrix3 {
    return _myMatrix3CreateFunction;
}



export let _myMatrix4CreateFunction: () => Matrix4 = gl_mat4.create;

export function setMatrix4CreateFunction(createFunction: () => Matrix4): void {
    _myMatrix4CreateFunction = createFunction;
}

export function getMatrix4CreateFunction(): () => Matrix4 {
    return _myMatrix4CreateFunction;
}