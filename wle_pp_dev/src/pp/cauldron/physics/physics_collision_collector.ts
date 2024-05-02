import { CollisionEventType, Emitter, Object3D, PhysXComponent } from "@wonderlandengine/api";
import { Timer } from "../cauldron/timer.js";

export class PhysicsCollisionCollector {

    private readonly _myPhysX: PhysXComponent;
    private readonly _myIsTrigger: boolean;

    private _myActive: boolean = false;

    private _myCollisionCallbackID: number | null = null;

    private _myCollisionEmitter: Emitter<[PhysXComponent, PhysXComponent, CollisionEventType]> = new Emitter();
    private _myCollisionStartEmitter: Emitter<[PhysXComponent, PhysXComponent, CollisionEventType]> = new Emitter();
    private _myCollisionEndEmitter: Emitter<[PhysXComponent, PhysXComponent, CollisionEventType]> = new Emitter();

    private readonly _myCollisions: Object3D[] = [];
    private _myCollisionsStarted: Object3D[] = [];
    private _myCollisionsEnded: Object3D[] = [];
    private _myCollisionsStartedoProcess: Object3D[] = [];
    private _myCollisionsEndedToProcess: Object3D[] = [];

    private _myUpdateActive: boolean = false;

    private readonly _myTriggerDesyncFixDelay: Timer = new Timer(0.1);

    private _myLogEnabled: boolean = false;

    private _myDestroyed: boolean = false;



    constructor(physXComponent: PhysXComponent, isTrigger: boolean = false) {
        this._myPhysX = physXComponent;

        this._myIsTrigger = isTrigger;

        this.setActive(true);
    }

    public getPhysX(): PhysXComponent {
        return this._myPhysX;
    }

    public getCollisions(): Object3D[] {
        return this._myCollisions;
    }

    public getCollisionsStarted(): Object3D[] {
        return this._myCollisionsStarted;
    }

    public getCollisionsEnded(): Object3D[] {
        return this._myCollisionsEnded;
    }

    public isActive(): boolean {
        return this._myActive;
    }

    public setActive(active: boolean): void {
        if (this._myActive != active) {
            this._myActive = active;

            this._myCollisions.pp_clear();

            this._myCollisionsStarted.pp_clear();
            this._myCollisionsEnded.pp_clear();
            this._myUpdateActive = false;
            this._myCollisionsStartedoProcess.pp_clear();
            this._myCollisionsEndedToProcess.pp_clear();

            if (this._myActive) {
                this._myCollisionCallbackID = this._myPhysX.onCollision(this._onCollision.bind(this));
            } else if (this._myCollisionCallbackID != null) {
                this._myPhysX.removeCollisionCallback(this._myCollisionCallbackID);
                this._myCollisionCallbackID = null;
            }
        }
    }

    // Set to true only if u are going to actually update this object and don't want to lose any collision start/end events prior to updating the first time after activation
    public setUpdateActive(active: boolean): void {
        this._myUpdateActive = active;
    }

    // Update is not mandatory, use it only if u want to access collisions start and end
    public update(dt: number): void {
        if (!this._myActive) {
            return;
        }

        this._myUpdateActive = true;

        const prevCollisionsStartToProcess = this._myCollisionsStartedoProcess;
        this._myCollisionsStartedoProcess = this._myCollisionsStarted;
        this._myCollisionsStartedoProcess.pp_clear();
        this._myCollisionsStarted = prevCollisionsStartToProcess;

        const prevCollisionsEndToProcess = this._myCollisionsEndedToProcess;
        this._myCollisionsEndedToProcess = this._myCollisionsEnded;
        this._myCollisionsEndedToProcess.pp_clear();
        this._myCollisionsEnded = prevCollisionsEndToProcess;

        if (this._myIsTrigger) {
            this._triggerDesyncFix(dt);
        }
    }

    public isLogEnabled(): boolean {
        return this._myLogEnabled;
    }

    public setLogEnabled(enabled: boolean): void {
        this._myLogEnabled = enabled;
    }

    public registerCollisionEventListener(id: Readonly<any>, listener: (currentPhysX: PhysXComponent, otherPhysX: PhysXComponent, collisionType: CollisionEventType) => void): void {
        this._myCollisionEmitter.add(listener, { id: id });
    }

    public unregisterCollisionEventListener(id: Readonly<any>): void {
        this._myCollisionEmitter.remove(id);
    }

