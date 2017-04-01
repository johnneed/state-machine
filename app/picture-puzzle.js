import {invariantCheck} from "./invariant-check";
import {stateValidation} from "./state-validation";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";
import {IndexedStateMachine} from "./indexed-state-machine";

const puzzle = document.getElementById("puzzle");
const resetStateButton = document.getElementById("resetStateButton");
const forwardStateButton = document.getElementById("forwardStateButton");
const backStateButton = document.getElementById("backStateButton");
const stateIndexDisplay = document.getElementById("stateIndexDisplay");
const shuffleButton = document.getElementById("shuffleButton");
const puzzleCompleted = document.getElementById("puzzleCompleted");
const puzzleSizeControl =document.getElementById("puzzleSize");

function generatePuzzle(tileCount: number, puzzleHash = []): Element[] {
    let _puzzleHash = Object.assign({}, puzzleHash);
    let key = Object.keys(puzzleHash).length + 1;
    if (tileCount <= 1) {
        _puzzleHash[key] = null;
        return _puzzleHash;
    }
    let tile = document.createElement("div");
    tile.classList.add("puzzle-piece");
    tile.classList.add(`position-${key}`);
    tile.id = `puzzlePiece${key}`;

    Rx.Observable.fromEvent(tile, "click").subscribe(moveTile(tile));
    _puzzleHash[key] = tile;
    return generatePuzzle(tileCount - 1, _puzzleHash)
}


// Very imperative here :-(
function addPuzzle(completedPuzzleState: Object, puzzleContainer: Element): void {

    let tiles = Object.keys(completedPuzzleState)
        .filter(key => completedPuzzleState[key] !== null)
        .map(key => completedPuzzleState[key]);

    while (puzzleContainer.hasChildNodes()) {
        puzzleContainer.removeChild(puzzleContainer.lastChild);
    }

    tiles.forEach(tile => {
        puzzleContainer.append(tile);
    })

}


/**
 * Checks a move to see if it's valid
 * @param {number} puzzleWidth - the number tiles in a row
 * @param {object} move - which tile moves where
 * @returns {boolean}
 */
function isValidMove(puzzleWidth: number, move: object): boolean {
    let keys = Object.keys(move);
    let distance = Math.abs(keys[0] - keys[1]);

    function isInSameRow(pos1: number, pos2: number, puzzleWidth: number): boolean {
        return Math.floor((pos1 - 1) / puzzleWidth) === Math.floor((pos2 - 1) / puzzleWidth);
    }

    return distance === puzzleWidth || (distance === 1 && isInSameRow(keys[0], keys[1], puzzleWidth));

}

function _markCompletion(element: Object, isComplete: boolean): void {
    if (isComplete) {
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
        if (numArr.length <= 1) {
            return 0;
        }
        return numArr.filter(num => numArr[0] > num).length + countInversions(numArr.slice(1), _puzzleWidth);
    }

    // If the grid width is odd, then the number of inversions in a solvable situation is even.
    //     If the grid width is even, and the blank is on an even row counting from the bottom (second-last, fourth-last etc), then the number of inversions in a solvable situation is odd.
    //     If the grid width is even, and the blank is on an odd row counting from the bottom (last, third-last, fifth-last etc) then the number of inversions in a solvable situation is even.
    //     That gives us this formula for determining invariance:
    //
    //     ( (grid width odd) && (#inversions even) )  ||  ( (grid width even) && ((blank on odd row from bottom) == (#inversions even)) )

    let inversionsCount = countInversions(tilePositions, puzzleWidth);
    let gridWidthIsEven = puzzleWidth / 2 === Math.floor(puzzleWidth / 2);
    let inversionsIsEven = inversionsCount / 2 === Math.floor(inversionsCount / 2);
    let rowCount = Math.ceil(Object.keys(initialState).length / puzzleWidth);
    let blankPosition = Object.keys(initialState).map((key, index) => (initialState[key] === null ? index + 1 : NaN)).find(num => !isNaN(num));
    let blankRowFromBottom = rowCount - Math.ceil(blankPosition / puzzleWidth) + 1;
    let blankOnOddRowFromBttom = blankRowFromBottom / 2 === Math.floor(blankRowFromBottom);
    return ( !gridWidthIsEven && inversionsIsEven ) || ( gridWidthIsEven && (blankOnOddRowFromBttom === inversionsIsEven));
}

function isCompleted(completedState, currentState) {
    return R.equals(completedState, currentState)
}


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

let _puzzleWidth = 4;
let markCompletion = R.curry(_markCompletion)(puzzleCompleted);
let moveTile = R.curry(_moveTile)(_puzzleWidth);
let _completedPuzzleState = generatePuzzle(Math.pow(_puzzleWidth, 2));
let stateMachine = invariantCheck(stateValidation(IndexedStateMachine.create(_completedPuzzleState)));

stateMachine.addInvariantRule(R.curry(validateTileInversions)(_completedPuzzleState)(_puzzleWidth));
stateMachine.addValidationRule({one: R.curry(isCompleted)(_completedPuzzleState)});
addPuzzle(_completedPuzzleState, puzzle);
render(stateMachine.returnState(), stateMachine.currentIndex());

Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveToState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveToState(-1));
Rx.Observable.fromEvent(resetStateButton, "click").subscribe(reset);
Rx.Observable.fromEvent(shuffleButton, "click").subscribe(shuffle);
Rx.Observable.fromEvent(puzzleSizeControl,"change").subscribe(generatePuzzle);
