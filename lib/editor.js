'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable, Emitter} from 'atom'
import debounce from 'sb-debounce'
import {getGrammarByName} from './helpers'

import type {TextEditor, Disposable} from 'atom'
import type {Connection} from './connection'

export class Editor {
  motion: boolean;
  emitter: Emitter;
  liveReload: boolean;
  connection: ?Connection;
  javascript: boolean;
  subscriptions: CompositeDisposable;

  constructor(textEditor: TextEditor) {
    this.motion = false
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.liveReload = false
    this.connection = null
    this.javascript = Path.extname(textEditor.getPath()) === '.js'

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('motion.liveReload', liveReload => {
      this.liveReload = liveReload
    }))
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))

    if (this.javascript) {
      this.subscriptions.add(textEditor.onDidStopChanging(() => {
        let shouldBeMotion = textEditor.getText().indexOf('view ') !== -1
        if (this.motion !== shouldBeMotion) {
          textEditor.setGrammar((shouldBeMotion && getGrammarByName('source.js.motion')) || getGrammarByName('source.js.jsx') || getGrammarByName('source.js'))
          this.motion = shouldBeMotion
        }
      }))
      this.subscriptions.add(textEditor.onDidChange(debounce(() => {
        if (this.liveReload && this.motion) {
          const connection = this.connection
          if (connection) {
            connection.send('live:save', {path: textEditor.getPath(), contents: textEditor.getText()})
          }
        }
      }, 16, true)))
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