    public registerCollisionStartEventListener(id: Readonly<any>, listener: (currentPhysX: PhysXComponent, otherPhysX: PhysXComponent, collisionType: CollisionEventType) => void): void {
        this._myCollisionStartEmitter.add(listener, { id: id });
    }

    public unregisterCollisionStartEventListener(id: Readonly<any>): void {
        this._myCollisionStartEmitter.remove(id);
    }

    public registerCollisionEndEventListener(id: Readonly<any>, listener: (currentPhysX: PhysXComponent, otherPhysX: PhysXComponent, collisionType: CollisionEventType) => void): void {
        this._myCollisionEndEmitter.add(listener, { id: id });
    }

    public unregisterCollisionEndEventListener(id: Readonly<any>): void {
        this._myCollisionEndEmitter.remove(id);
    }

    private _onCollision(type: CollisionEventType, physXComponent: PhysXComponent): void {
        if (type == CollisionEventType.Touch || type == CollisionEventType.TriggerTouch) {
            this._onCollisionStart(type, physXComponent);
        } else if (type == CollisionEventType.TouchLost || type == CollisionEventType.TriggerTouchLost) {
            this._onCollisionEnd(type, physXComponent);
        }

        this._myCollisionEmitter.notify(this._myPhysX, physXComponent, type);
    }

    private _onCollisionStart(type: CollisionEventType, physXComponent: PhysXComponent): void {
        if (this._myLogEnabled) {
            let objectFound = false;
            for (const object of this._myCollisions) {
                if (object.pp_equals(physXComponent.object)) {
                    objectFound = true;
                    break;
                }
            }

            if (objectFound) {
                console.error("Collision Start on object already collected");
            }
        }

        this._myCollisions.push(physXComponent.object);

        if (this._myUpdateActive) {
            this._myCollisionsStartedoProcess.push(physXComponent.object);
            this._myCollisionsEndedToProcess.pp_removeAll(function (element) {
                return element.pp_equals(physXComponent.object);
            });
        }

        if (this._myLogEnabled) {
            console.log("Collision Start -", this._myCollisions.length);
        }

        this._myCollisionStartEmitter.notify(this._myPhysX, physXComponent, type);
    }

    private _onCollisionEnd(type: CollisionEventType, physXComponent: PhysXComponent): void {
        if (this._myLogEnabled) {
            let objectFound = false;
            for (const object of this._myCollisions) {
                if (object.pp_equals(physXComponent.object)) {
                    objectFound = true;
                    break;
                }
            }

            if (!objectFound) {
                console.error("Collision End on object not collected");
            }
        }

        this._myCollisions.pp_removeAll(function (element) {
            return element.pp_equals(physXComponent.object);
        });

        if (this._myUpdateActive) {
            this._myCollisionsEndedToProcess.push(physXComponent.object);
            this._myCollisionsStartedoProcess.pp_removeAll(function (element) {
                return element.pp_equals(physXComponent.object);
            });
        }

        if (this._myLogEnabled) {
            console.log("Collision End -", this._myCollisions.length);
        }

        this._myCollisionEndEmitter.notify(this._myPhysX, physXComponent, type);
    }

    private static readonly _triggerDesyncFixSV =
        {
            findAllCallback: function (element: Object3D) {
                const physX = element.pp_getComponentSelf(PhysXComponent);
                return physX == null || !physX.active;
            }
        };
    private _triggerDesyncFix(dt: number): void {
        this._myTriggerDesyncFixDelay.update(dt);
        if (this._myTriggerDesyncFixDelay.isDone()) {
            this._myTriggerDesyncFixDelay.start();

            const findAllCallback = PhysicsCollisionCollector._triggerDesyncFixSV.findAllCallback;
            const collisionsToEnd = this._myCollisions.pp_findAll(findAllCallback);

            if (collisionsToEnd.length > 0) {
                //console.error("DESYNC RESOLVED");

                for (let i = 0; i < collisionsToEnd.length; i++) {
                    const collision = collisionsToEnd[i];

                    const physX = collision.pp_getComponentSelf(PhysXComponent);
                    if (physX) {
                        this._onCollisionEnd(CollisionEventType.TriggerTouchLost, physX);
                    } else {
                        console.error("NO PHYSX, HOW?");
                    }
                }
            }
        }
    }

    public destroy(): void {
        this._myDestroyed = true;

        if (this._myCollisionCallbackID != null) {
            this._myPhysX.removeCollisionCallback(this._myCollisionCallbackID);
            this._myCollisionCallbackID = null;
        }
    }

    public isDestroyed(): boolean {
        return this._myDestroyed;
    }
}