import { FSM, StateData, TransitionData } from "../../fsm.js";
import { BaseConditionState } from "./base_condition_state.js";

export class ConditionState extends BaseConditionState {

    constructor(conditionCallback: () => boolean, transitionToPerformOnEnd: unknown, ...transitionArgs: unknown[]) {
        super(conditionCallback, transitionToPerformOnEnd, ...transitionArgs);
    }

    public setConditionCallback(conditionCallback: () => boolean): void {
        super._setConditionCallback(conditionCallback);
    }

    public update(dt: number, fsm: FSM): void {
        this._update(dt, fsm);
    }

    public start(fsm: FSM, transition: Readonly<TransitionData>, conditionCallback?: () => boolean, transitionToPerformOnEnd?: unknown, ...transitionArgs: unknown[]): void {
        this._start(fsm, transition, conditionCallback, transitionToPerformOnEnd, ...transitionArgs);
    }

    public init(fsm: FSM, state: StateData, conditionCallback?: () => boolean, transitionToPerformOnEnd?: unknown, ...transitionArgs: unknown[]): void {
        this._init(fsm, state, conditionCallback, transitionToPerformOnEnd, ...transitionArgs);
    }
}