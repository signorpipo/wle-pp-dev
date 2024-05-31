/**
 * #WARN this type extension is actually added at runtime only if you call `initVec3Extension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { Vector3 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface Vector3Extension<VectorType extends Vector3> {
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