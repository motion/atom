'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable} from 'atom'
import debounce from 'sb-debounce'
import {getErrorMessage} from './helpers'

import type {Linter$Provider, Linter$Message, Atom$Range} from './types'

export class Linter {
  errors: Map<string, ?{message: string, range: Atom$Range}>;
  subscriptions: CompositeDisposable;
  linterProvider: Linter$Provider;
  deferredUpdateMessages: (() => void);

  constructor(linterProvider: Linter$Provider) {
    this.errors = new Map()
    this.subscriptions = new CompositeDisposable()
    this.linterProvider = linterProvider

    this.subscriptions.add(atom.config.observe('flint.lintingDelay', delay => {
      this.deferredUpdateMessages = debounce(this.updateMessages, delay)
    }))
  }
  updateMessages() {
    const messages = []
    for (const [filePath, error] of this.errors) {
      if (error) {
        messages.push({
          type: 'Error',
          text: error.message,
          filePath: filePath,
          range: error.range
        })
      }
    }
    this.linterProvider.setMessages(messages)
  }
  handleStatus(status: Object, rootDirectory: string) {
    let filePath = status.path || (status.error && (status.error.fileName || status.error.filePath || status.error.file)) || ''
    if (!filePath.length) {
      console.error('[Flint] Unable to determine file path of error message', status)
      return
    }
    if (!Path.isAbsolute(filePath)) {
      filePath = Path.join(rootDirectory, filePath)
    }
    let error = null
    if (status.error) {
      const location = status.error.loc
      const message = getErrorMessage(status.error.message)
      const range = location ?
        [[location.line - 1, location.column - 1], [location.line - 1, location.column]] :
        [[0, 0], [0, Infinity]]
      error = {message, range}
    }
    const message = status.error ? getErrorMessage(status.error.message) : null
    this.errors.set(filePath, error)
    this.deferredUpdateMessages()
  }
  dispose() {
    this.errors.clear()
    this.subscriptions.dispose()
  }
}
