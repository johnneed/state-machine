import {invariantCheck} from "./invariant-check";
import {stateValidation} from "./state-validation";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";
import {IndexedStateMachine} from "./indexed-state-machine";

let puzzlePiece1 = document.getElementById("puzzlePiece1");
let puzzlePiece2 = document.getElementById("puzzlePiece2");
let puzzlePiece3 = document.getElementById("puzzlePiece3");
let puzzlePiece4 = document.getElementById("puzzlePiece4");
let puzzlePiece5 = document.getElementById("puzzlePiece5");
let puzzlePiece6 = document.getElementById("puzzlePiece6");
let puzzlePiece7 = document.getElementById("puzzlePiece7");
let puzzlePiece8 = document.getElementById("puzzlePiece8");

const resetStateButton = document.getElementById("resetStateButton");
const forwardStateButton = document.getElementById("forwardStateButton");
const backStateButton = document.getElementById("backStateButton");
const stateIndexDisplay = document.getElementById("stateIndexDisplay");
const shuffleButton = document.getElementById("shuffleButton");
const puzzleCompleted = document.getElementById("puzzleCompleted");

let _completedPuzzleState = {
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

let _puzzleWidth = 3;

let stateMachine = invariantCheck(stateValidation(IndexedStateMachine.create(_completedPuzzleState)));

/**
 * Checks a move to see if it's valid
 * @param {number} puzzleWidth - the number tiles in a reow
 * @param {object} move - which tile moves where
 * @returns {boolean}
 */
function isValidMove(puzzleWidth: number, move: object): boolean {
    let keys = Object.keys(move);
    let distance = Math.abs(keys[0] - keys[1]);

    function isInSameRow(pos1: number, pos2: number, puzzleWidth: number): boolean {
        return Math.floor((pos1 - 1) / puzzleWidth) === Math.floor((pos2 - 1) / puzzleWidth);
    }

    return distance === 3 || (distance === 1 && isInSameRow(keys[0], keys[1], puzzleWidth));

}

function _markCompletion(element: Object, isComplete: boolean): void {
    if(isComplete){
        element.classList.add("is-complete");
    } else {
        element.classList.remove("is-complete");
    }
}

function validateTileInversions(initialState: object, puzzleWidth: number, state: object): boolean {
    let pieceOrder = Object.keys(initialState).filter(key => initialState[key] !== null).reduce((wmap, key) => {
        wmap.set(initialState[key], key);
        return wmap;
    }, (new WeakMap()));
    let tilePositions = Object.keys(state).sort().filter(key => state[key] !== null).map(key => pieceOrder.get(state[key]));

    function countInversions(numArr: number[], _puzzleWidth: number): number {
        let count;
        if (numArr.length <= 1) {
            return 0;
        }
        count = numArr.filter(num => numArr[0] > num).length + countInversions(numArr.slice(1), _puzzleWidth);
        return (count / (_puzzleWidth - 1)) === Math.floor(count / (_puzzleWidth - 1));
    }

    return countInversions(tilePositions, puzzleWidth);
}

function isCompleted(completedState, currentState) {
    return R.equals(completedState, currentState)
}

stateMachine.addInvariantRule(R.curry(validateTileInversions)(_completedPuzzleState)(_puzzleWidth));
stateMachine.addValidationRule({one: R.curry(isCompleted)(_completedPuzzleState)});


function findTilePosition(state: Object, puzzlePiece = null): Object {
    return Object.keys(state).find(key => {
        return state[key] === puzzlePiece;
    });
}

function computeMove(state, puzzlePiece): Object {
    let emptyPosition = findTilePosition(state);
    let tilePosition = findTilePosition(state, puzzlePiece);
    let move = {};
    move[emptyPosition] = state[tilePosition];
    move[tilePosition] = null;
    return move;
}

function render(state: Object, index = 0): void {
    Object.keys(state).forEach(key => {
        if (state[key] !== null) {
            state[key].className = `puzzle-piece position-${key}`;
        }
    });

    stateIndexDisplay.innerHTML = index;
}


function reset(): void {
    render(stateMachine.reset());
}

function randomizeState(initialState: Object): Object {
    function randomize(countdown: number, state: Object) {
        if (countdown <= 0) {
            return state;
        }
        let tileCount = Object.keys(state).length;
        let pos1 = Math.round(Math.random() * (tileCount - 1) + 1);
        let pos2 = Math.round(Math.random() * (tileCount - 1) + 1);
        let transition1 = {};
        let transition2 = {};
        transition1[pos1] = state[pos2];
        transition2[pos2] = state[pos1];
        return randomize(countdown - 1, Object.assign({}, state, transition1, transition2));
    }

    let totalCycles = Object.keys(initialState).length * 3;
    return randomize(totalCycles, initialState);
}

function moveToState(velocity): Object {
    return function () {
        markCompletion(stateMachine.isValid());
        return render(stateMachine.moveToState(velocity), stateMachine.currentIndex());
    }
}

function _moveTile(puzzleWidth: Number, puzzlePiece: Object): void {
    return function () {
        let currentState = stateMachine.currentState();
        let move = computeMove(currentState, puzzlePiece);
        if (isValidMove(puzzleWidth, move)) {
            stateMachine.addSequence(move);
            markCompletion(stateMachine.isValid());
            return render(stateMachine.returnState(), stateMachine.currentIndex());
        }
    };
}

function shuffle(): void {
    if (stateMachine.setInitialState(randomizeState(_completedPuzzleState))) {
        markCompletion(stateMachine.isValid());
        return render(stateMachine.currentState());
    }
    shuffle();
}

let markCompletion = R.curry(_markCompletion)(puzzleCompleted);


let moveTile = R.curry(_moveTile)(3);

render(stateMachine.returnState(), stateMachine.currentIndex());

Rx.Observable.fromEvent(puzzlePiece1, "click").subscribe(moveTile(puzzlePiece1));
Rx.Observable.fromEvent(puzzlePiece2, "click").subscribe(moveTile(puzzlePiece2));
Rx.Observable.fromEvent(puzzlePiece3, "click").subscribe(moveTile(puzzlePiece3));
Rx.Observable.fromEvent(puzzlePiece4, "click").subscribe(moveTile(puzzlePiece4));
Rx.Observable.fromEvent(puzzlePiece5, "click").subscribe(moveTile(puzzlePiece5));
Rx.Observable.fromEvent(puzzlePiece6, "click").subscribe(moveTile(puzzlePiece6));
Rx.Observable.fromEvent(puzzlePiece7, "click").subscribe(moveTile(puzzlePiece7));
Rx.Observable.fromEvent(puzzlePiece8, "click").subscribe(moveTile(puzzlePiece8));
Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveToState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveToState(-1));
Rx.Observable.fromEvent(resetStateButton, "click").subscribe(reset);
Rx.Observable.fromEvent(shuffleButton, "click").subscribe(shuffle);

