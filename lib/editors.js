'use babel'
/* @flow */

import {CompositeDisposable, Emitter} from 'atom'
import {Editor} from './editor'
import type {TextEditor, Disposable} from 'atom'

export class Editors {
  editors: Map<TextEditor, Editor>;
  emitter: Emitter;
  subscriptions: CompositeDisposable;

  constructor() {
    this.editors = new Map()
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
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
      this.emitter.emit('did-add', {editor, textEditor})
    }))
  }
  get(textEditor: TextEditor): ?Editor {
    return this.editors.get(textEditor)
  }
  getAll(): Map<TextEditor, Editor> {
    return this.editors
  }
  getByFilePath(filePath: string): ?Editor {
    for (const [textEditor, editor] of this.editors) {
      if (textEditor.getPath() === filePath) {
        return editor
      }
    }
    return null
  }
  onDidAdd(callback: ((param: {editor: Editor, textEditor: TextEditor}) => void)): Disposable {
    return this.emitter.on('did-add', callback)
  }
  dispose() {
    this.editors.clear()
    this.subscriptions.dispose()
  }
}
