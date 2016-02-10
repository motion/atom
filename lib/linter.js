'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable} from 'atom'
import {getErrorMessage} from './helpers'

import type {Linter$Provider, Linter$Message} from './types'

export class Linter {
  active: boolean;
  errors: Map<string, ?string>;
  changed: boolean;
  subscriptions: CompositeDisposable;

  constructor() {
    this.active = true
    this.errors = new Map()
    this.changed = false
    this.subscriptions = new CompositeDisposable()
  }
  activate(linterProvider: Linter$Provider) {

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
    const error = status.error ? getErrorMessage(status.error.message) : null
    this.errors.set(filePath, error)
  }
  dispose() {
    this.active = false
    this.errors.clear()
    this.subscriptions.dispose()
  }
}
