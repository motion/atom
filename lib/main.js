'use babel'

import {CompositeDisposable} from 'atom'
import {obtainConfig} from './helpers'

export default class Flint {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.config = new Map()
  }
  activate() {
    this.subscriptions.add(atom.project.onDidChangePaths(paths => {
      this.handlePaths(paths)
    }))
    this.handlePaths(atom.project.getPaths())
  }
  handlePaths(paths) {
    // Add new ones
    for (const newPath of paths) {
      if (!this.config.has(newPath)) {
        const newConfig = {exists: false}
        obtainConfig(newPath, newConfig)
        this.config.set(newPath, newConfig)
      }
    }

    // Remove deleted ones
    for (const oldPath of this.config.keys()) {
      if (paths.indexOf(oldPath) === -1) {
        this.config.delete(oldPath)
      }
    }
  }
  dispose() {
    this.config.clear()
    this.subscriptions.dispose()
  }
}
