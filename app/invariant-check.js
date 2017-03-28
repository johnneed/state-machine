// @flow


function _isValidNewState(rules, state): boolean {
    return rules.reduce((isValid, rule) => {
        return isValid && rule(state);
    }, true);
}

export function invariantCheck(stateMachine: SequentialStateMachine): SequentialStateMachine {
    let rules = [];
    let invariantStateMachine = {
        addInvariantRule: function (rule) {
            rules = rules.concat(rule);
        },
        newStateIsValid: function (state) {
            return _isValidNewState(rules, state);
        },
        addState: function (state): boolean {
            if (this.newStateIsValid(state)) {
                stateMachine.addState(state);
                return true
            }
            return false;
        }

    };
    return Object.assign({}, stateMachine, invariantStateMachine);
}