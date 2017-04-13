// @flow


let _history = new WeakMap();

function diffState(history: array, state: array): boolean {
    let currentHistory = runTo(history, history.length - 1);
    let proposedHistory = runTo(history.concat(state), history.length);
    return R.equals(currentHistory, proposedHistory);
}

function runTo(history: Object, stateIndex: number): Object {

    function _run(index: number, state: Object) {
        if (index === 0) {
            return Object.assign({}, state);
        }
        const historyIndex = stateIndex - index + 1;
        const newState = Object.assign({}, state, history[historyIndex]);
        return _run(index - 1, newState);
    }

    if (stateIndex >= history.length || stateIndex < 0) {
        throw new Error("Invalid index");
    }

    return _run(stateIndex, history[0]);
}

class SequentialStateMachine {

    static create(initialState): SequentialStateMachine {
        return new SequentialStateMachine(initialState);
    }

    constructor(initialState) {
        this.addSequence = this.addSequence.bind(this);
        this.returnState = this.returnState.bind(this);
        this.size = this.size.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
        this.destroy = this.destroy.bind(this);
        this.setInitialState = this.setInitialState.bind(this);
        this.calculateState = this.calculateState.bind(this);
        _history.set(this, [(initialState || {})]);
    }

    addSequence(sequence, index): Object {
        let myHistory = _history.get(this);
        let historyPart = myHistory.slice(0, (typeof index === "number" ? index + 1 : myHistory.length));
        if (!diffState(historyPart, sequence)) {
            historyPart = historyPart.concat(sequence);
            _history.set(this, historyPart);
        }
        return runTo(historyPart, historyPart.length - 1);
    }

    calculateState(sequence, index): Object {
        let myHistory = _history.get(this);
        let historyPart = myHistory.slice(0, (typeof index === "number" ? index + 1 : myHistory.length));
        if (!diffState(historyPart, sequence)) {
            historyPart = historyPart.concat(sequence);
            _history.set(this, historyPart);
        }
        return runTo(historyPart, historyPart.length - 1);
    }

    setInitialState(state: Object): Object {
        _history.set(this, [state]);
        return runTo(_history.get(this), 0);
    }

    returnState(index: ?number): Object {
        let _index = isNaN(index) ? _history.get(this).length - 1 : Number(index); // return the last state if no index provided
        try {
            return runTo(_history.get(this), _index);
        } catch (err) {
            return runTo(_history.get(this), _history.get(this).length - 1);
        }
    }

    size(): number {
        return _history.get(this).length;
    }

    clearHistory(): Object {
        let myHistory = _history.get(this);
        _history.set(this, [myHistory[0]]);
        return runTo(_history.get(this), 0);
    }

    destroy(): void {
        _history.delete(this);
    }
}

// State Validation


function _validate(rules: Object, state: Object): Object {
    return Object.keys(rules).reduce((validation: Object, key: string) => {
        if (typeof rules[key] === "function") {
            validation[key] = rules[key](state);
            return validation;
        }
        if (typeof rules[key] === "object" && typeof state[key] === "object") {
            validation[key] = _validate(rules[key], state[key]);
            return validation;
        }
        return validation;
    }, {});
}

function _isValid(validation): boolean {
    return Object.keys(validation).reduce((isValid, key) => {
        if (typeof validation[key] === "boolean") {
            return isValid && validation[key];
        }
        return isValid && (typeof validation[key] === "undefined" || _isValid(validation[key]));
    }, true);
}

function stateValidation(stateMachine: SequentialStateMachine): SequentialStateMachine {
    let rules = {};
    let validatedStateMachine = {
        addValidationRule: function (rule): void {
            rules = Object.assign({}, rules, rule);
        },
        validate: function (): object {
            let state = stateMachine.currentState();
            return _validate(rules, state);
        },
        isValid: function (): boolean {
            return _isValid(this.validate());
        }
    };
    return Object.assign({}, stateMachine, validatedStateMachine);

}


let _indexCache = new WeakMap();

class IndexedStateMachine extends SequentialStateMachine {

    static create(initialState) {
        return new IndexedStateMachine(initialState);
    }

    constructor(initialState) {
        super(initialState || {});
        this.addSequence = this.addSequence.bind(this);
        this.moveToState = this.moveToState.bind(this);
        this.currentIndex = this.currentIndex.bind(this);
        this.currentState = this.currentState.bind(this);
        this.isLastState = this.isLastState.bind(this);
        this.destroy = this.destroy.bind(this);
        this.reset = this.reset.bind(this);
        this.setInitialState = this.setInitialState.bind(this);
        _indexCache.set(this, 0);
    }

