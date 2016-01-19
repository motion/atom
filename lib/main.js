'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {fileExists} from './helpers'
import {join as joinPath} from 'path'
import Editor from './editor'
import Connection from './connection'

export default class Flint {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.connections = new Map()

    this.subscriptions.add(this.emitter)
  }
  activate() {

    this.onDidAddProject(({path, promises}) => {
      const configPath = joinPath(path, '.flint', '.internal', 'state.json')
      promises.push(fileExists(configPath, false).then(exists => {
        if (exists) {
          return Connection.create(path, configPath).then(connection => {
            this.connections.set(path, connection)
          }, function(error) {
            console.error('Flint channel creation failed', error)
          })
        }
      }))
    })

    // Editors
    atom.workspace.observeTextEditors(textEditor => {
      const editor = new Editor(textEditor)
      editor.onDidDestroy(() => {
        this.subscriptions.delete(editor)
      })
      this.subscriptions.add(editor)
    })

    // Paths
    let pathsQueue = Promise.resolve()
    this.subscriptions.add(atom.project.onDidChangePaths(paths => {
      pathsQueue.then(() => this.handlePaths(paths))
    }))
    this.handlePaths(atom.project.getPaths())
  }
  handlePaths(paths) {
    const promises = []

    // Add new ones
    for (const newPath of paths) {
      if (!this.connections.has(newPath)) {
        console.log('found new Path')
        this.emitter.emit('did-add-project', {path: newPath, promises})
      }
    }

    // Remove deleted ones
    for (const oldPath of this.connections.keys()) {
      if (paths.indexOf(oldPath) === -1) {
        this.connections.delete(oldPath)
        this.emitter.emit('did-remove-project', oldPath)
      }
    }

    return Promise.all(promises).catch(e => console.error(e))
  }
  onDidAddProject(callback) {
    return this.emitter.on('did-add-project', callback)
  }
  onDidRemoveProject(callback) {
    return this.emitter.on('did-remove-project', callback)
  }
  dispose() {
    this.config.clear()
    this.subscriptions.dispose()
  }
}
