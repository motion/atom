'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {readFile} from './helpers'
import WebSocket from 'reconnectingwebsocket'

export default class Connection {
  constructor(projectPath, manifest) {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.projectPath = projectPath

    this.socket = new WebSocket(`ws://localhost:${manifest.wport}`, null, {reconnectInterval: 5 * 1000})

    this.subscriptions.add(this.emitter)
    this.socket.addEventListener('message', e => {
      const message = JSON.parse(e.data)
      this.emitter.emit(`on-message:${message._type}`, message)
    })
  }
  getPath() {
    return this.projectPath
  }
  send(type, message) {
    this.socket.send(JSON.stringify(Object.assign({}, {_type: type}, message)))
  }
  onMessage(type, callback) {
    return this.emitter.on(`on-message:${type}`, callback)
  }
  onDidDestroy(callback) {
    return this.emitter.on('did-destroy', callback)
  }
  destroy() {
    this.emitter.emit('did-destroy')
    this.dispose()
  }
  dispose() {
    this.socket.close()
    this.subscriptions.dispose()
  }
  static create(projectPath, configPath) {
    return readFile(configPath).then(function(contents) {
      try {
        const parsed = JSON.parse(contents)
        return new Connection(projectPath, parsed)
      } catch (_) {
        throw new Error(`Malformed state file found in ${projectPath}`)
      }
    })
  }
}
