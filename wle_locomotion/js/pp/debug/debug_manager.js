PP.DebugManager = class DebugManager {
    constructor() {
        this._myDebugVisualElementTypeMap = new Map();
        this._myDebugVisualElementLastID = 0;
        this._myDebugDrawPool = new PP.ObjectPoolManager();
        this._myDebugVisualElementsToShow = [];
    }

    update(dt) {
        this._updateDraw(dt);
    }

    //lifetimeSeconds can be null, in that case the debug object will be drawn until cleared
    draw(debugVisualElementParams, lifetimeSeconds = 0, idToReuse = null) {
        let debugVisualElement = null;
        let idReused = false;
        if (idToReuse != null) {
            if (this._myDebugVisualElementTypeMap.has(debugVisualElementParams.myType)) {
                let debugVisualElementMap = this._myDebugVisualElementTypeMap.get(debugVisualElementParams.myType);
                if (debugVisualElementMap.has(idToReuse)) {
                    debugVisualElement = debugVisualElementMap.get(idToReuse)[0];
                    debugVisualElement.setParams(debugVisualElementParams);
                    debugVisualElement.setVisible(false);
                    idReused = true;
                }
            }
        }

        if (debugVisualElement == null) {
            debugVisualElement = this._createDebugVisualElement(debugVisualElementParams);
        }

        if (debugVisualElement == null) {
            console.error("Couldn't create the requested debug visual element");
            return null;
        }

        if (!this._myDebugVisualElementTypeMap.has(debugVisualElementParams.myType)) {
            this._myDebugVisualElementTypeMap.set(debugVisualElementParams.myType, new Map());
        }
        let debugVisualElementMap = this._myDebugVisualElementTypeMap.get(debugVisualElementParams.myType);

        let elementID = null;
        if (!idReused) {
            elementID = this._myDebugVisualElementLastID + 1;
            this._myDebugVisualElementLastID = elementID;

            debugVisualElementMap.set(elementID, [debugVisualElement, new PP.Timer(lifetimeSeconds, lifetimeSeconds != null)]);
        } else {
            elementID = idToReuse;
            let debugVisualElementPair = debugVisualElementMap.get(elementID);
            debugVisualElementPair[0] = debugVisualElement;
            debugVisualElementPair[1].reset(lifetimeSeconds);
            if (lifetimeSeconds != null) {
                debugVisualElementPair[1].start();
            }
        }

        this._myDebugVisualElementsToShow.push(debugVisualElement);

        return elementID;
    }

    clearDraw(elementID = null) {
        if (elementID == null) {
            for (let debugVisualElementMap of this._myDebugVisualElementTypeMap.values()) {
                for (let debugVisualElement of debugVisualElementMap.values()) {
                    this._myDebugDrawPool.releaseObject(debugVisualElement[0].getParams().myType, debugVisualElement[0]);
                }
            }

            this._myDebugVisualElementTypeMap = new Map();
            this._myDebugVisualElementLastID = 0;
        } else {
            let debugVisualElement = null;
            for (let debugVisualElementMap of this._myDebugVisualElementTypeMap.values()) {
                if (debugVisualElementMap.has(elementID)) {
                    debugVisualElement = debugVisualElementMap.get(elementID);
                    this._myDebugDrawPool.releaseObject(debugVisualElement[0].getParams().myType, debugVisualElement[0]);
                    debugVisualElementMap.delete(elementID);
                    break;
                }
            }
        }
    }

    allocateDraw(debugVisualElementType, amount) {
        if (!this._myDebugDrawPool.hasPool(debugVisualElementType)) {
            this._addDebugVisualElementTypeToPool(debugVisualElementType);
        }

        let pool = this._myDebugDrawPool.getPool(debugVisualElementType);

        let difference = pool.getAvailableSize() - amount;
        if (difference < 0) {
            pool.increase(-difference);
        }
    }

    _updateDraw(dt) {
        for (let debugVisualElement of this._myDebugVisualElementsToShow) {
            debugVisualElement.setVisible(true);
        }
        this._myDebugVisualElementsToShow = [];

        for (let debugVisualElementMap of this._myDebugVisualElementTypeMap.values()) {
            let idsToRemove = [];
            for (let debugVisualElementMapEntry of debugVisualElementMap.entries()) {
                let debugVisualElement = debugVisualElementMapEntry[1];
                if (debugVisualElement[1].isDone()) {
                    this._myDebugDrawPool.releaseObject(debugVisualElement[0].getParams().myType, debugVisualElement[0]);
                    idsToRemove.push(debugVisualElementMapEntry[0]);
                }

                debugVisualElement[1].update(dt);
            }

            for (let id of idsToRemove) {
                debugVisualElementMap.delete(id);
            }
        }
    }

    _createDebugVisualElement(params) {
        let object = null;

        if (!this._myDebugDrawPool.hasPool(params.myType)) {
            this._addDebugVisualElementTypeToPool(params.myType);
        }

        object = this._myDebugDrawPool.getObject(params.myType);

        if (object != null) {
            object.setParams(params);
        }

        return object;
    }

    _addDebugVisualElementTypeToPool(type) {
        let objectPoolParams = new PP.ObjectPoolParams();
        objectPoolParams.myInitialPoolSize = 10;
        objectPoolParams.myPercentageToAddWhenEmpty = 1;
        objectPoolParams.myEnableDebugLog = false;
        objectPoolParams.mySetActiveCallback = function (object, active) {
            object.setVisible(active);
        };

        let debugVisualElement = null;
        switch (type) {
            case PP.DebugVisualElementType.LINE:
                debugVisualElement = new PP.DebugLine();
                break;
            case PP.DebugVisualElementType.TRANSFORM:
                debugVisualElement = new PP.DebugTransform();
                break;
            case PP.DebugVisualElementType.ARROW:
                debugVisualElement = new PP.DebugArrow();
                break;
            case PP.DebugVisualElementType.POINT:
                debugVisualElement = new PP.DebugPoint();
                break;
            case PP.DebugVisualElementType.RAYCAST:
                debugVisualElement = new PP.DebugRaycast();
                break;
            case PP.DebugVisualElementType.TEXT:
                debugVisualElement = new PP.DebugText();
                break;
        }

        debugVisualElement.setVisible(false);
        debugVisualElement.setAutoRefresh(true);

        if (debugVisualElement != null) {
            this._myDebugDrawPool.addPool(type, debugVisualElement, objectPoolParams);
        } else {
            console.error("Debug visual element type not supported");
        }
    }
};