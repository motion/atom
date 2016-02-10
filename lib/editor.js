'use babel'

/* @flow */

import {CompositeDisposable, Emitter} from 'atom'
import {aggressiveDebounce} from './helpers'

import type {TextEditor, Disposable} from 'atom'
import type {Connection} from './connection'

export class Editor {
  emitter: Emitter;
  liveReload: boolean;
  connection: ?Connection;
  subscriptions: CompositeDisposable;

  constructor(textEditor: TextEditor) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.connection = null
    this.liveReload = false

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('flint.liveReload', liveReload => {
      this.liveReload = liveReload
    }))
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))
  }
  getConnection(): ?Connection {
    return this.connection
  }
  setConnection(connection: Connection) {
    this.connection = connection
  }
  onDidDestroy(callback: (() => void)): Disposable {
    return this.emitter.on('did-destroy', callback)
  }
  dispose() {
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
    this.connection = null
  }
}
