'use babel'

/* @flow */

import Path from 'path'
import {CompositeDisposable} from 'atom'
import {exists} from './helpers'

export class Connection {
  directory: string;
  subscriptions: CompositeDisposable;

  constructor(directory: string) {
    this.directory = directory
    this.subscriptions = new CompositeDisposable()
  }
  dispose() {
    this.subscriptions.dispose()
  }
  static async create(directory: string): Promise<?Connection> {
    const flintDirectory = Path.join(directory, '.flint')
    if (await exists(flintDirectory)) {
      return new Connection(flintDirectory)
    }
    return null
  }
}
