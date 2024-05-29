/**
 * #WARN this type extension is actually added at runtime only if you call `initQuatExtension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { Quaternion } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface QuaternionExtension<QuaternionType extends Quaternion> {
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends QuaternionExtension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends QuaternionExtension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends QuaternionExtension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends QuaternionExtension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends QuaternionExtension<Uint32Array> { }
}

declare global {
    interface Int8Array extends QuaternionExtension<Int8Array> { }
}

declare global {
    interface Int16Array extends QuaternionExtension<Int16Array> { }
}

declare global {
    interface Int32Array extends QuaternionExtension<Int32Array> { }
}

declare global {
    interface Float32Array extends QuaternionExtension<Float32Array> { }
}

declare global {
    interface Float64Array extends QuaternionExtension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends QuaternionExtension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends QuaternionExtension<DynamicArrayLike<number>> { }

    interface Vector extends QuaternionExtension<Vector> { }

    interface Vector2 extends QuaternionExtension<Vector2> { }

    interface Vector3 extends QuaternionExtension<Vector3> { }

    interface Vector4 extends QuaternionExtension<Vector4> { }

    interface Quaternion extends QuaternionExtension<Quaternion> { }

    interface Quaternion2 extends QuaternionExtension<Quaternion2> { }

    interface Matrix2 extends QuaternionExtension<Matrix2> { }

    interface Matrix3 extends QuaternionExtension<Matrix3> { }

    interface Matrix4 extends QuaternionExtension<Matrix4> { }
}