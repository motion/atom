'use babel'

/* @flow */

import {CompositeDisposable, Emitter} from 'atom'
import type {TextEditor, Disposable} from 'atom'
import type {Editor} from './editor'
import type {Atom$Range, Declarations$Declaration} from './types'

export class Declarations {
  emitter: Emitter;
  grammarScopes: Array<string>;
  subscriptions: CompositeDisposable;

  constructor() {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.grammarScopes = ['source.js.flint']

    this.subscriptions.add(this.emitter)
  }
  async getDeclarations({textEditor, visibleRange}: {textEditor: TextEditor, visibleRange: Atom$Range}): Promise<Array<Declarations$Declaration>> {
    console.log('getDeclarations flint', visibleRange)
    return []
  }
  requestEditor(textEditor: TextEditor): ?Editor {
    const event = {textEditor, editor: null}
    this.emitter.emit('should-provide-editor', event)
    return event.editor
  }
  onShouldProvideEditor(callback: Function): Disposable {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
