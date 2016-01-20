'use babel'

import {CompositeDisposable} from 'atom'
import StatusIconElement from './elements/status-icon'
import {getStatusText} from './helpers'

export default class StatusIcon {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.element = new StatusIconElement()
    this.statusIcon = null
    this.activePaneSubscriptions = null

    this.subscriptions.add(this.element)
  }
  attach(statusBar) {
    this.statusIcon = statusBar.addLeftTile({
      item: this.element.element,
      priority: -100
    })
  }
  updateStatus(status) {
    this.element.updateStatus(status)
  }
  setActivePane(paneItem) {
    if (this.activePaneSubscriptions) {
      this.activePaneSubscriptions.dispose()
      this.activePaneSubscriptions = null
    }
    if (paneItem) {
      const connection = paneItem.getConnection()
      this.updateStatus(getStatusText(connection.status))
      this.activePaneSubscriptions = connection.onDidStatusChange(status => {
        this.updateStatus(getStatusText(status))
      })
    } else {
      this.updateStatus('Idle')
    }
  }
  dispose() {
    if (this.statusIcon) {
      this.statusIcon.destroy()
    }
    this.activePaneSubscriptions = null
    this.subscriptions.dispose()
  }
}
