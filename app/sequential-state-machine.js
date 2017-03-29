// @flow

import {default as R} from "ramda";

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

export class SequentialStateMachine {

    static create(initialState): SequentialStateMachine {
        return new SequentialStateMachine(initialState);
    }

    constructor(initialState) {
        this.addSequence = this.addSequence.bind(this);
        this.returnState = this.returnState.bind(this);
        this.size = this.size.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
        this.destroy = this.destroy.bind(this);
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

    returnState(index: ?number): Object {
        let _index = index || _history.get(this).length - 1; // return the last state if no index provided
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
        return runTo(_history, 0);
    }

    destroy(): void {
        _history.delete(this);
    }
}