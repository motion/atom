'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {fileExists, getMessage, realPath} from './helpers'
import {join as joinPath} from 'path'
import Editor from './editor'
import Connection from './connection'
import Commands from './commands'
import Linter from './linter'

export default class Flint {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.connections = new Map()
    this.commands = new Commands()
    this.linter = new Linter()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(this.commands)
    this.subscriptions.add(this.linter)
  }
  activate() {

    // Connections
    this.onDidAddProject(({path, promises}) => {
      promises.push(realPath(path).then(realPath => {
        const configPath = joinPath(realPath, '.flint', '.internal', 'state.json')
        return fileExists(configPath, false).then(exists => {
          if (exists) {
            return Connection.create(realPath, configPath).then(connection => {
              this.handleConnection(realPath, connection)
            }, function(error) {
              console.error('Flint channel creation failed', error)
            })
          }
        })
      }))
    })

    // Paths
    let pathsQueue = Promise.resolve()
    this.subscriptions.add(atom.project.onDidChangePaths(paths => {
      pathsQueue.then(() => this.handlePaths(paths))
    }))
    this.handlePaths(atom.project.getPaths()).then(() => {
      // Editors
      atom.workspace.observeTextEditors(textEditor => {
        const connection = this.getConnectionByPath(textEditor.getPath())
        if (connection !== null) {
          const editor = new Editor(textEditor, connection)
          editor.onDidDestroy(() => {
            this.subscriptions.delete(editor)
          })
          this.subscriptions.add(editor)
        }
      })
    })

    // Misc
    this.commands.activate()
  }
  handleConnection(path, connection) {
    this.connections.set(path, connection)
    this.linter.registerConnection(connection)
    connection.onDidDestroy(() => {
      this.linter.unregisterConnection(connection)
    })
    connection.onMessage('compile:error', message => {
      const error = message.error
      this.linter.setError(connection, error.fileName, {
        type: 'Error',
        text: getMessage(error),
        filePath: error.fileName,
        range: [[error.loc.line - 1, error.loc.column - 1], [error.loc.line - 1, error.loc.column]]
      })
    })
    connection.onMessage('compile:success', message => {
      this.linter.setError(connection, message.path, null)
    })
  }
  consumeLinter(linter) {
    this.subscriptions.add(linter)
    this.linter.onShouldUpdateMessages(function(messages) {
      linter.setMessages(messages)
    })
  }
  getConnectionByPath(path) {
    for (const connection of this.connections.values()) {
      console.log(path, connection.getPath(), path.indexOf(connection.getPath()))
      if (path.indexOf(connection.getPath()) === 0) {
        return connection
      }
    }
    return null
  }
  handlePaths(paths) {
    const promises = []

    // Add new ones
    for (const newPath of paths) {
      if (!this.connections.has(newPath)) {
        this.emitter.emit('did-add-project', {path: newPath, promises})
      }
    }

    // Remove deleted ones
    for (const oldPath of this.connections.keys()) {
      if (paths.indexOf(oldPath) === -1) {
        const oldConnection = this.connections.get(oldPath)
        oldConnection.destroy()
        this.connections.delete(oldPath)
      }
    }

    return Promise.all(promises).catch(e => console.error(e))
  }
  onDidAddProject(callback) {
    return this.emitter.on('did-add-project', callback)
  }
  dispose() {
    this.config.clear()
    this.subscriptions.dispose()
  }
}
