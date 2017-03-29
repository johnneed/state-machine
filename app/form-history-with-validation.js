import {IndexedStateMachine} from "./indexed-state-machine";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";
import {stateValidation} from "./state-validation";

const numberBox = document.getElementById("numberBox");
const wordBox = document.getElementById("wordBox");;
const resetStateButton = document.getElementById("resetStateButton");
const forwardStateButton = document.getElementById("forwardStateButton");
const backStateButton = document.getElementById("backStateButton");
const numberDisplay = document.getElementById("numberDisplay");
const wordDisplay = document.getElementById("wordDisplay");
const stateIndexDisplay = document.getElementById("stateIndexDisplay");
const formIsValid = document.getElementById("formIsValid");
const myStateMachine = stateValidation(IndexedStateMachine.create());

function render(state) {
    let isValid = myStateMachine.isValid();
    numberDisplay.innerHTML = numberBox.value = isNaN(state.number) ? "" : state.number;
    wordDisplay.innerHTML = wordBox.value = typeof state.word === "string" ? state.word : "";
    stateIndexDisplay.innerHTML = myStateMachine.currentIndex();
    formIsValid.innerHTML = isValid ? "&#x2714;" : "&#x2716;";
    backStateButton.disabled = myStateMachine.currentIndex() === 0;
    forwardStateButton.disabled = myStateMachine.isLastState();
    return state;
}

function moveToState(velocity) {
    return function () {
        return render(myStateMachine.moveToState(velocity));
    }
}

function reset() {

    return render(myStateMachine.reset());
}

let addState = R.curry((key, event) => {
    let newState = {};
    newState[key] = event.target.value;
    return render(myStateMachine.addSequence(newState));
});

let numStream1 = Rx.Observable.fromEvent(numberBox, "keyup");
let numStream2 = Rx.Observable.fromEvent(numberBox, "change");
Rx.Observable.merge(numStream1, numStream2).subscribe(addState("number"));
Rx.Observable.fromEvent(wordBox, "keyup").subscribe(addState("word"));
Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveToState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveToState(-1));
Rx.Observable.fromEvent(resetStateButton, "click").subscribe(reset);
myStateMachine.addRule({
    number: function (value) {
        return value === "" || typeof value === "undefined" || (!isNaN(value) && Number(value) >= 0 && Number(value) <= 100);
    }
});
myStateMachine.addRule({
    word: function (value) {
        return (value || "").length < 10;
    }
});
render(myStateMachine.returnState());

