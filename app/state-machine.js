_history = [{}];
_currentState = {};

function runStateTo(stateIndex){

    function _runToState(index, state){
        if (index === 0 ){
            return state;
        }
        const historyIndex = stateIndex - index + 1;
        const newState = Object.assign({}, state, _history[historyIndex]);
        return _runToState(index - 1, newState);
    }

    if(stateIndex >= _history.length ){
        throw error;
    }

    return _runToState(stateIndex, _history[0]);
}