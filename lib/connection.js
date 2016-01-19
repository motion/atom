'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {readFile} from './helpers'
import WebSocket from 'reconnectingwebsocket'

export default class Connection {
  constructor(projectPath, configPath, manifest) {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.projectPath = projectPath
    this.configPath = configPath
    this.manifest = manifest
    this.status = false

    this.socket = new WebSocket(`ws://localhost:${manifest.wport}`)

    this.subscriptions.add(this.emitter)
    this.socket.addEventListener('message', e => {
      const message = JSON.parse(e.data)
      this.emitter.emit(`on-message:${message._type}`, message)
    })
    this.socket.addEventListener('open', _ => {
      this.status = true
      this.emitter.emit('did-change-status', true)
    })
    this.socket.addEventListener('close', _ => {
      this.status = false
      this.emitter.emit('did-change-status', false)
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
  onDidChangeStatus(callback) {
    return this.emitter.on('did-change-status', callback)
  }
  dispose() {
    this.socket.close()
    this.subscriptions.dispose()
  }
  static create(projectPath, configPath) {
    return readFile(configPath).then(function(contents) {
      try {
        const parsed = JSON.parse(contents)
        return new Connection(projectPath, configPath, parsed)
      } catch (_) {
        throw new Error(`Malformed state file found in ${projectPath}`)
      }
    })
  }
}
