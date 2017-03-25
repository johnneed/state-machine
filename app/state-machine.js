import {default as R} from "ramda";

var _history = [{}];

function diffState(history, state) {
    var currentHistory = runStateTo(history, history.length - 1);
    var proposedHistory = runStateTo(history.concat(state), history.length);
    return R.equals(currentHistory, proposedHistory);
}

function runStateTo(history, stateIndex) {

    function _run(index, state) {
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

export var stateMachine = {
    addState: function (state, index) {
        var historyPart = _history.slice(0, (typeof index === "number" ? index + 1 : _history.length));
        if (!diffState(historyPart, state)) {
            historyPart = historyPart.concat(state);
            _history = historyPart;
        }
        return runStateTo(historyPart, historyPart.length - 1);
    },
    returnState: function (index) {
        try {
            return runStateTo(_history, index);
        } catch (err) {
            return runStateTo(_history, _history.length - 1);
        }
    },
    size: function () {
        return _history.length;
    },
    clearHistory: function () {
        _history = [{}];
        return runStateTo(_history, 0);
    }
};