// @flow

import {StateMachine} from "./state-machine";

let _indexCache = new WeakMap();

export class IndexedStateMachine extends StateMachine {

    static create() {
        return new IndexedStateMachine();
    }

    constructor() {
        super();
        this.addState = this.addState.bind(this);
        this.moveState = this.moveState.bind(this);
        this.currentIndex = this.currentIndex.bind(this);
        this.isLastState = this.isLastState.bind(this);
        this.reset = this.reset.bind(this);
        _indexCache.set(this, 0);
    }

    addState(state): Object {
        let _state = super.addState(state, _indexCache.get(this));
        _indexCache.set(this, (super.size() - 1));
        return _state;
    }

    moveState(wayBackNumber: number): Object {
        let newIndex = _indexCache.get(this) + wayBackNumber;
        _indexCache.set(this, newIndex);
        return super.returnState(newIndex);
    }

    currentIndex(): number {
        return _indexCache.get(this);
    }

    currentState(): Object {
        return super.returnState(_indexCache.get(this));
    }

    isLastState(): boolean {
        return super.size() === _indexCache.get(this) + 1;
    }

    reset(): Object {
        _indexCache.set(this, 0);
        return super.clearHistory();
    }

    destroy(): void {
        _indexCache.delete(this);
        super.destroy();
    }
}
