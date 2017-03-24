var _history = [{}];

function runStateTo(stateIndex) {

    function _run(index, state) {
        if (index === 0) {
            return state;
        }
        const historyIndex = stateIndex - index + 1;
        const newState = Object.assign({}, state, _history[historyIndex]);
        return _run(index - 1, newState);
    }

    if (stateIndex >= _history.length || stateIndex < 0) {
        throw new Error("Invalid index");
    }

    return _run(stateIndex, _history[0]);
}

export var stateMachine = {
    addState: function (state) {
        _history = _history.concat(state);
        return runStateTo(_history.length - 1);
    },
    returnState: function (index) {
        try {
            return runStateTo(index);
        } catch (err) {
            _history.slice(-1);
        }
    }
};