PP.VisualManager = class VisualManager {
    constructor() {
        this._myVisualElementTypeMap = new Map();
        this._myVisualElementLastID = 0;
        this._myVisualElementsPool = new PP.ObjectPoolManager();
        this._myVisualElementsToShow = [];
    }

    update(dt) {
        this._updateDraw(dt);
    }

    //lifetimeSeconds can be null, in that case the element will be drawn until cleared
    draw(visualElementParams, lifetimeSeconds = 0, idToReuse = null) {
        let visualElement = null;
        let idReused = false;
        if (idToReuse != null) {
            if (this._myVisualElementTypeMap.has(visualElementParams.myType)) {
                let visualElementMap = this._myVisualElementTypeMap.get(visualElementParams.myType);
                if (visualElementMap.has(idToReuse)) {
                    visualElement = visualElementMap.get(idToReuse)[0];
                    visualElement.setParams(visualElementParams);
                    visualElement.setVisible(false);
                    idReused = true;
                }
            }
        }

        if (visualElement == null) {
            visualElement = this._createVisualElement(visualElementParams);
        }

        if (visualElement == null) {
            console.error("Couldn't create the requested visual element");
            return null;
        }

        if (!this._myVisualElementTypeMap.has(visualElementParams.myType)) {
            this._myVisualElementTypeMap.set(visualElementParams.myType, new Map());
        }
        let visualElementMap = this._myVisualElementTypeMap.get(visualElementParams.myType);

        let elementID = null;
        if (!idReused) {
            elementID = this._myVisualElementLastID + 1;
            this._myVisualElementLastID = elementID;

            visualElementMap.set(elementID, [visualElement, new PP.Timer(lifetimeSeconds, lifetimeSeconds != null)]);
        } else {
            elementID = idToReuse;
            let visualElementPair = visualElementMap.get(elementID);
            visualElementPair[0] = visualElement;
            visualElementPair[1].reset(lifetimeSeconds);
            if (lifetimeSeconds != null) {
                visualElementPair[1].start();
            }
        }

        this._myVisualElementsToShow.push(visualElement);

        return elementID;
    }

    clearDraw(elementID = null) {
        if (elementID == null) {
            for (let visualElementMap of this._myVisualElementTypeMap.values()) {
                for (let visualElement of visualElementMap.values()) {
                    this._myVisualElementsPool.releaseObject(visualElement[0].getParams().myType, visualElement[0]);
                }
            }

            this._myVisualElementTypeMap = new Map();
            this._myVisualElementLastID = 0;
        } else {
            let visualElement = null;
            for (let visualElementMap of this._myVisualElementTypeMap.values()) {
                if (visualElementMap.has(elementID)) {
                    visualElement = visualElementMap.get(elementID);
                    this._myVisualElementsPool.releaseObject(visualElement[0].getParams().myType, visualElement[0]);
                    visualElementMap.delete(elementID);
                    break;
                }
            }
        }
    }

    allocateDraw(visualElementType, amount) {
        if (!this._myVisualElementsPool.hasPool(visualElementType)) {
            this._addVisualElementTypeToPool(visualElementType);
        }

        let pool = this._myVisualElementsPool.getPool(visualElementType);

        let difference = pool.getAvailableSize() - amount;
        if (difference < 0) {
            pool.increase(-difference);
        }
    }

    _updateDraw(dt) {
        for (let visualElement of this._myVisualElementsToShow) {
            visualElement.setVisible(true);
        }
        this._myVisualElementsToShow = [];

        for (let visualElementMap of this._myVisualElementTypeMap.values()) {
            let idsToRemove = [];
            for (let visualElementMapEntry of visualElementMap.entries()) {
                let visualElement = visualElementMapEntry[1];
                if (visualElement[1].isDone()) {
                    this._myVisualElementsPool.releaseObject(visualElement[0].getParams().myType, visualElement[0]);
                    idsToRemove.push(visualElementMapEntry[0]);
                }

                visualElement[1].update(dt);
            }

            for (let id of idsToRemove) {
                visualElementMap.delete(id);
            }
        }
    }

    _createVisualElement(params) {
        let element = null;

        if (!this._myVisualElementsPool.hasPool(params.myType)) {
            this._addVisualElementTypeToPool(params.myType);
        }

        element = this._myVisualElementsPool.getObject(params.myType);

        if (element != null) {
            element.setParams(params);
        }

        return element;
    }

    _addVisualElementTypeToPool(type) {
        let objectPoolParams = new PP.ObjectPoolParams();
        objectPoolParams.myInitialPoolSize = 10;
        objectPoolParams.myPercentageToAddWhenEmpty = 1;
        objectPoolParams.myEnableDebugLog = false;
        objectPoolParams.mySetActiveCallback = function (object, active) {
            object.setVisible(active);
        };

        let visualElement = null;
        switch (type) {
            case PP.VisualElementType.LINE:
                visualElement = new PP.VisualLine();
                break;
        }

        visualElement.setVisible(false);
        visualElement.setAutoRefresh(true);

        if (visualElement != null) {
            this._myVisualElementsPool.addPool(type, visualElement, objectPoolParams);
        } else {
            console.error("Visual element type not supported");
        }
    }
};