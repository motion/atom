'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {pointWithinRange, CSS_KEYS} from './helpers'
import string_score from 'sb-string_score'

const TYPE = {
  VIEW_TOP: 'VIEW_TOP',
  VIEW_JSX: 'VIEW_JSX',
  STYLE: 'STYLE'
}
const KEY_VALIDATION_REGEX = /['"]?\S+['"]?: *['"]?[^,"]*$/

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
    if (positionInfo.type === TYPE.STYLE) {
      // Show css suggestions
      if (this.shouldCompleteValue(editor, bufferPosition)) {
        console.log('value')
      } else {
        return this.getCSSKeySuggestions(prefix)
      }
    } else if (positionInfo.type === TYPE.VIEW_TOP) {
      // Check if the prefix contains $, if yes then autocomplete using list of view els
    }
    return []
  }
  shouldCompleteValue(editor, bufferPosition) {
    let lineText = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition])
    return KEY_VALIDATION_REGEX.test(lineText)
  }
  getCSSKeySuggestions(prefix) {
    let i = 0
    let suggestion
    let parsedSuggestions = []

    while (suggestion = CSS_KEYS[i++]) {
      parsedSuggestions.push({
        displayText: suggestion,
        score: string_score(suggestion, prefix)
      })
    }

    parsedSuggestions = parsedSuggestions.sort(function(a, b) {
      return b.score - a.score
    }).slice(0, 20)

    i = 0
    while(suggestion = parsedSuggestions[i++]) {
      suggestion.snippet = `${suggestion.displayText}: "$1",$2`
      suggestion.replacementPrefix = prefix
      suggestion.type = 'property'
    }

    return parsedSuggestions
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
    this.subscriptions.dispose()
  }
}
