'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {debounce} from './helpers'

export default class Linter {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.errors = new Map()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('steel-flint.debounce', debounceDelay => {
      this._shouldUpdateMessages = debounce(this.shouldUpdateMessages, debounceDelay)
    }))
  }
  attach(linterProvider) {
    this.subscriptions.add(linterProvider)
    this.onShouldUpdateMessages(function(messages) {
      linterProvider.setMessages(messages)
    })
  }
  registerConnection(connection) {
    this.errors.set(connection, new Map())
  }
  unregisterConnection(connection) {
    this.errors.delete(connection)
  }
  setError(connection, filePath, error) {
    if (!this.errors.has(connection)) {
      this.errors.set(connection, new Map())
    }
    const map = this.errors.get(connection)
    map.set(filePath, error)
    this.updateMessages()
  }
  updateMessages() {
    const errors = []
    for (const map of this.errors.values()) {
      for (const message of map) {
        if (message) {
          errors.push(message)
        }
      }
    }
    this._shouldUpdateMessages(errors)
  }
  shouldUpdateMessages(errors) {
    this.emitter.emit('should-update-messages', errors)
  }
  onShouldUpdateMessages(callback) {
    return this.emitter.on('should-update-messages', callback)
  }
  dispose() {
    this.errors.clear()
    this.subscriptions.dispose()
  }
}
