'use babel'

import {CompositeDisposable, Emitter} from 'atom'

export default class Editor {
  constructor(textEditor) {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.textEditor = textEditor

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))
  }
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback)
  }
  dispose() {
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
  }
}
