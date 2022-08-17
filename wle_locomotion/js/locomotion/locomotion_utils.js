LocomotionUtils = {
    EPSILON_NUMBER: Math.PP_EPSILON_NUMBER,
    EPSILON_ANGLE: Math.PP_EPSILON_ANGLE,

    computeSurfacePerceivedAngle: function () {
        let forwardOnSurface = PP.vec3_create();
        return function computeSurfacePerceivedAngle(surfaceAngle, surfaceNormal, up, forward, isGround) {
            let surfacePerceivedAngle = surfaceAngle;

            if (surfaceAngle > 0.0001 && surfaceAngle < 180 - 0.0001) {
                forwardOnSurface = forward.vec3_projectOnPlaneAlongAxis(surfaceNormal, up, forwardOnSurface);
                surfacePerceivedAngle = forwardOnSurface.vec3_angle(forward);
                if (Math.abs(surfacePerceivedAngle) < 0.0001) {
                    surfacePerceivedAngle = 0;
                } else {
                    let isFurtherOnUp = forwardOnSurface.vec3_isFurtherAlongDirection(forward, up);
                    if ((!isFurtherOnUp && isGround) || (isFurtherOnUp && !isGround)) {
                        surfacePerceivedAngle *= -1;
                    }
                }
            }

            return surfacePerceivedAngle;
        };
    }()
};