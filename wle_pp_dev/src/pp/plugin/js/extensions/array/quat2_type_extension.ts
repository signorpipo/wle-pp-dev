/**
 * #WARN this type extension is actually added at runtime only if you call `initQuat2Extension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { Quaternion2 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface Quaternion2Extension<QuaternionType extends Quaternion2> {
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends Quaternion2Extension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends Quaternion2Extension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends Quaternion2Extension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends Quaternion2Extension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends Quaternion2Extension<Uint32Array> { }
}

declare global {
    interface Int8Array extends Quaternion2Extension<Int8Array> { }
}

declare global {
    interface Int16Array extends Quaternion2Extension<Int16Array> { }
}

declare global {
    interface Int32Array extends Quaternion2Extension<Int32Array> { }
}

declare global {
    interface Float32Array extends Quaternion2Extension<Float32Array> { }
}

declare global {
    interface Float64Array extends Quaternion2Extension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends Quaternion2Extension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends Quaternion2Extension<DynamicArrayLike<number>> { }

    interface Vector extends Quaternion2Extension<Vector> { }

    interface Vector2 extends Quaternion2Extension<Vector2> { }

    interface Vector3 extends Quaternion2Extension<Vector3> { }

    interface Vector4 extends Quaternion2Extension<Vector4> { }

    interface Quaternion extends Quaternion2Extension<Quaternion> { }

    interface Quaternion2 extends Quaternion2Extension<Quaternion2> { }

    interface Matrix2 extends Quaternion2Extension<Matrix2> { }

    interface Matrix3 extends Quaternion2Extension<Matrix3> { }

    interface Matrix4 extends Quaternion2Extension<Matrix4> { }
}