if (_WL && _WL._componentTypes && _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]]) {

    // Modified Functions

    _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]].prototype.init = function () {
        this.touchID = null;
        this.prevTouch = null;

        document.body.addEventListener('mousemove', this._onMove.bind(this));
        document.body.addEventListener('touchmove', this._onMove.bind(this));

        if (this.requireMouseDown) {
            if (this.mouseButtonIndex == 2) {
                WL.canvas.addEventListener("contextmenu", function (event) {
                    event.preventDefault();
                }, false);
            }
            WL.canvas.addEventListener('mousedown', function (event) {
                if (!this.mouseDown) {
                    if (event.button == this.mouseButtonIndex) {
                        this.mouseDown = true;
                        document.body.style.cursor = "grabbing";
                        if (event.button == 1) {
                            event.preventDefault(); // Prevent scrolling
                            return false;
                        }
                    }
                }
            }.bind(this));
            document.body.addEventListener('mouseup', function (event) {
                if (this.mouseDown) {
                    if (event.button == this.mouseButtonIndex) {
                        this.mouseDown = false;
                        document.body.style.cursor = "initial";
                    }
                }
            }.bind(this));
            document.body.addEventListener('mouseleave', function (event) {
                if (this.mouseDown) {
                    this.mouseDown = false;
                    document.body.style.cursor = "initial";
                }
            }.bind(this));

            WL.canvas.addEventListener('touchstart', function (event) {
                if (!this.mouseDown) {
                    if (this.touchID == null && event.changedTouches != null && event.changedTouches.length > 0) {
                        this.touchID = event.changedTouches[0].identifier;
                        this.prevTouch = null;

                        this.mouseDown = true;
                        document.body.style.cursor = "grabbing";
                    }
                }
            }.bind(this));
            document.body.addEventListener('touchend', function (event) {
                if (this.mouseDown) {
                    let touchFound = null

                    // if this is a touch event, make sure it is the right one
                    if (event.changedTouches != null && event.changedTouches.length > 0) {
                        for (let changedTouch of event.changedTouches) {
                            if (this.touchID == changedTouch.identifier) {
                                touchFound = changedTouch;
                                break;
                            }
                        }
                    }

                    if (touchFound != null) {
                        this.touchID = null;
                        this.mouseDown = false;
                        document.body.style.cursor = "initial";
                    }
                }
            }.bind(this));
        }
    };

    _WL._componentTypes[_WL._componentTypeIndices["mouse-look"]].prototype._onMove = function () {
        let viewForward = PP.vec3_create();
        let viewUp = PP.vec3_create();

        let referenceUp = PP.vec3_create();
        let referenceUpNegate = PP.vec3_create();
        let referenceRight = PP.vec3_create();

        let newUp = PP.vec3_create();
        return function (event) {
            let touchFound = null
            if (this.touchID != null) {
                // if this is a touch event, make sure it is the right one
                if (event.changedTouches != null && event.changedTouches.length > 0) {
                    for (let changedTouch of event.changedTouches) {
                        if (this.touchID == changedTouch.identifier) {
                            touchFound = changedTouch;
                            break;
                        }
                    }
                }
            }

            if (this.active && (this.mouseDown || !this.requireMouseDown) && (this.touchID == null || touchFound != null)) {

                viewForward = this.object.pp_getBackward(viewForward); // the view "real" forward is actually the backward
                viewUp = this.object.pp_getUp(viewUp);

                referenceUp.vec3_set(0, 1, 0);
                if (this.object.pp_getParent() != null) {
                    referenceUp = this.object.pp_getParent().pp_getUp(referenceUp);
                }

                referenceRight = viewForward.vec3_cross(referenceUp, referenceRight);

                let minAngle = 1;
                if (viewForward.vec3_angle(referenceUp) < minAngle) {
                    referenceRight = viewUp.vec3_negate(referenceRight).vec3_cross(referenceUp, referenceRight);
                } else if (viewForward.vec3_angle(referenceUp.vec3_negate(referenceUpNegate)) < minAngle) {
                    referenceRight = viewUp.vec3_cross(referenceUp, referenceRight);
                } else if (!viewUp.vec3_isConcordant(referenceUp)) {
                    referenceRight.vec3_negate(referenceRight);
                }
                referenceRight.vec3_normalize(referenceRight);

                this.rotationX = 0;
                this.rotationY = 0;

                if (touchFound != null) {
                    if (this.prevTouch != null) {
                        let movementX = 0;
                        let movementY = 0;
                        movementX = touchFound.pageX - this.prevTouch.pageX;
                        movementY = touchFound.pageY - this.prevTouch.pageY;
                        this.rotationX = -this.sensitity * movementX;
                        this.rotationY = -this.sensitity * movementY;
                    }
                } else {
                    this.rotationX = -this.sensitity * event.movementX;
                    this.rotationY = -this.sensitity * event.movementY;
                }

                this.object.pp_rotateAxis(this.rotationY, referenceRight);

                let maxVerticalAngle = 90 - 0.001;
                newUp = this.object.pp_getUp(newUp);
                let angleWithUp = Math.pp_angleClamp(newUp.vec3_angleSigned(referenceUp, referenceRight));
                if (Math.abs(angleWithUp) > maxVerticalAngle) {
                    let fixAngle = (Math.abs(angleWithUp) - maxVerticalAngle) * Math.pp_sign(angleWithUp);
                    this.object.pp_rotateAxis(fixAngle, referenceRight);
                }

                this.object.pp_rotateAxis(this.rotationX, referenceUp);
            }

            if (touchFound != null) {
                this.prevTouch = touchFound;
            }
        };
    }();
} else {
    console.error("Wonderland Engine \"mouse-look\" component not found.\n Add the component to your project to avoid any issue with the PP bundle.");
}