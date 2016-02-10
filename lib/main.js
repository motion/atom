'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'
import {Projects} from './projects'
import {Connections} from './connections'
import {Commands} from './commands'

export class Flint {
  editors: Editors;
  commands: Commands;
  projects: Projects;
  connections: Connections;
  subscriptions: CompositeDisposable;

  constructor() {
    this.editors = new Editors()
    this.commands = new Commands()
    this.projects = new Projects()
    this.connections = new Connections()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.editors)
    this.subscriptions.add(this.commands)
    this.subscriptions.add(this.projects)
    this.subscriptions.add(this.connections)

    this.projects.onDidAddPath(path => {
      this.connections.add(path)
    })
    this.projects.onDidRemovePath(path => {
      this.connections.remove(path)
    })
    this.connections.onDidAddConnection(({path, connection}) => {
      for (const [textEditor, editor] of this.editors.getAll()) {
        const filePath = textEditor.getPath()
        if (filePath && !editor.getConnection()  && connection.matchesFile(filePath)) {
          editor.setConnection(connection)
        }
      }
    })
  }
  activate() {
    this.editors.activate()
    this.projects.activate()
    this.commands.activate()
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
