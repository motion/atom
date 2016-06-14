'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'

export class Motion {
  editors: Editors;
  subscriptions: CompositeDisposable;

  constructor() {
    this.editors = new Editors()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.editors)
  }
  activate() {
    this.editors.activate()
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
