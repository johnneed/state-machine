import {stateMachine} from "./state-machine";
import {default as Rx} from "rxjs/Rx";
import {default as R} from "ramda";
import {stateIndex} from "./state-index";

var numberBox = document.getElementById("numberBox");
var wordBox= document.getElementById("wordBox");
var addStateButton = document.getElementById("addStateButton");
var forwardStateButton= document.getElementById("forwardStateButton");
var backStateButton = document.getElementById("backStateButton");
var numberDisplay = document.getElementById("numberDisplay");
var wordDisplay= document.getElementById("wordDisplay");
var stateIndexDisplay = document.getElementById("stateIndexDisplay");
var myStateMachine = stateIndex(stateMachine);

function render(state){
    numberDisplay.innerHTML =state.number;
    wordDisplay.innerHTML = state.word;
    stateIndexDisplay.innerHTML = myStateMachine.currentIndex();
    return state;
}

function moveState(velocity){
    return function() {
        return render(myStateMachine.moveState(velocity));
    }
}

let addState = R.curry((key,event) => {
    var newState = {};
    newState[key] = event.target.value;
    return render(myStateMachine.addState(newState));
});

Rx.Observable.fromEvent(wordBox, "keyup").subscribe(addState("word"));
Rx.Observable.fromEvent(numberBox, "change").subscribe(addState("number"));
Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveState(-1));

