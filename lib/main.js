'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'
import {Projects} from './projects'
import {Connections} from './connections'
import {Commands} from './commands'
import {Linter} from './linter'
import {Autocomplete} from './autocomplete'
import {StatusIcon} from './views/status-icon'

import type {Linter$Provider} from './types'

export class Motion {
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
    this.editors.onDidAdd(({textEditor, editor}) => {
      const filePath = textEditor.getPath() || ''
      const connection = this.connections.getByFilePath(filePath)
      if (connection) {
        editor.setConnection(connection)
      }
    })
  }
  activate() {
    this.editors.activate()
    this.projects.activate()
    this.commands.activate()
  }
  consumeLinter(linterProvider: Linter$Provider) {
    const subscriptions = new CompositeDisposable()
    const linter = new Linter(linterProvider)
    subscriptions.add(linterProvider)
    subscriptions.add(linter)
    subscriptions.add(this.connections.onDidReceiveMessage('compile:error', function({message, connection}) {
      linter.handleStatus(message, connection.getDirectory())
    }))
    subscriptions.add(this.connections.onDidReceiveMessage('compile:success', function({message, connection}) {
      linter.handleStatus(message, connection.getDirectory())
    }))
    this.subscriptions.add(subscriptions)
  }
  consumeStatusbar(statusBar: Object) {
    const statusIcon = new StatusIcon()
    statusIcon.activate(statusBar)
    this.subscriptions.add(statusIcon)
    this.subscriptions.add(atom.workspace.observeActivePaneItem(activePaneItem => {
      statusIcon.setActive(this.editors.get(activePaneItem))
    }))
  }
  provideAutocomplete(): Autocomplete {
    const autocomplete = new Autocomplete()
    autocomplete.onShouldProvideEditor(({editor, info}) => {
      info.editor = this.editors.get(editor)
    })
    this.subscriptions.add(autocomplete)
    return autocomplete
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
