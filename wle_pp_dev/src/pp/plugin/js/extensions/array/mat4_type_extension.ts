/**
 * #WARN this type extension is actually added at runtime only if you call `initMat4Extension`  
 * The `initPP` function, which is automatically called by the `pp-gateway` component, does this for you
 */

import { Matrix4 } from "../../../../cauldron/type_definitions/array_type_definitions.js";

export interface Matrix4Extension<MatrixType extends Matrix4> {
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Array<T> extends Matrix4Extension<Array<number>> { }
}

declare global {
    interface Uint8ClampedArray extends Matrix4Extension<Uint8ClampedArray> { }
}

declare global {
    interface Uint8Array extends Matrix4Extension<Uint8Array> { }
}

declare global {
    interface Uint16Array extends Matrix4Extension<Uint16Array> { }
}

declare global {
    interface Uint32Array extends Matrix4Extension<Uint32Array> { }
}

declare global {
    interface Int8Array extends Matrix4Extension<Int8Array> { }
}

declare global {
    interface Int16Array extends Matrix4Extension<Int16Array> { }
}

declare global {
    interface Int32Array extends Matrix4Extension<Int32Array> { }
}

declare global {
    interface Float32Array extends Matrix4Extension<Float32Array> { }
}

declare global {
    interface Float64Array extends Matrix4Extension<Float64Array> { }
}

declare module "../../../../cauldron/type_definitions/array_type_definitions.js" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ArrayLike<T> extends Matrix4Extension<ArrayLike<number>> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DynamicArrayLike<T> extends Matrix4Extension<DynamicArrayLike<number>> { }

    interface Vector extends Matrix4Extension<Vector> { }

    interface Vector2 extends Matrix4Extension<Vector2> { }

    interface Vector3 extends Matrix4Extension<Vector3> { }

    interface Vector4 extends Matrix4Extension<Vector4> { }

    interface Quaternion extends Matrix4Extension<Quaternion> { }

    interface Quaternion2 extends Matrix4Extension<Quaternion2> { }

    interface Matrix2 extends Matrix4Extension<Matrix2> { }

    interface Matrix3 extends Matrix4Extension<Matrix3> { }

    interface Matrix4 extends Matrix4Extension<Matrix4> { }
}