// @flow


function _validate(rules: Object, state: Object): Object {
    return Object.keys(rules).reduce((validation: Object, key: string) => {
        if (typeof rules[key] === "function") {
            validation[key] = rules[key](state[key]);
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
        return isValid && _isValid(validation[key]);
    }, true);
}

export function stateValidation(stateMachine: StateMachine): StateMachine {
    let rules = {};
    let validatedStateMachine = {
        addRule: function (rule) {
            rules = Object.assign({}, rules, rule);
        },
        validate: function () {
            let state = stateMachine.currentState();
            return _validate(rules, state);
        },
        isValid: function(){
            return _isValid(this.validate());
        }

    };
    return Object.assign({}, stateMachine, validatedStateMachine);

}