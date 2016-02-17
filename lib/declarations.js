'use babel'

/* @flow */

import {CompositeDisposable, Emitter, Range} from 'atom'
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
    this.grammarScopes = ['source.js.motion']

    this.subscriptions.add(this.emitter)
  }
  async getDeclarations({textEditor, visibleRange}: {textEditor: TextEditor, visibleRange: Atom$Range}): Promise<Array<Declarations$Declaration>> {
    const editor = this.requestEditor(textEditor)
    if (!editor) {
      return []
    }
    const views = await editor.getViews()
    const filePath = textEditor.getPath()
    const declarations = []

    for (const name in views) {
      const view = views[name]
      const viewBounds = Range.fromObject(view.location)
      if (visibleRange.intersectsWith(viewBounds)) {
        for (const elementName in view.els) {
          const element = view.els[elementName]
          const stylePosition = view.styles[elementName]
          if (stylePosition) {
            declarations.push({
              range: element.location,
              source: {
                filePath: filePath,
                position: stylePosition.location[0]
              }
            })
          }
        }
        for (const styleName in view.styles) {
          const style = view.styles[styleName]
          const location = style.location[0]
          const elementPosition = view.els[styleName]
          declarations.push({
            // $ <-- 1 length for this
            range: [[location[0], location[1]], [location[0], location[1] + styleName.length + 1]],
            source: {
              filePath: filePath,
              // Fix for $ = {}
              position: elementPosition && elementPosition.location[0]
            }
          })
        }
      }
    }
    return declarations
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
