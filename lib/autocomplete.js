'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {showError} from './helpers'

export default class Autocomplete {
  selector = '.source.js, .source.js.jsx'
  disableForSelector = '.comment'
  inclusionPriority = 100
  excludeLowerPriority = true
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.subscriptions.add(this.emitter)
  }
  getSuggestions({editor: textEditor, bufferPosition}) {
    const editor = this.requestEditor(textEditor)
    if (editor === null) {
      return []
    }
    const connection = editor.getConnection()
    const editorText = textEditor.getText()
    const editorPosition = bufferPosition.serialize()
    return connection.request('editor:autocomplete', {
      text: editorText,
      position: editorPosition
    }).then(function(response) {
      return response.suggestions.map(function(suggestion) {
        let snippet = ''
        if (suggestion.type === 'css-key') {
          snippet = typeof suggestion.auto === 'string' ?
            `"\${1:${suggestion.auto}}"` :
            `\${1:${suggestion.auto}}`
          snippet = `${suggestion.name}: ${snippet},$2`
        } else if (suggestion.type === 'css-value') {
          snippet = typeof suggestion.auto === 'string' ?
            `"\${1:${suggestion.auto}}"` :
            `\${1:${suggestion.auto}}`
        } else if (suggestion.type === 'view-name') {
          snippet = `${suggestion.name} = {\n\t$1\n}`
        } else {
          snippet = `${suggestion.name}$1`
        }
        return {
          displayText: suggestion.name,
          replacementPrefix: suggestion.replacementPrefix,
          type: 'property',
          snippet: snippet,
          description: suggestion.description,
          descriptionMoreURL: suggestion.descriptionMoreURL || null
        }
      })
    }).catch(function(e) {
      showError(e)
      return []
    })
  }
  requestEditor(editor) {
    const info = {editor: null}
    this.emitter.emit('should-provide-editor', {editor, info})
    return info.editor
  }
  onShouldProvideEditor(callback) {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
