'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'

export class Connections {
  subscriptions: CompositeDisposable;

  constructor() {
    this.subscriptions = new CompositeDisposable()
  }
  add(path: string) {

  }
  remove(path: string) {

  }
  dispose() {
    this.subscriptions.dispose()
  }
}
