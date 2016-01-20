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

    this.element.render()

    this.subscriptions.add(this.element)
    this.subscriptions.add(atom.config.observe('steel-flint.liveReload', liveReload => {
      this.updateLiveStatus(liveReload)
    }))
  }
  attach(statusBar) {
    this.statusIcon = statusBar.addLeftTile({
      item: this.element.element,
      priority: -100
    })
  }
  updateConnectionStatus(status) {
    this.element.updateConnectionStatus(status)
  }
  updateLiveStatus(status) {
    this.element.updateLiveStatus(status)
  }
  setActivePane(paneItem) {
    if (this.activePaneSubscriptions) {
      this.activePaneSubscriptions.dispose()
      this.activePaneSubscriptions = null
    }
    if (paneItem) {
      const connection = paneItem.getConnection()
      this.updateConnectionStatus(getStatusText(connection.status))
      this.activePaneSubscriptions = connection.onDidStatusChange(status => {
        this.updateConnectionStatus(getStatusText(status))
      })
    } else {
      this.updateConnectionStatus('Idle')
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
