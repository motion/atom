'use babel'

/* @flow */

import {CompositeDisposable, Emitter} from 'atom'
import {Connection} from './connection'
import type {Disposable} from 'atom'

export class Connections {
  queue: Promise;
  emitter: Emitter;
  connections: Map<string, Connection>;
  subscriptions: CompositeDisposable;

  constructor() {
    this.queue = Promise.resolve()
    this.emitter = new Emitter()
    this.connections = new Map()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
  }
  add(path: string) {
    this.queue = this.queue.then(async () => {
      const connection = await Connection.create(path)
      if (connection) {
        this.connections.set(path, connection)
        this.emitter.emit('did-add-connection', {path, connection})
        connection.onDidReceiveAnyMessage(({type, message}) => {
          this.emitter.emit(`did-receive-message:${type}`, {message, connection})
        })
        connection.onShouldProvideEditor(event => {
          this.emitter.emit('should-provide-editor', event)
        })
      }
    })
  }
  remove(path: string) {
    this.queue = this.queue.then(() => {
      this.connections.delete(path)
    })
  }
  getByFilePath(path: string): ?Connection {
    for (const connection of this.connections.values()) {
      if (connection.matchesFile(path)) {
        return connection
      }
    }
    return null
  }
  onDidReceiveMessage(type: string, callback: ((param: {message: Object, connection: Connection}) => void)): Disposable {
    return this.emitter.on(`did-receive-message:${type}`, callback)
  }
  onDidAddConnection(callback: ((parameters: {path: string, connection: Connection}) => void)): Disposable {
    return this.emitter.on('did-add-connection', callback)
  }
  onShouldProvideEditor(callback: Function): Disposable {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {
    this.connections.clear()
    this.subscriptions.dispose()
  }
}
