'use babel'

/* @flow */

import invariant from 'assert'
import {CompositeDisposable, Emitter} from 'atom'
import {showError} from './helpers'

import type {Editor} from './editor'
import type {TextEditor, Disposable} from 'atom'

export class Autocomplete {
  emitter: Emitter;
  selector: string;
  subscriptions: CompositeDisposable;
  inclusionPriority: number;
  disableForSelector: string;

  constructor() {
    this.emitter = new Emitter()
    this.selector = '.source.js.motion'
    this.subscriptions = new CompositeDisposable()
    this.inclusionPriority = 100
    this.disableForSelector = '.comment'

    this.subscriptions.add(this.emitter)
  }
  async getSuggestions({editor: textEditor, bufferPosition}) {
    const editor = this.requestEditor(textEditor)
    const connection = editor.getConnection()
    const editorText = textEditor.getText()
    const editorPosition = bufferPosition.serialize()

    if (!connection) {
      return []
    }

    let response
    try {
      response = await connection.request('editor:autocomplete', {
        text: editorText,
        position: editorPosition
      })
    } catch (_) {
      console.error(_)
      return []
    }

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
  }
  requestEditor(editor: TextEditor): Editor {
    const info = {editor: null}
    this.emitter.emit('should-provide-editor', {editor, info})
    invariant(info.editor)
    return info.editor
  }
  onShouldProvideEditor(callback: TextEditor): Disposable {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
