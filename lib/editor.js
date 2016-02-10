'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable, Emitter} from 'atom'
import {getGrammarByName} from './helpers'

import type {TextEditor, Disposable} from 'atom'
import type {Connection} from './connection'

export class Editor {
  emitter: Emitter;
  liveReload: boolean;
  connection: ?Connection;
  javascript: boolean;
  subscriptions: CompositeDisposable;

  constructor(textEditor: TextEditor) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.liveReload = false
    this.connection = null
    this.javascript = Path.extname(textEditor.getPath()) === '.js'

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('flint.liveReload', liveReload => {
      this.liveReload = liveReload
    }))
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))

    if (this.javascript) {
      // Setting it to NaN so it's neither true nor false
      let hasFlintGrammar = NaN
      this.subscriptions.add(textEditor.onDidStopChanging(function() {
        let shouldHaveFlintGrammar = textEditor.getText().indexOf('view ') !== -1
        if (hasFlintGrammar !== shouldHaveFlintGrammar) {
          textEditor.setGrammar((shouldHaveFlintGrammar && getGrammarByName('source.js.flint')) || getGrammarByName('source.js.jsx') || getGrammarByName('source.js'))
          hasFlintGrammar = shouldHaveFlintGrammar
        }
      }))
    }
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
