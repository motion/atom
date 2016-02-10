'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'

export class Flint {
  subscriptions: CompositeDisposable;
  editors: Editors;

  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.editors = new Editors()

    this.subscriptions.add(this.editors)
  }
  activate() {
    this.editors.activate()
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
