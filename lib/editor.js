'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {aggressiveDebounce} from './helpers'

export default class Editor {
  constructor(textEditor, connection) {
    this.subscriptions = new CompositeDisposable()
    this.connection = connection
    this.emitter = new Emitter()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('steel-flint.liveReload', liveReload => {
      this.liveReload = liveReload
    }))
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))

    let oldText = null
    this.subscriptions.add(textEditor.onDidChange(aggressiveDebounce(() => {
      const filePath = textEditor.getPath()
      const fileContents = textEditor.getText()
      if (this.liveReload && oldText !== fileContents) {
        oldText = fileContents
        connection.send('live:save', {path: filePath, contents: fileContents})
      }
    }, 60)))
  }
  getConnection() {
    return this.connection
  }
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback)
  }
  dispose() {
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
    this.connection = null
  }
}
