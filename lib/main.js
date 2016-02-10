'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'
import {Projects} from './projects'
import {Connections} from './connections'

export class Flint {
  editors: Editors;
  projects: Projects;
  connections: Connections;
  subscriptions: CompositeDisposable;

  constructor() {
    this.editors = new Editors()
    this.projects = new Projects()
    this.connections = new Connections()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.editors)
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
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
