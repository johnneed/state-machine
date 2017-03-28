// @flow

import {SequentialStateMachine} from "./sequential-state-machine";

let _indexCache = new WeakMap();

export class IndexedStateMachine extends SequentialStateMachine {

    static create(initialState) {
        return new IndexedStateMachine(initialState);
    }

    constructor(initialState) {
        super(initialState || {});
        this.addSequence = this.addSequence.bind(this);
        this.moveToState = this.moveToState.bind(this);
        this.currentIndex = this.currentIndex.bind(this);
        this.isLastState = this.isLastState.bind(this);
        this.reset = this.reset.bind(this);
        _indexCache.set(this, 0);
    }

    addSequence(sequence): Object {
        let _state = super.addSequence(sequence, _indexCache.get(this));
        _indexCache.set(this, (super.size() - 1));
        return _state;
    }

    moveToState(velocity: number): Object {
        let newIndex = _indexCache.get(this) + velocity;
        if (newIndex >= 0 && newIndex < this.size()) {
            _indexCache.set(this, newIndex);
            return super.returnState(newIndex);
        }
        return super.returnState(_indexCache.get(this));
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
