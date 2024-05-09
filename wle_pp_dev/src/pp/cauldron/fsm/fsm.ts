

import { Emitter } from "@wonderlandengine/api";
import { State } from "./state.js";
import { Transition } from "./transition.js";

export class StateData {

    public myID: unknown;
    public myObject: State;

    constructor(stateID: unknown, stateObject: State) {
        this.myID = stateID;
        this.myObject = stateObject;
    }
}

export class TransitionData {

    public myID: unknown;

    public myFromState: Readonly<StateData>;
    public myToState: Readonly<StateData>;

    public myObject: Transition;

    public mySkipStateFunction: SkipStateFunction;

    constructor(transitionID: unknown, fromStateData: Readonly<StateData>, toStateData: Readonly<StateData>, transitionObject: Transition, skipStateFunction: SkipStateFunction) {
        this.myID = transitionID;
        this.myFromState = fromStateData;
        this.myToState = toStateData;
        this.myObject = transitionObject;
        this.mySkipStateFunction = skipStateFunction;
    }
}

export enum PerformMode {
    IMMEDIATE = 0,
    DELAYED = 1
}

export enum PerformDelayedMode {
    QUEUE = 0,
    KEEP_FIRST = 1,
    KEEP_LAST = 2
}

export enum SkipStateFunction {
    NONE = 0,
    END = 1,
    START = 2,
    BOTH = 3
}

/**
    You can also use plain functions for state/transition if u want to do something simple and quick

    Signatures:
        function stateUpdate(dt, fsm)
        function init(fsm, initStateData)
        function transition(fsm, transitionData)
*/
export class FSM {

    private _myCurrentStateData: Readonly<StateData> | null = null;

    private _myStates: Map<unknown, Readonly<StateData>> = new Map();
    private _myTransitions: Map<unknown, Map<unknown, Readonly<TransitionData>>> = new Map();

    private _myLogEnabled: boolean = false;
    private _myLogShowDelayedInfo: boolean = false;
    private _myLogFSMName: string = "FSM";

    private _myPerformMode: PerformMode;
    private _myPerformDelayedMode: PerformDelayedMode;
    private _myPendingPerforms = [];
    private _myCurrentlyPerformedTransition = null;

    private _myInitEmitter: Emitter<[FSM, Readonly<StateData>, Transition, unknown[]]> = new Emitter();             // Signature: listener(fsm, initStateData, initTransitionObject, ...args)
    private _myInitIDEmitters = new Map();
    private _myTransitionEmitter: Emitter<[FSM, Readonly<StateData>, Readonly<StateData>, Readonly<TransitionData>, PerformMode, unknown[]]> = new Emitter();
    private _myTransitionIDEmitters: [unknown, unknown, unknown, Emitter<[FSM, Readonly<StateData>, Readonly<StateData>, Readonly<TransitionData>, PerformMode, unknown[]]>][] = [];

    constructor(performMode = PerformMode.IMMEDIATE, performDelayedMode = PerformDelayedMode.QUEUE) {
        this._myPerformMode = performMode;
        this._myPerformDelayedMode = performDelayedMode;
    }

    public addState(stateID: unknown, state: State | ((dt: number, fsm: FSM, ...args: unknown[]) => void) | null = null): void {
        let stateObject: State | null = null;
        if (!state || typeof state == "function") {
            stateObject = {};

            if (typeof state == "function") {
                stateObject.update = function update(dt: number, fsm: FSM, ...args: unknown[]) { return state(dt, fsm, ...args); };
            }

            stateObject.clone = function clone() {
                const cloneObject: State = {};
                cloneObject.update = this.update;
                cloneObject.clone = this.clone;
                return cloneObject;
            };
        } else {
            stateObject = state;
        }

        const stateData = new StateData(stateID, stateObject);
        this._myStates.set(stateID, stateData);
        this._myTransitions.set(stateID, new Map());
    }

