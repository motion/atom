'use babel'

/* @flow */

import {CompositeDisposable} from 'atom'
import Element from './elements/status-icon'

export class StatusIcon {
  active: ?CompositeDisposable;
  element: Element;
  statusIcon: ?{destroy: Function};
  subscriptions: CompositeDisposable;

  constructor() {
    this.element = new Element()
    this.statusIcon = null
    this.subscriptions = new CompositeDisposable()

    this.element.render()
    this.subscriptions.add(atom.config.observe('flint.liveReload', liveReload => {
      this.updateLiveStatus(liveReload)
    }))
  }
  activate(statusBar: Object) {
    this.statusIcon = statusBar.addLeftTile({
      item: this.element.element,
      priority: -100
    })
  }
  setActive(paneItem) {
    if (this.active) {
      this.active.dispose()
      this.active = null
    }
    if (paneItem) {
      const connection = paneItem.getConnection()
      if (connection) {
        this.updateConnectionStatus(connection.status)
        this.active = connection.onDidChangeStatus(status => {
          this.updateConnectionStatus(status)
        })
      }
    } else {
      this.updateConnectionStatus('Idle')
    }
  }
  updateConnectionStatus(status: string) {
    this.element.updateConnectionStatus(status)
  }
  updateLiveStatus(status: string) {
    this.element.updateLiveStatus(status)
  }
  dispose() {
    this.subscriptions.dispose()
    if (this.active) {
      this.active.dispose()
    }
    if (this.statusIcon) {
      this.statusIcon.destroy()
    }
  }
}
