import {stateMachine} from "./state-machine";
import {Rx} from "rxjs/Rx";
import {default as R} from "ramda";

var numberBox = document.getElementById("numberBox");
var wordBox= document.getElementById("wordBox");
var addStateButton = document.getElementById("addStateButton");
var forwardStateButton= document.getElementById("forwardStateButton");
var backStateButton = document.getElementById("backStateButton");
var numberDisplay = document.getElementById("numberDisplay");
var wordDisplay= document.getElementById("wordDisplay");
var stateIndex = document.getElementById("stateIndex");
var addState = R.curry((key,event) => {
    var newState = {};
    newState[key] = event.target.value;
    return stateMachine.addState(newState);
});


function moveState(velocity){
    return function() {
        return stateMachine
    }
}

Rx.Observable.fromEvent(wordBox, "change").subscribe(addState("word"));
Rx.Observable.fromEvent(numberBox, "change").subscribe(addState("number"));
Rx.Observable.fromEvent(forwardStateButton, "click").subscribe(moveState(1));
Rx.Observable.fromEvent(backStateButton, "click").subscribe(moveState(-1));

