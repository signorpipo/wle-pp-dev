import { FSM, StateData, TransitionData } from "./fsm.js";

/**
 * There is no need to inherit from this transition, especially since transitions can simply be functions  
 * It's more like an example of what is needed
 * 
 * If you don't specify some functions the fsm will just skip them
 * 
 * The `initState` param is of type `StateData` and can be used to retrieve the `stateID` and other data  
 * The param `transition` is of type `TransitionData` and can be used to retrieve the `transitionID` and other data
 */
export interface Transition {

    /** Called if this is used as an init transition for the fsm */
    performInit?(fsm: FSM, initState: Readonly<StateData>, ...args: unknown[]): void;

    /** Called when performing a transition
        You can find the from and to states inside the `transition` param*/
    perform?(fsm: FSM, transition: Readonly<TransitionData>, ...args: unknown[]): void;
}