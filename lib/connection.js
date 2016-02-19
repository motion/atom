'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable, Emitter} from 'atom'
import WebSocket from 'reconnectingwebsocket'
import {exists, readFile, focusWindow, WEBSOCKET_STATUS} from './helpers'
import type {Editor} from './editor'
import type {TextEditor, Disposable} from 'atom'

let requestID = 0

export class Connection {
  status: string;
  socket: WebSocket;
  emitter: Emitter;
  directory: string;
  subscriptions: CompositeDisposable;

  constructor(directory: string, manifest: {wport: number}) {
    this.status = WEBSOCKET_STATUS.CLOSED
    this.socket = new WebSocket(`ws://localhost:${manifest.wport}`, null, {
      reconnectInterval: 1000,
      timeoutInterval: 1000
    })
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
      this.emitter.emit(`did-receive-message`, {type: message._type, message})
    })
    this.onDidReceiveMessage('broadcast:editor', async message => {
      if (message.type === 'focus:element') {
        const filePath = Path.join(this.directory, message.filePath)
        await atom.workspace.open(filePath)
        const editor = await this.requestEditor(atom.workspace.getActiveTextEditor())
        const views = await editor.getViews()
        const view = views[message.view]
        if (view) {
          const element = view.els[message.key]
          editor.textEditor.setCursorBufferPosition(element ? element.location[0] : view.location[0])
          focusWindow()
        } else {
          console.debug('[Motion] View', message.view, 'not found in file', this.textEditor.getPath())
        }
      }
    })
  }
  request(type: string, message: Object): Promise<Object> {
    const id = requestID++
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(function() {
        disposable.dispose()
        reject(new Error(`Request of ${type} timed out`))
      }, 10 * 1000)
      const disposable = this.onDidReceiveMessage(type, function(message) {
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
      console.debug('[Motion] Not sending data to websocket because its not open at the moment', toSend)
    }
  }
  matchesFile(filePath: string): boolean {
    return filePath.indexOf(this.directory) === 0
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
  onDidReceiveMessage(type: string, callback: ((message: Object) => any)): Disposable {
    return this.emitter.on(`did-receive-message:${type}`, callback)
  }
  onDidReceiveAnyMessage(callback: ((param: {type: string, message: Object}) => any)): Disposable {
    return this.emitter.on('did-receive-message', callback)
  }
  onDidChangeStatus(callback: ((status: string) => void)): Disposable {
    return this.emitter.on('did-change-status', callback)
  }
  requestEditor(textEditor: TextEditor): ?Editor {
    const event = {textEditor, editor: null}
    this.emitter.emit('should-provide-editor', event)
    return event.editor
  }
  onShouldProvideEditor(callback: Function): Disposable {
    return this.emitter.on('should-provide-editor', callback)
  }
  dispose() {
    this.subscriptions.dispose()
    this.socket.close()
  }
  static async create(directory: string): Promise<?Connection> {
    const motionDirectory = Path.join(directory, '.motion')
    if (await exists(motionDirectory)) {
      const configFile = Path.join(motionDirectory, '.internal', 'state.json')
      const configContents = JSON.parse(await readFile(configFile))
      return new Connection(directory, configContents)
    }
    return null
  }
}
