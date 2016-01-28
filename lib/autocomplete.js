'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {pointWithinRange} from './helpers'

const TYPE = {
  VIEW_TOP: 'VIEW_TOP',
  VIEW_JSX: 'VIEW_JSX',
  STYLE: 'STYLE'
}

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
    const positionInfo = this.getPositionInfo(editor, bufferPosition)

    if (positionInfo.editor === null || positionInfo.view === null) {
      return []
    }
    console.log(positionInfo)
    return []
  }
  getPositionInfo(editor, position) {
    const info = {editor: null, position, view: null, type: null}
    this.emitter.emit('should-provide-editor', {editor, info})
    if (info.editor) {
      info.view = info.editor.getViewAtPoint(position)
    }
    if (info.view) {
      info.type = this.getPositionType(info)
    }
    return info
  }
  getPositionType(positionInfo) {
    for (const key in positionInfo.view.els) {
      const value = positionInfo.view.els[key]
      if (pointWithinRange(positionInfo.position, value.location)) {
        return TYPE.VIEW_JSX
      }
    }

    for (const key in positionInfo.view.styles) {
      const value = positionInfo.view.styles[key]
      if (pointWithinRange(positionInfo.position, value.location)) {
        return TYPE.STYLE
      }
    }
    return TYPE.VIEW_TOP
  }
  onShouldProvideEditor(callback) {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {

  }
}