    public addTransition(fromStateID: unknown, toStateID: unknown, transitionID: unknown, transition: Transition | ((fsm: FSM, transitionData: Readonly<TransitionData>, ...args: unknown[]) => void) | null = null, skipStateFunction: SkipStateFunction = SkipStateFunction.NONE): void {
        let transitionObject: Transition | null = null;
        if (!transition || typeof transition == "function") {
            transitionObject = {};

            if (typeof transition == "function") {
                transitionObject.perform = function perform(fsm: FSM, transitionData: Readonly<TransitionData>, ...args: unknown[]) { return transition(fsm, transitionData, ...args); };
            }

            transitionObject.clone = function clone() {
                const cloneObject: Transition = {};
                cloneObject.perform = this.perform;
                cloneObject.clone = this.clone;
                return cloneObject;
            };
        } else {
            transitionObject = transition;
        }

        if (this.hasState(fromStateID) && this.hasState(toStateID)) {
            const transitionsFromState = this._getTransitionsFromState(fromStateID)!;

            const transitionData = new TransitionData(transitionID, this.getState(fromStateID)!, this.getState(toStateID)!, transitionObject, skipStateFunction);
            transitionsFromState.set(transitionID, transitionData);
        } else {
            if (!this.hasState(fromStateID) && !this.hasState(toStateID)) {
                console.error("Can't add transition:", transitionID, "- from state not found:", fromStateID, "- to state not found:", toStateID);
            } else if (!this.hasState(fromStateID)) {
                console.error("Can't add transition:", transitionID, "- from state not found:", fromStateID);
            } else if (!this.hasState(toStateID)) {
                console.error("Can't add transition:", transitionID, "- to state not found:", toStateID);
            }
        }
    }

    public init(initStateID, initTransition = null, ...args): void {
        let initTransitionObject = initTransition;
        if (initTransition && typeof initTransition == "function") {
            initTransitionObject = {};
            initTransitionObject.performInit = initTransition;
        }

        if (this.hasState(initStateID)) {
            let initStateData = this._myStates.get(initStateID);

            if (this._myLogEnabled) {
                console.log(this._myLogFSMName, "- Init:", initStateID);
            }

            if (initTransitionObject && initTransitionObject.performInit) {
                initTransitionObject.performInit(this, initStateData, ...args);
            } else if (initStateData.myObject && initStateData.myObject.init) {
                initStateData.myObject.init(this, initStateData, ...args);
            }

            this._myCurrentStateData = initStateData;

            this._myInitEmitter.notify(this, initStateData, initTransitionObject, ...args);

            if (this._myInitIDEmitters.size > 0) {
                let emitter = this._myInitIDEmitters.get(initStateID);
                if (emitter != null) {
                    emitter.notify(this, initStateData, initTransitionObject, ...args);
                }
            }
        } else if (this._myLogEnabled) {
            console.warn(this._myLogFSMName, "- Init state not found:", initStateID);
        }
    }

    public update(dt, ...args) {
        if (this._myPendingPerforms.length > 0) {
            for (let i = 0; i < this._myPendingPerforms.length; i++) {
                this._perform(this._myPendingPerforms[i].myID, PerformMode.DELAYED, ...this._myPendingPerforms[i].myArgs);
            }
            this._myPendingPerforms = [];
        }

        if (this._myCurrentStateData && this._myCurrentStateData.myObject && this._myCurrentStateData.myObject.update) {
            this._myCurrentStateData.myObject.update(dt, this, ...args);
        }
    }

    public perform(transitionID, ...args) {
        if (this._myPerformMode == PerformMode.DELAYED) {
            this.performDelayed(transitionID, ...args);
        } else {
            this.performImmediate(transitionID, ...args);
        }
    }

