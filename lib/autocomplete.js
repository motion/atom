'use babel'

import {CompositeDisposable, Emitter} from 'atom'

export default class Autocomplete {
  selector = '.source.js, .source.js.jsx'
  disableForSelector = '.comment'
  inclusionPriority = 100
  excludeLowerPriority = false
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.subscriptions.add(this.emitter)
  }
  getSuggestions({editor, bufferPosition, prefix}) {
    const info = {
      editor: null,
      view: null
    }

    this.emitter.emit('should-provide-editor', {editor, info})
    if (!info.editor) {
      // That editor is none of our business
      return []
    }
    info.view = info.editor.getViewAtPoint(bufferPosition)
    return []
  }
  onShouldProvideEditor(callback) {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {

  }
}
