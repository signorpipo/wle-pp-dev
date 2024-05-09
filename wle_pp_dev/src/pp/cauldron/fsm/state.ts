import { FSM, StateData, TransitionData } from "./fsm.js";

/**
 * There is no need to implements this state, especially since states can simply be functions  
 * It's more like an example of what is needed
 * 
 * If you don't specify some functions the fsm will just skip them
 *
 * The param `state` is of type `StateData` and can be used to retrieve the `stateID` and other data  
 * The param `transition` is of type `TransitionData` and can be used to retrieve the `transitionID`, the from and to states and other data
 */
export interface State {

    /** Called every frame if this is the current state  
        You can retrieve this state data by calling `fsm.getCurrentState()` */
    update?(dt: number, fsm: FSM, ...args: unknown[]): void;

    /** Called when the fsm is started with this init state if no init transition object is specified or it does not have a `performInit` function  
        Since the state is set as the current one after the `init`, you can't use `fsm.getCurrentState()` to get it, so it is forwarded as a param */
    init?(fsm: FSM, state: Readonly<StateData>, ...args: unknown[]): void;

    /** Called when entering this state if no transition object is specified or it does not have a perform function  
        You can get this state data by accesing to the to state data inside the `transition` */
    start?(fsm: FSM, transition: Readonly<TransitionData>, ...args: unknown[]): void;

    /** Called when exiting this state if no transition function is specified
        You can get this state data by accesing to the from state data inside the `transition` */
    end?(fsm: FSM, transition: Readonly<TransitionData>, ...args: unknown[]): void;
}