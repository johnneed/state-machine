import {invariantCheck} from "./invariant-checknt-check";
import {stateValidation} from "./state-validation";
import {SequentialStateMachine} from "./sequential-state-machine";

var intialState = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: null};
var stateMachine = invariantCheck(stateValdiation(SequentialStateMachine.create(initialState)));

function findTilePosition(state, tileNumber = null){
   return Object.keys(state).find(key => {return state[key]  === null});
}

function stateChanges(state, tileNumber){
    let emptyPosition = findTilePosition(state);
    let tilePosition = findTilePosition(state, tileNumber);
    let newState = {};
    newState[emptyPosition] = state[tilePosition];
    newState[tilePosition] = null;
    return newState;
}

function moveTile(tileNumber){
    var currentState = stateMachine.getCurrentState();
    stateMachine.addState(stateChanges(currentState,tileNumber));
}