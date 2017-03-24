var _history = [{}];

function runStateTo(stateIndex) {

    function _runToState(index, state) {
        if (index === 0) {
            return state;
        }
        const historyIndex = stateIndex - index + 1;
        const newState = Object.assign({}, state, _history[historyIndex]);
        return _runToState(index - 1, newState);
    }

    if (stateIndex >= _history.length || stateIndex < 0) {
        throw new Error("Invalid index");
    }

    return _runToState(stateIndex, _history[0]);
}

export var stateMachine = {
    addState: function (state) {
        _history = _history.append(state);
        return runState(_history.length);
    },
    returnState: function (wayBackNumber) {
        try {
            return runToState(_history.length - wayBackNumber);
        } catch (err) {
            _history.slice(-1);
        }
    }
};