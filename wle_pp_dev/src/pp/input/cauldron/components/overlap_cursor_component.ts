import { CollisionComponent, Component, Object3D, PhysXComponent } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
import { Cursor, CursorTarget } from "@wonderlandengine/components";
import { Vector3 } from "wle-pp/cauldron/type_definitions/array_type_definitions.js";
import { vec3_create } from "wle-pp/plugin/js/extensions/array/vec_create_extension.js";
import { PhysicsCollisionCollector } from "../../../cauldron/physics/physics_collision_collector.js";

/** #WARN This class is not actually a `Cursor`, but since it triggers `CursorTarget` emitters, it needs to forward a `Cursor` to them  
    As of now, this class forward a fake cursor as `Cursor`, which is a plain object with just the info usually need, like the `handedness` value */
export class OverlapCursorComponent extends Component {
    static override TypeName = "pp-overlap-cursor";

    /** 
     * This is useful if you want to avoid the cursor entering and exiting the target when very close to the target,  
     * due to it flickering between inside and outside.  
     * You can scale the collision up a bit so that it needs to move a bit outside to actually exit, so that it will not collide 
     *  
     * #WARN When using a `PhysXComponent` sadly this require to active and deactivate it to update the extents, which triggers a collision end and a start  
     * This is not an issue for the cursor, but if you use the same `PhysXComponent` for other queries, you might have issues due to this 
     */
    @property.float(1)
    private readonly _myCollisionSizeMultiplierOnOverlap!: number;

    @property.float(180)
    private readonly _myValidOverlapAngleFromTargetForward!: number;

    private _myLastTarget: CursorTarget | null = null;

    private _myPhysXComponent: PhysXComponent | null = null;
    private _myPhysicsCollisionCollector: PhysicsCollisionCollector | null = null;
    private readonly _myPhysXComponentExtents: Vector3 = vec3_create();
    private _myCollisionComponent: CollisionComponent | null = null;
    private readonly _myCollisionComponentExtents: Vector3 = vec3_create();
    private readonly _myFakeCursor!: Cursor;

    private _myDoubleClickTimer: number = 0;
    private _myTripleClickTimer: number = 0;
    private _myMultipleClickObject: Readonly<Object3D> | null = null;

    private static _myMultipleClickDelay: number = 0.3;

    public override init(): void {

        const fakeCursor = {
            handedness: 3,
            object: this.object
        };

        (this._myFakeCursor as Cursor) = fakeCursor as unknown as Cursor;
    }

    public override start(): void {
        this._myPhysXComponent = this.object.pp_getComponent(PhysXComponent);
        if (this._myPhysXComponent != null) {
            this._myPhysicsCollisionCollector = new PhysicsCollisionCollector(this._myPhysXComponent, true);

            this._myPhysXComponentExtents.vec3_copy(this._myPhysXComponent.extents);
        }

        this._myCollisionComponent = this.object.pp_getComponent(CollisionComponent);
        if (this._myCollisionComponent != null) {
            this._myCollisionComponentExtents.vec3_copy(this._myCollisionComponent.extents);
        }
    }

    public override update(dt: number): void {
        if (this._myDoubleClickTimer > 0) {
            this._myDoubleClickTimer -= dt;
        }

        if (this._myTripleClickTimer > 0) {
            this._myTripleClickTimer -= dt;
        }

        if (this._myCollisionComponent != null) {
            const collisions = this._myCollisionComponent!.queryOverlaps();
            let collisionTarget = null;
            for (let i = 0; i < collisions.length; ++i) {
                const collision = collisions[i];
                if (collision.group & this._myCollisionComponent!.group) {
                    const object = collision.object;
                    const target = object.pp_getComponent(CursorTarget);
                    if (target != null) {
                        if (target.equals(this._myLastTarget)) {
                            collisionTarget = target;
                            break;
                        } else if (collisionTarget == null || (!target.isSurface && collisionTarget.isSurface)) {
                            if (this._isOverlapAngleValid(this._myCollisionComponent.object, target.object)) {
                                collisionTarget = target;
                            }
                        }
                    }
                }
            }

            if (collisionTarget == null) {
                this._targetOverlapEnd();
            } else if (!collisionTarget.equals(this._myLastTarget)) {
                this._targetOverlapEnd();

                this._myLastTarget = collisionTarget;

                this._targetOverlapStart();
            }
        }

        if (this._myPhysicsCollisionCollector != null) {
            const collisions = this._myPhysicsCollisionCollector!.getCollisions();
            let collisionTarget: CursorTarget | null = null;
            for (const collision of collisions) {
                const target = collision.object.pp_getComponent(CursorTarget);
                if (target != null) {
                    if (target.equals(this._myLastTarget)) {
                        collisionTarget = target;
                        break;
                    } else if (collisionTarget == null || (!target.isSurface && collisionTarget.isSurface)) {
                        if (this._isOverlapAngleValid(this._myPhysXComponent!.object, target.object)) {
                            collisionTarget = target;
                        }
                    }
                }
            }

            if (collisionTarget == null) {
                this._targetOverlapEnd();
            } else if (!collisionTarget.equals(this._myLastTarget)) {
                this._targetOverlapEnd();

                this._myLastTarget = collisionTarget;

                this._targetOverlapStart();
            }
        }
    }

