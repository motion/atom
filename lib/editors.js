'use babel'
/* @flow */

import {CompositeDisposable} from 'atom'
import {Editor} from './editor'
import type {TextEditor} from 'atom'

export class Editors {
  subscriptions: CompositeDisposable;
  editors: Map<TextEditor, Editor>;

  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.editors = new Map()
  }
  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
      const editor = new Editor(textEditor)
      editor.onDidDestroy(_ => {
        this.editors.delete(textEditor)
        this.subscriptions.remove(editor)
      })
      this.editors.set(textEditor, editor)
      this.subscriptions.add(editor)
    }))
  }
  get(textEditor: TextEditor): ?Editor {
    return this.editors.get(textEditor)
  }
  dispose() {
    this.editors.clear()
    this.subscriptions.dispose()
  }
}
