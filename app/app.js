import {stateMachine} from "./state-machine";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";
import {stateIndex} from "./state-index";

const numberBox = document.getElementById("numberBox");
const wordBox = document.getElementById("wordBox");
const truncateStateButton = document.getElementById("truncateStateButton");
const resetStateButton = document.getElementById("resetStateButton");
const forwardStateButton = document.getElementById("forwardStateButton");
const backStateButton = document.getElementById("backStateButton");
const numberDisplay = document.getElementById("numberDisplay");
const wordDisplay = document.getElementById("wordDisplay");
const stateIndexDisplay = document.getElementById("stateIndexDisplay");
const myStateMachine = stateIndex(stateMachine);

function render(state) {
    numberDisplay.innerHTML = numberBox.value = isNaN(state.number) ? "" : state.number;
    wordDisplay.innerHTML = wordBox.value = typeof state.word === "string" ? state.word : "";
    stateIndexDisplay.innerHTML = myStateMachine.currentIndex();
    backStateButton.disabled = myStateMachine.currentIndex() === 0;
    forwardStateButton.disabled = myStateMachine.isLastState();
    return state;
}

function moveState(velocity) {
    return function () {
        return render(myStateMachine.moveState(velocity));
    }
}

function reset() {

    return render(myStateMachine.reset());
}

let addState = R.curry((key, event) => {
    var newState = {};
    newState[key] = event.target.value;
    return render(myStateMachine.addState(newState));
});

Rx.Observable.fromEvent(wordBox, "keyup").subscribe(addState("word"));
Rx.Observable.fromEvent(numberBox, "keyup").subscribe(addState("number"));
Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveState(-1));
Rx.Observable.fromEvent(resetStateButton, "click").subscribe(reset);

render(myStateMachine.currentState());

