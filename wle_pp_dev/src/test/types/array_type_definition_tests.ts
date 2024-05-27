import { type NumberArray } from "@wonderlandengine/api";
import { first } from "wle-pp/cauldron/utils/array/array_utils.js";
import { ArrayLike, DynamicArrayLike, Vector3 } from "../../pp/cauldron/type_definitions/array_type_definitions.js";

function __test(): void {
    const numberArray = [0];
    const stringArray = ["bah"];
    const float32 = new Float32Array(3);

    const arrayLikeFromArray: ArrayLike<number> = [0];
    const dynamicArrayLikeFromArray: DynamicArrayLike<number> = [0];
    const arrayLikeFromFloat32: ArrayLike<number> = new Float32Array(3);
    const vector3FromArray: Vector3 = [0];
    const vector3FromFloat32: Vector3 = new Float32Array(3);
    const numberArrayFromVector3: NumberArray = vector3FromFloat32;
    //const arrayFromVector3: number[] = vector3FromArray;

    arrayLikeFromArray.at(0);
    vector3FromArray.at(0);
    dynamicArrayLikeFromArray.at(0);

    arrayLikeFromArray.indexOf(0);
    vector3FromArray.indexOf(0);

    first(numberArray);
    numberArray.pp_first();
    vector3FromArray.pp_first();
    arrayLikeFromFloat32.pp_first();
    numberArrayFromVector3.pp_first();

    vector3FromArray.pp_equals(numberArray);
    vector3FromArray.pp_equals(float32);
    vector3FromArray.pp_equals(arrayLikeFromFloat32);
    vector3FromArray.pp_equals(arrayLikeFromArray);
    vector3FromArray.pp_equals(vector3FromArray);
    vector3FromArray.pp_equals(vector3FromFloat32);
    vector3FromArray.pp_equals(dynamicArrayLikeFromArray);

    // vector3FromArray.pp_equals(stringArray);

    vector3FromArray.vec_equals(numberArray);
    vector3FromArray.vec_equals(float32);
    vector3FromArray.vec_equals(arrayLikeFromFloat32);
    vector3FromArray.vec_equals(arrayLikeFromArray);
    vector3FromArray.vec_equals(vector3FromArray);
    vector3FromArray.vec_equals(vector3FromFloat32);
    vector3FromArray.vec_equals(dynamicArrayLikeFromArray);

    vector3FromArray.pp_clone();
    vector3FromArray.vec_clone();

    // vector3FromArray.vec_equals(stringArray);

    numberArrayFromVector3.vec_clone();

    dynamicArrayLikeFromArray.push(1);

    stringArray.length;
}