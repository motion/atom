'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable, Emitter} from 'atom'
import WebSocket from 'reconnectingwebsocket'
import {exists, readFile, WEBSOCKET_STATUS} from './helpers'
import type {Disposable} from 'atom'

let requestID = 0

export class Connection {
  status: string;
  socket: WebSocket;
  emitter: Emitter;
  directory: string;
  subscriptions: CompositeDisposable;

  constructor(directory: string, manifest: {wport: number}) {
    this.status = WEBSOCKET_STATUS.CLOSED
    this.socket = new WebSocket(`ws://localhost:${manifest.wport}`)
    this.emitter = new Emitter()
    this.directory = directory
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
    this.socket.addEventListener('error',      _ => this.setStatus(WEBSOCKET_STATUS.CLOSED))
    this.socket.addEventListener('close',      _ => this.setStatus(WEBSOCKET_STATUS.CLOSED))
    this.socket.addEventListener('open',       _ => this.setStatus(WEBSOCKET_STATUS.CONNECTED))
    this.socket.addEventListener('connecting', _ => this.setStatus(WEBSOCKET_STATUS.CONNECTING))
    this.socket.addEventListener('message', e => {
      const message = JSON.parse(e.data)
      this.emitter.emit(`did-receive-message:${message._type}`, message)
    })
  }
  request(type: string, message: Object): Promise<Object> {
    const id = requestID++
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(function() {
        disposable.dispose()
        reject(new Error(`Request of ${type} timed out`))
      }, 5 * 1000)
      const disposable = this.onDidRecieveMessage(type, function(message) {
        if (message.id === id) {
          clearTimeout(timeout)
          resolve(message)
          disposable.dispose()
        }
      })

      message.id = id
      this.send(type, message)
    })
  }
  send(type: string, message: Object) {
    const toSend = Object.assign({}, {_type: type}, message)
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(toSend))
    } else {
      console.debug('[Flint] Not sending data to websocket because its not open at the moment', toSend)
    }
  }
  getDirectory(): string {
    return this.directory
  }
  getStatus(): string {
    return this.status
  }
  setStatus(status: string) {
    if (status !== this.status) {
      this.status = status
      this.emitter.emit('did-change-status', status)
    }
  }
  onDidRecieveMessage(type: string, callback: Object): Disposable {
    return this.emitter.on(`did-receive-message:${type}`, callback)
  }
  onDidChangeStatus(callback: ((status: string) => void)): Disposable {
    return this.emitter.on('did-change-status', callback)
  }
  dispose() {
    this.subscriptions.dispose()
    this.socket.close()
  }
  static async create(directory: string): Promise<?Connection> {
    const flintDirectory = Path.join(directory, '.flint')
    const configFile = Path.join(flintDirectory, '.internal', 'state.json')
    const configContents = JSON.parse(await readFile(configFile))
    if (await exists(flintDirectory)) {
      return new Connection(flintDirectory, configContents)
    }
    return null
  }
}
