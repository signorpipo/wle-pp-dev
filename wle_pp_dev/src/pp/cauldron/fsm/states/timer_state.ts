import { Timer } from "../../cauldron/timer.js";
import { FSM, StateData, TransitionData } from "../fsm.js";
import { State } from "../state.js";

export class TimerState implements State {

    private readonly _myTimer: Timer;

    private _myTransitionToPerformOnEnd: unknown;
    private _myTransitionArgs: unknown[];

    constructor(duration: number = 0, transitionToPerformOnEnd: unknown, ...transitionArgs: unknown[]) {
        this._myTransitionToPerformOnEnd = transitionToPerformOnEnd;
        this._myTransitionArgs = transitionArgs;

        this._myTimer = new Timer(duration, false);
    }

    setDuration(duration: number): void {
        this._myTimer.setDuration(duration);
    }

    setTransitionToPerformOnEnd(transitionToPerformOnEnd: unknown, ...transitionArgs: unknown[]): void {
        this._myTransitionToPerformOnEnd = transitionToPerformOnEnd;
        this._myTransitionArgs = transitionArgs;
    }

    onEnd(listener: () => void, id?: unknown): void {
        this._myTimer.onEnd(listener, id);
    }

    unregisterOnEnd(id?: unknown): void {
        this._myTimer.unregisterOnEnd(id);
    }

    update(dt: number, fsm: FSM): void {
        this._myTimer.update(dt);
        if (this._myTimer.isDone()) {
            if (this._myTransitionToPerformOnEnd != null) {
                fsm.perform(this._myTransitionToPerformOnEnd, ...this._myTransitionArgs);
            }
        }
    }

    start(fsm: FSM, transition: Readonly<TransitionData>, duration?: number, transitionToPerformOnEnd?: unknown, ...transitionArgs: unknown[]): void {
        this._myTimer.start(duration);

        if (transitionToPerformOnEnd != null) {
            this._myTransitionToPerformOnEnd = transitionToPerformOnEnd;
            this._myTransitionArgs = transitionArgs;
        }
    }

    init(fsm: FSM, state: StateData, duration?: number, transitionToPerformOnEnd?: unknown, ...transitionArgs: unknown[]): void {
        this._myTimer.start(duration);
        if (transitionToPerformOnEnd != null) {
            this._myTransitionToPerformOnEnd = transitionToPerformOnEnd;
            this._myTransitionArgs = transitionArgs;
        }
    }
}