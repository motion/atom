'use babel'

import {CompositeDisposable} from 'atom'
import {readFile} from './helpers'

export default class Connection {
  constructor(projectPath, configPath, manifest) {
    this.subscriptions = new CompositeDisposable()
    this.projectPath = projectPath
    this.configPath = configPath
    this.manifest = manifest
  }
  dispose() {
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
