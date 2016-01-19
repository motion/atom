'use babel'

import {CompositeDisposable} from 'atom'
import {obtainConfig} from './helpers'

export default class Flint {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.config = new Map()
  }
  activate() {
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
      if (!this.config.has(newPath)) {
        promises.push(obtainConfig(newPath))
      }
    }

    // Remove deleted ones
    for (const oldPath of this.config.keys()) {
      if (paths.indexOf(oldPath) === -1) {
        this.config.delete(oldPath)
      }
    }

    return Promise.all(promises).then(configs => {
      for (const config of configs) {
        if (config === null) {
          continue
        }
        this.config.set(config.path, config.manifest)
      }
    })
  }
  dispose() {
    this.config.clear()
    this.subscriptions.dispose()
  }
}