    public override onDeactivate(): void {
        this._targetOverlapEnd();
    }

    private _targetOverlapStart(): void {
        if (this._myCollisionSizeMultiplierOnOverlap != 1) {
            if (this._myPhysXComponent != null) {
                this._myPhysXComponent.extents = this._myPhysXComponentExtents.vec3_scale(this._myCollisionSizeMultiplierOnOverlap);
                this._myPhysXComponent.active = false;
                this._myPhysXComponent.active = true;
            }

            if (this._myCollisionComponent != null) {
                this._myCollisionComponent.extents = this._myCollisionComponentExtents.vec3_scale(this._myCollisionSizeMultiplierOnOverlap);
            }
        }

        this._myLastTarget!.onHover.notify(this._myLastTarget!.object, this._myFakeCursor);
        this._myLastTarget!.onDown.notify(this._myLastTarget!.object, this._myFakeCursor);
    }

    private _targetOverlapEnd(): void {
        if (this._myCollisionSizeMultiplierOnOverlap != 1) {
            if (this._myPhysXComponent != null) {
                this._myPhysXComponent.extents = this._myPhysXComponentExtents;
                this._myPhysXComponent.active = false;
                this._myPhysXComponent.active = true;
            }

            if (this._myCollisionComponent != null) {
                this._myCollisionComponent.extents = this._myCollisionComponentExtents;
            }
        }

        if (this._myLastTarget != null) {
            this._myLastTarget.onClick.notify(this._myLastTarget.object, this._myFakeCursor);

            if (this._myTripleClickTimer > 0 && this._myMultipleClickObject && this._myMultipleClickObject.pp_equals(this._myLastTarget.object)) {
                this._myLastTarget.onTripleClick.notify(this._myLastTarget.object, this._myFakeCursor);

                this._myTripleClickTimer = 0;
            } else if (this._myDoubleClickTimer > 0 && this._myMultipleClickObject && this._myMultipleClickObject.pp_equals(this._myLastTarget.object)) {
                this._myLastTarget.onDoubleClick.notify(this._myLastTarget.object, this._myFakeCursor);

                this._myTripleClickTimer = OverlapCursorComponent._myMultipleClickDelay;
                this._myDoubleClickTimer = 0;
            } else {
                this._myLastTarget.onSingleClick.notify(this._myLastTarget.object, this._myFakeCursor);

                this._myTripleClickTimer = 0;
                this._myDoubleClickTimer = OverlapCursorComponent._myMultipleClickDelay;
                this._myMultipleClickObject = this._myLastTarget.object;
            }

            this._myLastTarget.onUp.notify(this._myLastTarget.object, this._myFakeCursor);
            this._myLastTarget.onUpWithDown.notify(this._myLastTarget.object, this._myFakeCursor);

            this._myLastTarget.onUnhover.notify(this._myLastTarget.object, this._myFakeCursor);

            this._myLastTarget = null;
        }
    }

    private static _isOverlapAngleValidSV =
        {
            cursorPosition: vec3_create(),
            targetPosition: vec3_create(),
            targetForward: vec3_create(),
            directionToCursor: vec3_create()
        };
    private _isOverlapAngleValid(cursorObject: Readonly<Object3D>, targetObject: Readonly<Object3D>): boolean {
        if (this._myValidOverlapAngleFromTargetForward == 180) {
            return true;
        }

        const cursorPosition = OverlapCursorComponent._isOverlapAngleValidSV.cursorPosition;
        const targetPosition = OverlapCursorComponent._isOverlapAngleValidSV.targetPosition;
        const targetForward = OverlapCursorComponent._isOverlapAngleValidSV.targetForward;
        cursorObject.pp_getPosition(cursorPosition);
        targetObject.pp_getPosition(targetPosition);
        targetObject.pp_getForward(targetForward);

        const directionToCursor = OverlapCursorComponent._isOverlapAngleValidSV.directionToCursor;
        cursorPosition.vec3_sub(targetPosition, directionToCursor).vec3_normalize(directionToCursor);

        const overlapAngle = directionToCursor.vec3_angle(targetForward);

        return overlapAngle <= this._myValidOverlapAngleFromTargetForward;
    }
}