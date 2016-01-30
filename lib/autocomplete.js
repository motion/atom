'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {showError} from './helpers'
import {decamelize} from 'humps'

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
        const snippetValue = typeof suggestion.auto === 'string' ?
          `"\${1:${suggestion.auto}}"` :
          `\${1:${suggestion.auto}}`;
        return {
          displayText: suggestion.name,
          replacementPrefix: suggestion.replacementPrefix,
          type: 'property',
          snippet: `${suggestion.name}: ${snippetValue},$2`,
          description: suggestion.description,
          descriptionMoreURL: 'https://developer.mozilla.org/en/docs/Web/CSS/' + decamelize(suggestion.name, {separator: '-'})
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