    public performDelayed(transitionID, ...args) {
        let performDelayed = false;

        switch (this._myPerformDelayedMode) {
            case PerformDelayedMode.QUEUE:
                this._myPendingPerforms.push(new _PendingPerform(transitionID, ...args));
                performDelayed = true;
                break;
            case PerformDelayedMode.KEEP_FIRST:
                if (!this.hasPendingPerforms()) {
                    this._myPendingPerforms.push(new _PendingPerform(transitionID, ...args));
                    performDelayed = true;
                }
                break;
            case PerformDelayedMode.KEEP_LAST:
                this.resetPendingPerforms();
                this._myPendingPerforms.push(new _PendingPerform(transitionID, ...args));
                performDelayed = true;
                break;
        }

        return performDelayed;
    }

    public performImmediate(transitionID, ...args) {
        return this._perform(transitionID, PerformMode.IMMEDIATE, ...args);
    }

    public canPerform(transitionID) {
        return this.hasTransitionFromState(this._myCurrentStateData.myID, transitionID);
    }

    public canGoTo(stateID, transitionID = null) {
        return this.hasTransitionFromStateToState(this._myCurrentStateData.myID, stateID, transitionID);
    }

    public isInState(stateID) {
        return this._myCurrentStateData != null && this._myCurrentStateData.myID == stateID;
    }

    public isPerformingTransition() {
        return this._myCurrentlyPerformedTransition != null;
    }

    public getCurrentlyPerformedTransition() {
        return this._myCurrentlyPerformedTransition;
    }

    public hasBeenInit() {
        return this._myCurrentStateData != null;
    }

    public reset() {
        this.resetState();
        this.resetPendingPerforms();
    }

    public resetState() {
        this._myCurrentStateData = null;
    }

    public resetPendingPerforms() {
        this._myPendingPerforms = [];
    }

    public getCurrentState() {
        return this._myCurrentStateData;
    }

    public getCurrentTransitions() {
        return this.getTransitionsFromState(this._myCurrentStateData.myID);
    }

    public getCurrentTransitionsToState(stateID) {
        return this.getTransitionsFromStateToState(this._myCurrentStateData.myID, stateID);
    }

    public getState(stateID) {
        return this._myStates.get(stateID);
    }

    public getStates() {
        return this._myStates.values();
    }

    public getTransitions() {
        let transitions = [];

        for (let transitionsFromState of this._myTransitions.values()) {
            for (let transitionData of transitionsFromState.values()) {
                transitions.push(transitionData);
            }
        }

        return transitions;
    }

    public getTransitionsFromState(fromStateID) {
        let transitionsFromState = this._getTransitionsFromState(fromStateID);
        return Array.from(transitionsFromState.values());
    }

    public getTransitionsFromStateToState(fromStateID, toStateID) {
        let transitionsFromState = this._getTransitionsFromState(fromStateID);

        let transitionsToState = [];
        for (let transitionData of transitionsFromState.values()) {
            if (transitionData.myToState.myID == toStateID) {
                transitionsToState.push(transitionData);
            }
        }

        return transitionsToState;
    }

    public removeState(stateID) {
        if (this.hasState(stateID)) {
            this._myStates.delete(stateID);
            this._myTransitions.delete(stateID);

            for (let transitionsFromState of this._myTransitions.values()) {
                let toDelete = [];
                for (let [transitionID, transitionData] of transitionsFromState.entries()) {
                    if (transitionData.myToState.myID == stateID) {
                        toDelete.push(transitionID);
                    }
                }

                for (let transitionID of toDelete) {
                    transitionsFromState.delete(transitionID);
                }
            }

            return true;
        }
        return false;
    }

    public removeTransitionFromState(fromStateID, transitionID) {
        let fromTransitions = this._getTransitionsFromState(fromStateID);
        if (fromTransitions) {
            return fromTransitions.delete(transitionID);
        }

        return false;
    }

    public asState(stateID) {
        return this._myStates.has(stateID);
    }

    public hasTransitionFromState(fromStateID, transitionID) {
        let transitions = this.getTransitionsFromState(fromStateID);

        let transitionIndex = transitions.findIndex(function (transition) {
            return transition.myID == transitionID;
        });

        return transitionIndex >= 0;
    }

