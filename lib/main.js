'use babel'

import {CompositeDisposable, Emitter} from 'atom'
import {obtainConfig} from './helpers'
import Editor from './editor'

export default class Flint {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.config = new Map()

    this.subscriptions.add(this.emitter)
  }
  activate() {
    // Paths
    let pathsQueue = Promise.resolve()
    this.subscriptions.add(atom.project.onDidChangePaths(paths => {
      pathsQueue.then(() => this.handlePaths(paths))
    }))
    this.handlePaths(atom.project.getPaths())

    // Editors
    atom.workspace.observeTextEditors(textEditor => {
      const editor = new Editor(textEditor)
      editor.onDidDestroy(() => {
        this.subscriptions.delete(editor)
      })
      this.subscriptions.add(editor)
    })
  }
  handlePaths(paths) {
    const promises = []

    // Add new ones
    for (const newPath of paths) {
      if (!this.config.has(newPath)) {
        promises.push(obtainConfig(newPath))
      }
    }

    // Remove deleted ones
    for (const oldPath of this.config.keys()) {
      if (paths.indexOf(oldPath) === -1) {
        this.config.delete(oldPath)
        this.emitter.emit('did-remove-project', oldPath)
      }
    }

    return Promise.all(promises).then(configs => {
      for (const config of configs) {
        if (config === null) {
          continue
        }
        this.config.set(config.path, config.manifest)
        this.emitter.emit('did-add-project', {config})
      }
    })
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
