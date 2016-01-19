'use babel'

import {CompositeDisposable, Emitter} from 'atom'

export default class Editor {
  constructor(textEditor, connection) {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('steel-flint.liveReload', liveReload => {
      this.liveReload = liveReload
    }))
    this.subscriptions.add(textEditor.onDidDestroy(() => {
      this.dispose()
    }))

    // Atom invokes this immediately, so we wait till editor is booted up
    setImmediate(() => {
      this.subscriptions.add(textEditor.onDidStopChanging(() => {
        if (this.liveReload) {
          const filePath = textEditor.getPath()
          const fileContents = textEditor.getText()
          connection.send('live:save', {path: filePath, contents: fileContents})
        }
      }))
    })
  }
  onShouldReload(callback) {
    return this.emitter.on('should-reload', callback)
  }
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback)
  }
  dispose() {
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
  }
}