    public hasTransitionFromStateToState(fromStateID, toStateID, transitionID = null) {
        let transitions = this.getTransitionsFromStateToState(fromStateID, toStateID);

        let hasTransition = false;
        if (transitionID) {
            let transitionIndex = transitions.findIndex(function (transition) {
                return transition.myID == transitionID;
            });

            hasTransition = transitionIndex >= 0;
        } else {
            hasTransition = transitions.length > 0;
        }

        return hasTransition;
    }

    public setPerformMode(performMode) {
        this._myPerformMode = performMode;
    }

    public getPerformMode() {
        return this._myPerformMode;
    }

    public setPerformDelayedMode(performDelayedMode) {
        this._myPerformDelayedMode = performDelayedMode;
    }

    public getPerformDelayedMode() {
        return this._myPerformDelayedMode;
    }

    public hasPendingPerforms() {
        return this._myPendingPerforms.length > 0;
    }

    public getPendingPerforms() {
        return this._myPendingPerforms.pp_clone();
    }

    public clone(deepClone = false) {
        if (!this.isCloneable(deepClone)) {
            return null;
        }

        let cloneFSM = new FSM();

        cloneFSM._myLogEnabled = this._myLogEnabled;
        cloneFSM._myLogShowDelayedInfo = this._myLogShowDelayedInfo;
        cloneFSM._myLogFSMName = this._myLogFSMName;

        cloneFSM._myPerformMode = this._myPerformMode;
        cloneFSM._myPerformDelayedMode = this._myPerformDelayedMode;
        cloneFSM._myPendingPerforms = this._myPendingPerforms.pp_clone();

        for (let entry of this._myStates.entries()) {
            let stateData = null;

            if (deepClone) {
                stateData = new StateData(entry[1].myID, entry[1].myObject.clone());
            } else {
                stateData = new StateData(entry[1].myID, entry[1].myObject);
            }

            cloneFSM._myStates.set(stateData.myID, stateData);
        }

        for (let entry of this._myTransitions.entries()) {
            let transitionsFromState = new Map();
            cloneFSM._myTransitions.set(entry[0], transitionsFromState);

            for (let transitonEntry of entry[1].entries()) {
                let transitionData = null;

                let fromState = cloneFSM.getState(transitonEntry[1].myFromState.myID);
                let toState = cloneFSM.getState(transitonEntry[1].myToState.myID);

                if (deepClone) {
                    transitionData = new TransitionData(transitonEntry[1].myID, fromState, toState, transitonEntry[1].myObject.clone(), transitonEntry[1].mySkipStateFunction);
                } else {
                    transitionData = new TransitionData(transitonEntry[1].myID, fromState, toState, transitonEntry[1].myObject, transitonEntry[1].mySkipStateFunction);
                }

                transitionsFromState.set(transitionData.myID, transitionData);
            }
        }

        if (this._myCurrentStateData) {
            cloneFSM._myCurrentStateData = cloneFSM.getState(this._myCurrentStateData.myID);
        }

        return cloneFSM;
    }

    public isCloneable(deepClone = false) {
        if (!deepClone) {
            return true;
        }

        let deepCloneable = true;

        for (let entry of this._myStates.entries()) {
            deepCloneable = deepCloneable && entry[1].myObject.clone != null;
        }

        for (let entry of this._myTransitions.entries()) {
            for (let transitonEntry of entry[1].entries()) {
                deepCloneable = deepCloneable && transitonEntry[1].myObject.clone != null;
            }
        }

        return deepCloneable;
    }

    public setLogEnabled(active, fsmName = null, showDelayedInfo = false) {
        this._myLogEnabled = active;
        this._myLogShowDelayedInfo = showDelayedInfo;
        if (fsmName) {
            this._myLogFSMName = "FSM: ".concat(fsmName);
        }
    }

    public registerInitEventListener(listenerID, listener) {
        this._myInitEmitter.add(listener, { id: listenerID });
    }

    public unregisterInitEventListener(listenerID) {
        this._myInitEmitter.remove(listenerID);
    }

