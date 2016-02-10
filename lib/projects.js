'use babel'

/* @flow */

import {CompositeDisposable, Emitter} from 'atom'
import type {Disposable} from 'atom'

export class Projects {
  paths: Set<string>;
  emitter: Emitter;
  subscriptions: CompositeDisposable;

  constructor() {
    this.paths = new Set()
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
  }
  activate() {
    this.subscriptions.add(atom.project.onDidChangePaths(() => this.detectChanges()))
    this.detectChanges()
  }
  detectChanges() {
    const paths = new Set(atom.project.getPaths())
    for (const path of paths) {
      if (!this.paths.has(path)) {
        this.paths.add(path)
        this.emitter.emit('did-add-path', path)
      }
    }
    for (const path of this.paths) {
      if (!paths.has(path)) {
        this.paths.delete(path)
        this.emitter.emit('did-remove-path', path)
      }
    }
  }
  getPaths(): Set<string> {
    return this.paths
  }
  onDidAddPath(callback: ((path: string) => void)): Disposable {
    return this.emitter.on('did-add-path', callback)
  }
  onDidRemovePath(callback: ((path: string) => void)): Disposable {
    return this.emitter.on('did-remove-path', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
