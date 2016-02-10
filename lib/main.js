'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import {Editors} from './editors'
import {Projects} from './projects'

export class Flint {
  editors: Editors;
  projects: Projects;
  subscriptions: CompositeDisposable;

  constructor() {
    this.editors = new Editors()
    this.projects = new Projects()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.editors)
    this.subscriptions.add(this.projects)
  }
  activate() {
    this.editors.activate()
    this.projects.activate()
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
