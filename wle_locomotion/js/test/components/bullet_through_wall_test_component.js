import { Component, Property } from "@wonderlandengine/api";

export class BulletThroughWallTestComponent extends Component {
    static TypeName = "bullet-through-wall-test";
    static Properties = {
        _myBulletSize: Property.float(0.1),
        _myBulletShape: Property.enum(['box', 'sphere'], 'box'),
        _myBulletStartSpeed: Property.float(20),
        _myBulletSpeedMultiplier: Property.float(1.25),
        _myWallSize: Property.float(10.0),
        _myWallStartThickness: Property.float(0.1),
        _myWallThicknessMultiplier: Property.float(2),
        _myWallDistance: Property.float(20.0),
        _myWallStatic: Property.bool(true),
    };

    start() {
        this._myDirection = PP.vec3_create(0, -0.25, 1);
        this._myDirection.vec3_normalize(this._myDirection);
        this._myRootObject = WL.scene.addObject(this.object);
        this._myRootObject.pp_resetTransform();
        this._myRootObject.pp_lookTo(this._myDirection);

        this._myWall = WL.scene.addObject(this._myRootObject);
        this._myWall.pp_setPositionLocal([0, 0, -this._myWallDistance - this._myWallStartThickness]);

        this._myBullet = WL.scene.addObject(this._myRootObject);
        this._myBullet.pp_setPositionLocal(PP.vec3_create(0, 0, -2));
        this._myBullet.pp_setRotationLocal([Math.pp_random(-180, 180), Math.pp_random(-180, 180), Math.pp_random(-180, 180)]);

        this._myWallPhysX = this._myWall.pp_addComponent("physx", {
            "shape": WL.Shape.Box,
            "extents": PP.vec3_create(this._myWallSize, this._myWallSize, this._myWallStartThickness),
            "static": this._myWallStatic,
            "kinematic": true,
            "mass": 1
        });

        this._myBulletPhysX = this._myBullet.pp_addComponent("physx", {
            "shape": (this._myBulletShape == 0 ? WL.Shape.Box : WL.Shape.Sphere),
            "extents": PP.vec3_create(this._myBulletSize, this._myBulletSize, this._myBulletSize),
            "static": false,
            "kinematic": true,
            "mass": 1
        });

        this._myBulletPhysX.onCollision(this._onCollision.bind(this));

        this._myKinematicTimer = new PP.Timer(2);
        this._myShotTimer = new PP.Timer(0.1, false);
        this._myResetTimer = new PP.Timer(2, false);
        this._myResetPositionTimer = new PP.Timer(0.1, false);

        this._myBulletSpeed = this._myBulletStartSpeed;
        this._myWallThickness = this._myWallStartThickness;

        this._myCollisionTouchDetected = false;
        this._myCollisionTouchLostDetected = false;
    }

    update(dt) {
        this._myKinematicTimer.update(dt);
        this._myShotTimer.update(dt);
        this._myResetTimer.update(dt);
        this._myResetPositionTimer.update(dt);

        if (this._myKinematicTimer.isDone()) {
            console.log("Bullet Speed:", this._myBulletSpeed.toFixed(2));
            console.log("Wall Thickness:", this._myWallThickness.toFixed(2));
            this._myKinematicTimer.reset();
            this._myShotTimer.start();
            this._myBulletPhysX.kinematic = false;
        }

        if (this._myShotTimer.isDone()) {
            this._myShotTimer.reset();
            this._myResetTimer.start();
            this._myBulletPhysX.linearVelocity = this._myDirection.vec3_scale(-this._myBulletSpeed);
        }

        if (this._myResetTimer.isDone()) {
            this._myResetTimer.reset();
            this._myResetPositionTimer.start();
            this._myBulletPhysX.kinematic = true;
        }

        if (this._myResetPositionTimer.isDone()) {
            this._myResetPositionTimer.reset();
            this._myKinematicTimer.start(0.5);
            this._myBullet.pp_resetTransformLocal();
            this._myBullet.pp_setPositionLocal(PP.vec3_create(0, 0, -2));
            this._myBullet.pp_setRotationLocal([Math.pp_random(-180, 180), Math.pp_random(-180, 180), Math.pp_random(-180, 180)]);

            if (this._myCollisionTouchDetected && this._myCollisionTouchLostDetected) {
                console.log("Bullet Collision Detected");
            } else if (this._myCollisionTouchDetected) {
                console.error("Error - Only Bullet Collision Touch Detected");
            } else if (this._myCollisionTouchLostDetected) {
                console.error("Error - Only Bullet Collision Touch Detected");
            } else {
                console.error("Error - No Bullet Collision Detected");
            }

            console.log("");

            if (this._myCollisionTouchDetected && this._myCollisionTouchLostDetected) {
                this._myBulletSpeed = this._myBulletSpeed * this._myBulletSpeedMultiplier;
            } else {
                this._myWallThickness = this._myWallThickness * this._myWallThicknessMultiplier;
                this._myWallPhysX.active = false;
                this._myWallPhysX.extents = PP.vec3_create(this._myWallSize, this._myWallSize, this._myWallThickness);
                this._myWall.pp_setPositionLocal([0, 0, -this._myWallDistance - this._myWallThickness]);
                this._myWallPhysX.active = true;
            }
            this._myCollisionTouchDetected = false;
            this._myCollisionTouchLostDetected = false;
        }

    }

    _onCollision(type) {
        if (type == WL.CollisionEventType.Touch) {
            this._myCollisionTouchDetected = true;
        } else if (type == WL.CollisionEventType.TouchLost) {
            this._myCollisionTouchLostDetected = true;
        }
    }
}