    public registerInitIDEventListener(initStateID, listenerID, listener) {
        let initStateIDEmitter = this._myInitIDEmitters.get(initStateID);
        if (initStateIDEmitter == null) {
            this._myInitIDEmitters.set(initStateID, new Emitter());
            initStateIDEmitter = this._myInitIDEmitters.get(initStateID);
        }

        initStateIDEmitter.add(listener, { id: listenerID });
    }

    public unregisterInitIDEventListener(initStateID, listenerID) {
        let initStateIDEmitter = this._myInitIDEmitters.get(initStateID);
        if (initStateIDEmitter != null) {
            initStateIDEmitter.remove(listenerID);

            if (initStateIDEmitter.isEmpty) {
                this._myInitIDEmitters.delete(initStateID);
            }
        }
    }

    public registerTransitionEventListener(listenerID: unknown, listener: (fsm: FSM, fromStateData: Readonly<StateData>, toStateData: Readonly<StateData>, transitionData: Readonly<TransitionData>, performMode: PerformMode, ...args: unknown[]) => void): void {
        this._myTransitionEmitter.add(listener, { id: listenerID });
    }

    public unregisterTransitionEventListener(listenerID: unknown): void {
        this._myTransitionEmitter.remove(listenerID);
    }

    /** The fsm IDs can be `null`, that means that the listener is called whenever only the valid IDs match
        This let you register to all the transitions with a specific ID and from of a specific state but to every state (`toStateID == null`) */
    public registerTransitionIDEventListener(fromStateID: unknown, toStateID: unknown, transitionID: unknown, listenerID: unknown, listener: (fsm: FSM, fromStateData: Readonly<StateData>, toStateData: Readonly<StateData>, transitionData: Readonly<TransitionData>, performMode: PerformMode, ...args: unknown[]) => void): void {
        let internalTransitionIDEmitter: Emitter<[FSM, Readonly<StateData>, Readonly<StateData>, Readonly<TransitionData>, PerformMode, unknown[]]> | null = null;
        for (const value of this._myTransitionIDEmitters) {
            if (value[0] == fromStateID && value[1] == toStateID && value[2] == transitionID) {
                internalTransitionIDEmitter = value[3];
                break;
            }
        }

        if (internalTransitionIDEmitter == null) {
            const transitionIDEmitter: [unknown, unknown, unknown, Emitter<[FSM, Readonly<StateData>, Readonly<StateData>, Readonly<TransitionData>, PerformMode, unknown[]]>] = [
                fromStateID,
                toStateID,
                transitionID,
                new Emitter()
            ];

            internalTransitionIDEmitter = transitionIDEmitter[3];

            this._myTransitionIDEmitters.push(transitionIDEmitter);
        }

        internalTransitionIDEmitter!.add(listener, { id: listenerID });
    }

    public unregisterTransitionIDEventListener(fromStateID: unknown, toStateID: unknown, transitionID: unknown, listenerID: unknown): void {
        let internalTransitionIDEmitter: Emitter<[FSM, Readonly<StateData>, Readonly<StateData>, Readonly<TransitionData>, PerformMode, unknown[]]> | null = null;
        for (const value of this._myTransitionIDEmitters) {
            if (value[0] == fromStateID && value[1] == toStateID && value[2] == transitionID) {
                internalTransitionIDEmitter = value[3];
                break;
            }
        }

        if (internalTransitionIDEmitter != null) {
            internalTransitionIDEmitter.remove(listenerID);

            if (internalTransitionIDEmitter.isEmpty) {
                this._myTransitionIDEmitters.pp_remove(element => element[0] == fromStateID && element[1] == toStateID && element[2] == transitionID);
            }
        }
    }

