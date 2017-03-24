export function stateIndex(stateMachine) {
    var index = 0;
    return {
        addState: function (state) {
            index += 1;
            return stateMachine.addState(state);
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
        }
    }
}