'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {aggressiveDebounce, pointInRange} from './helpers'

export default class Editor {
  constructor(textEditor, connection) {
    this.subscriptions = new CompositeDisposable()
    this.connection = connection
    this.emitter = new Emitter()
    this.views = []

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
    }, 16)))
  }
  updateMeta(meta) {
    const views = []
    for (const key in meta) {
      const value = meta[key]
      value.name = key
      views.push(value)
    }
    this.views = views
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
    this.views = null
  }
}
