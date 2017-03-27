// @flow


function _checkInvariants(rules: Object, state: Object): Object {
    return Object.keys(rules).reduce((validation: Object, key: string) => {
        if (typeof rules[key] === "function") {
            validation[key] = rules[key](state[key]);
            return validation;
        }
        if (typeof rules[key] === "object" && typeof state[key] === "object") {
            validation[key] = _checkInvariants(rules[key], state[key]);
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
        return isValid && _isValid(validation[key]);
    }, true);
}

export function invariantCheck(stateMachine: SequentialStateMachine): SequentialStateMachine {
    let rules = {};
    let invariantStateMachine = {
        addInvariantRule: function (rule) {
            rules = Object.assign({}, rules, rule);
        },
        newStateIsValid: function (state) {
            return _isValid(state);
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