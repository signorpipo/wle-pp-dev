import { type NumberArray } from "@wonderlandengine/api";

export type Vector<__T extends number = number> = NumberArray;

export type Vector2 = Vector<2>;
export type Vector3 = Vector<3>;
export type Vector4 = Vector<4>;

export type Quaternion = Vector<4>;
export type Quaternion2 = Vector<8>;

export type Matrix2 = Vector<4>;
export type Matrix3 = Vector<9>;
export type Matrix4 = Vector<16>;