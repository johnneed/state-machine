export function stateIndex(stateMachine) {
    var index = 0;
    return {
        addState: function (state) {
            var _state =  stateMachine.addState(state, index);
            index = stateMachine.size() - 1;
            return _state;
        },
        moveState: function (wayBackNumber) {
            index += wayBackNumber;
            return stateMachine.returnState(index);
        },
        currentIndex: function () {
            return index;
        },
        currentState: function(){
            return stateMachine.returnState(index);
        },
        isLastState: function(){
            return stateMachine.size() === index + 1;
        },
        reset: function(){
            index = 0;
            return stateMachine.clearHistory();
        }
    }
}