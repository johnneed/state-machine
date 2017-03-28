import {invariantCheck} from "./invariant-check";
import {stateValidation} from "./state-validation";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";

import {SequentialStateMachine} from "./sequential-state-machine";

let puzzlePiece1 = document.getElementById("puzzlePiece1");
let puzzlePiece2 = document.getElementById("puzzlePiece2");
let puzzlePiece3 = document.getElementById("puzzlePiece3");
let puzzlePiece4 = document.getElementById("puzzlePiece4");
let puzzlePiece5 = document.getElementById("puzzlePiece5");
let puzzlePiece6 = document.getElementById("puzzlePiece6");
let puzzlePiece7 = document.getElementById("puzzlePiece7");
let puzzlePiece8 = document.getElementById("puzzlePiece8");

let initialState = {
    1: puzzlePiece1,
    2: puzzlePiece2,
    3: puzzlePiece3,
    4: puzzlePiece4,
    5: puzzlePiece5,
    6: puzzlePiece6,
    7: puzzlePiece7,
    8: puzzlePiece8,
    9: null
};

let stateMachine = invariantCheck(stateValidation(SequentialStateMachine.create(initialState)));

/**
 * Checks a move to see if it's valid in 3x3 puzzle
 * @param move
 * @returns {boolean}
 */
function isValidMove(move: object): boolean {
    let keys = Object.keys(move);
    let distance = Math.abs(keys[0] - keys[1]);
    return distance === 1 || distance === 3;
}


function hasEvenTileInverions(state: object):boolean {
    let pieceOrder = Object.keys(initialState).reduce((key,wmap) =>{
        wmap.set(initialState[key], key);
    },(new WeakMap()));
}


stateMachine.addInvariantRule(hasEvenTileInverions);

function findTilePosition(state, puzzlePiece = null) {
    return Object.keys(state).find(key => {
        return state[key] === puzzlePiece;
    });
}

function stateChanges(state, puzzlePiece) {
    let emptyPosition = findTilePosition(state);
    let tilePosition = findTilePosition(state, puzzlePiece);
    let newState = {};
    newState[emptyPosition] = state[tilePosition];
    newState[tilePosition] = null;
    return newState;
}

function render(state: object): void {
    Object.keys(state).forEach(key => {
        if (state[key] !== null) {
            state[key].className = `puzzle-piece position-${key}`;
        }
    });
}

function moveTile(puzzlePiece) {
    return function () {
        let currentState = stateMachine.returnState();
        let newState = stateChanges(currentState, puzzlePiece);
        stateMachine.addSequence(newState);
        if (stateMachine.newStateIsValid(newState)) {
            return render(stateMachine.returnState());
        }
        stateMachine.returnState(-1);
    };
}


Rx.Observable.fromEvent(puzzlePiece1, "click").subscribe(moveTile(puzzlePiece1));
Rx.Observable.fromEvent(puzzlePiece2, "click").subscribe(moveTile(puzzlePiece2));
Rx.Observable.fromEvent(puzzlePiece3, "click").subscribe(moveTile(puzzlePiece3));
Rx.Observable.fromEvent(puzzlePiece4, "click").subscribe(moveTile(puzzlePiece4));
Rx.Observable.fromEvent(puzzlePiece5, "click").subscribe(moveTile(puzzlePiece5));
Rx.Observable.fromEvent(puzzlePiece6, "click").subscribe(moveTile(puzzlePiece6));
Rx.Observable.fromEvent(puzzlePiece7, "click").subscribe(moveTile(puzzlePiece7));
Rx.Observable.fromEvent(puzzlePiece8, "click").subscribe(moveTile(puzzlePiece8));

