'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable} from 'atom'
import debounce from 'sb-debounce'
import {getErrorMessage} from './helpers'

import type {Linter$Provider, Linter$Message, Atom$Range} from './types'

export class Linter {
  name: string;
  scope: string;
  lintOnFly: boolean;
  errors: Map<string, ?{message: string, range: Atom$Range}>;
  grammarScopes: Array<string>;
  subscriptions: CompositeDisposable;

  constructor() {
    this.name = 'Motion'
    this.scope = 'project'
    this.errors = new Map()
    this.grammarScopes = ['source.js.motion']
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.config.observe('motion.liveReload', lintOnFly => {
      this.lintOnFly = lintOnFly
    }))
  }
  lint(): Array<Object> {
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
    return messages
  }
  handleStatus(status: Object, rootDirectory: string) {
    let filePath = status.path || (status.error && (status.error.fileName || status.error.filePath || status.error.file)) || ''
    if (!filePath.length) {
      console.error('[Motion] Unable to determine file path of error message', status)
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
  }
  dispose() {
    this.errors.clear()
    this.subscriptions.dispose()
  }
}
