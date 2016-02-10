'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Connection} from './connection'

export class Connections {
  queue: Promise;
  connections: Map<string, Connection>;
  subscriptions: CompositeDisposable;

  constructor() {
    this.queue = Promise.resolve()
    this.connections = new Map()
    this.subscriptions = new CompositeDisposable()
  }
  add(path: string) {
    this.queue = this.queue.then(async () => {
      const connection = await Connection.create(path)
      if (connection) {
        this.connections.set(path, connection)
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
      if (path.indexOf(connection.getDirectory()) === 0) {
        return connection
      }
    }
    return null
  }
  dispose() {
    this.connections.clear()
    this.subscriptions.dispose()
  }
}