    private _perform(transitionID, performMode, ...args): boolean {
        if (this.isPerformingTransition()) {
            let currentlyPerformedTransition = this.getCurrentlyPerformedTransition();
            let consoleArguments = [this._myLogFSMName, "- Trying to perform:", transitionID];
            if (this._myLogShowDelayedInfo) {
                consoleArguments.push(performMode == PerformMode.DELAYED ? "- Delayed" : "- Immediate");
            }
            consoleArguments.push("- But another transition is currently being performed -", currentlyPerformedTransition.myID);
            console.warn(...consoleArguments);

            return false;
        }

        if (this._myCurrentStateData) {
            if (this.canPerform(transitionID)) {
                let transitions = this._myTransitions.get(this._myCurrentStateData.myID);
                let transitionToPerform = transitions.get(transitionID);

                this._myCurrentlyPerformedTransition = transitionToPerform;

                let fromState = this._myCurrentStateData;
                let toState = this._myStates.get(transitionToPerform.myToState.myID);

                if (this._myLogEnabled) {
                    let consoleArguments = [this._myLogFSMName, "- From:", fromState.myID, "- To:", toState.myID, "- With:", transitionID];
                    if (this._myLogShowDelayedInfo) {
                        consoleArguments.push(performMode == PerformMode.DELAYED ? "- Delayed" : "- Immediate");
                    }
                    console.log(...consoleArguments);
                }

                if (transitionToPerform.mySkipStateFunction != SkipStateFunction.END && transitionToPerform.mySkipStateFunction != SkipStateFunction.BOTH &&
                    fromState.myObject && fromState.myObject.end) {
                    fromState.myObject.end(this, transitionToPerform, ...args);
                }

                if (transitionToPerform.myObject && transitionToPerform.myObject.perform) {
                    transitionToPerform.myObject.perform(this, transitionToPerform, ...args);
                }

                if (transitionToPerform.mySkipStateFunction != SkipStateFunction.START && transitionToPerform.mySkipStateFunction != SkipStateFunction.BOTH &&
                    toState.myObject && toState.myObject.start) {
                    toState.myObject.start(this, transitionToPerform, ...args);
                }

                this._myCurrentStateData = transitionToPerform.myToState;

                this._myTransitionEmitter.notify(this, fromState, toState, transitionToPerform, performMode, ...args);

                if (this._myTransitionIDEmitters.length > 0) {
                    let internalTransitionIDEmitters = [];
                    for (let value of this._myTransitionIDEmitters) {
                        if ((value[0] == null || value[0] == fromState.myID) &&
                            (value[1] == null || value[1] == toState.myID) &&
                            (value[2] == null || value[2] == transitionToPerform.myID)) {
                            internalTransitionIDEmitters.push(value[3]);
                        }
                    }

                    for (let emitter of internalTransitionIDEmitters) {
                        emitter.notify(this, fromState, toState, transitionToPerform, performMode, ...args);
                    }
                }

                this._myCurrentlyPerformedTransition = null;

                return true;
            } else if (this._myLogEnabled) {
                let consoleArguments = [this._myLogFSMName, "- No Transition:", transitionID, "- From:", this._myCurrentStateData.myID];
                if (this._myLogShowDelayedInfo) {
                    consoleArguments.push(performMode == PerformMode.DELAYED ? "- Delayed" : "- Immediate");
                }
                console.warn(...consoleArguments);
            }
        } else if (this._myLogEnabled) {
            let consoleArguments = [this._myLogFSMName, "- FSM not initialized yet"];
            if (this._myLogShowDelayedInfo) {
                consoleArguments.push(performMode == PerformMode.DELAYED ? "- Delayed" : "- Immediate");
            }
            console.warn(...consoleArguments);
        }

        return false;
    }

    private _getTransitionsFromState(fromStateID: unknown): Map<unknown, Readonly<TransitionData>> | null {
        const transitions = this._myTransitions.get(fromStateID);
        return transitions != null ? transitions : null;
    }
}

class _PendingPerform {

    public myID: unknown;
    public myArgs: unknown[];

    constructor(transitionID: unknown, ...args: unknown[]) {
        this.myID = transitionID;
        this.myArgs = args;
    }
}