    addSequence(sequence): Object {
        let _state = super.addSequence(sequence, _indexCache.get(this));
        _indexCache.set(this, (super.size() - 1));
        return _state;
    }

    moveToState(velocity: number): Object {
        let newIndex = _indexCache.get(this) + velocity;
        if (newIndex >= 0 && newIndex < this.size()) {
            _indexCache.set(this, newIndex);
            return super.returnState(newIndex);
        }
        return super.returnState(_indexCache.get(this));
    }

    currentIndex(): number {
        return _indexCache.get(this);
    }

    currentState(): Object {
        return super.returnState(_indexCache.get(this));
    }

    isLastState(): boolean {
        return super.size() === _indexCache.get(this) + 1;
    }

    setInitialState(state: Object): Object {
        _indexCache.set(this, 0);
        return super.setInitialState(state);
    }

    reset(): Object {
        _indexCache.set(this, 0);
        return super.clearHistory();
    }

    destroy(): void {
        _indexCache.delete(this);
        super.destroy();
    }
}


function _isValidNewState(rules, state): boolean {
    return rules.reduce((isValid, rule) => {
        return isValid && rule(state);
    }, true);
}

function invariantCheck(stateMachine: SequentialStateMachine): SequentialStateMachine {
    let rules = [];
    let invariantStateMachine = {
        addInvariantRule: function (rule) {
            rules = rules.concat(rule);
        },
        newStateIsValid: function (state) {
            return _isValidNewState(rules, state);
        },
        addState: function (state): boolean {
            if (_isValidNewState(rules, state)) {
                stateMachine.addState(state);
                return true
            }
            return false;
        },
        setInitialState: function (state: Object): boolean {
            if (_isValidNewState(rules, state)) {
                stateMachine.setInitialState(state);
                console.log("state passed invariant check - huzzah!");

                return true;
            }
            console.log("state failed invariant check - try again");
            return false;
        }

    };
    return Object.assign({}, stateMachine, invariantStateMachine);
}


const puzzleContainer = document.getElementById("puzzle");
const resetStateButton = document.getElementById("resetStateButton");
const forwardStateButton = document.getElementById("forwardStateButton");
const backStateButton = document.getElementById("backStateButton");
const stateIndexDisplay = document.getElementById("stateIndexDisplay");
const shuffleButton = document.getElementById("shuffleButton");
const puzzleCompletedMessagePanel = document.getElementById("puzzleCompletedMessage");
const puzzleSizeControl = document.getElementById("puzzleSize");
let puzzle;

/**
 * Checks a move to see if it's valid
 * @param {number} puzzleWidth - the number tiles in a row
 * @param {object} move - which tile moves where
 * @returns {boolean}
 */
function _isValidMove(puzzleWidth: number, move: object): boolean {
    let keys = Object.keys(move);
    let distance = Math.abs(keys[0] - keys[1]);

    function isInSameRow(pos1: number, pos2: number, puzzleWidth: number): boolean {
        return Math.floor((pos1 - 1) / puzzleWidth) === Math.floor((pos2 - 1) / puzzleWidth);
    }

    return distance === puzzleWidth || (distance === 1 && isInSameRow(keys[0], keys[1], puzzleWidth));
}

/**
 *
 * @param element
 * @param isComplete
 * @private
 */
function _markCompletion(element: Object, isComplete: boolean): void {
    if (isComplete) {
        element.classList.add("is-complete");
    } else {
        element.classList.remove("is-complete");
    }
}
function computeMove(state, puzzlePiece): Object {
    function findTilePosition(state: Object, puzzlePiece = null): Object {
        return Object.keys(state).find(key => {
            return state[key] === puzzlePiece;
        });
    }
    let emptyPosition = findTilePosition(state);
    let tilePosition = findTilePosition(state, puzzlePiece);
    let move = {};
    move[emptyPosition] = state[tilePosition];
    move[tilePosition] = null;
    return move;
}
/**
 *
 * @param isValidMove
 * @param markCompletion
 * @param stateMachine
 * @param puzzleWidth
 * @param puzzlePiece
 * @returns {Function}
 * @private
 */
function _moveTile(render: Function, isValidMove: Function, markCompletion: Function, stateMachine: Object, puzzleWidth: Number, puzzlePiece: Object): void {
    return function () {
        let currentState = stateMachine.currentState();
        let move = computeMove(currentState, puzzlePiece);
        if (isValidMove(move)) {
            stateMachine.addSequence(move);
            markCompletion(stateMachine.isValid());
            return render(stateMachine.returnState(), stateMachine.currentIndex());
        }
    };
}

function _generatePuzzle(moveTile: Function, tileCount: number, puzzleHash = []): Element[] {
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
    return _generatePuzzle(moveTile, tileCount - 1, _puzzleHash)
}

function _moveToState(render: Function, markCompletion: Function, stateMachine: object, velocity: number): Object {
    return function () {
        markCompletion(stateMachine.isValid());
        return render(stateMachine.moveToState(velocity), stateMachine.currentIndex());
    }
}

function _reset(render: Function, stateMachine: Object): void {
    return function () {
        render(stateMachine.reset());
    };
}

function _render(state: Object, index = 0): void {
    Object.keys(state).forEach(key => {
        if (state[key] !== null) {
            state[key].className = `puzzle-piece position-${key}`;
        }
    });

    stateIndexDisplay.innerHTML = index;
}

function _randomizeState(initialState: Object): Object {
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

function _shuffle(randomizeState: Function, markCompletion: Function, render: Function, stateMachine: Object, completedPuzzleState: Object): void {
    return function () {
        if (stateMachine.setInitialState(randomizeState(completedPuzzleState))) {
            markCompletion(stateMachine.isValid());
            return render(stateMachine.currentState());
        }
        return _shuffle(randomizeState, markCompletion, render, stateMachine, completedPuzzleState)();
    };
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
    });

    puzzleContainer.className = Array.from(puzzleContainer.classList)
        .filter(className => !(/puzzle-\d/).test(className))
        .concat(`puzzle-${Math.sqrt(tiles.length + 1)}`)
        .join(" ");
}

function _validateTileInversions(initialState: object, puzzleWidth: number, state: object): boolean {
    let pieceOrder = Object.keys(initialState).filter(key => initialState[key] !== null).reduce((wmap, key) => {
        wmap.set(initialState[key], Number(key));
        return wmap;
    }, (new WeakMap()));
    let tilePositions = Object.keys(state).filter(key => state[key] !== null).map(key => pieceOrder.get(state[key]));

    function countInversions(numArr: number[], _puzzleWidth: number): number {
        if (numArr.length <= 1) {
            return 0;
        }
        return numArr.filter(num => Number(numArr[0]) > Number(num)).length + countInversions(numArr.slice(1), _puzzleWidth);
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
    let blankOnOddRowFromBttom = blankRowFromBottom / 2 !== Math.floor(blankRowFromBottom/2);
    return ( !gridWidthIsEven && inversionsIsEven ) || ( gridWidthIsEven && (blankOnOddRowFromBttom === inversionsIsEven));
}

function _isCompleted(completedState, currentState) {
    return R.equals(completedState, currentState)
}



function initializePuzzle(size: number = 3): void {
    puzzle = new Puzzle(size, puzzleContainer, puzzleCompletedMessagePanel, forwardStateButton, backStateButton, resetStateButton, shuffleButton);
}

class Puzzle {
    constructor(size, puzzleContainer, puzzleCompletedMessagePanel, forwardStateButton, backStateButton, resetStateButton, shuffleButton) {
        const markCompletion = R.curry(_markCompletion)(puzzleCompletedMessagePanel);
        const render = _render;
        const isValidMove = R.curry(_isValidMove)(size);
        let stateMachine = invariantCheck(stateValidation(IndexedStateMachine.create()));
        const moveTile = R.curry(_moveTile)(render)(isValidMove)(markCompletion)(stateMachine)(size);
        const completedPuzzleState = _generatePuzzle(moveTile, Math.pow(size, 2));
        stateMachine.addInvariantRule(R.curry(_validateTileInversions)(completedPuzzleState)(size));
        stateMachine.addValidationRule({one: R.curry(_isCompleted)(completedPuzzleState)});
        const moveToState = R.curry(_moveToState)(render)(markCompletion)(stateMachine);
        const reset = _reset(render, stateMachine);
        const randomizeState = _randomizeState(completedPuzzleState);
        const shuffle = _shuffle(_randomizeState, markCompletion, render, stateMachine, completedPuzzleState);
        stateMachine.setInitialState(completedPuzzleState);
        addPuzzle(completedPuzzleState, puzzleContainer);
        render(stateMachine.returnState(), stateMachine.currentIndex());
        Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveToState(1));
        Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveToState(-1));
        Rx.Observable.fromEvent(resetStateButton, "click").subscribe(reset);
        Rx.Observable.fromEvent(shuffleButton, "click").subscribe(shuffle);
        puzzleCompletedMessagePanel.classList.remove("is-complete");
    }
}

Rx.Observable.fromEvent(puzzleSizeControl, "change").subscribe((event) => {
    const puzzleSize = Math.floor(Number(event.target.value));
    if (puzzleSize <= 6 && puzzleSize >= 3)
    {
        return initializePuzzle(puzzleSize);
    }
});

initializePuzzle(3);