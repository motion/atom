'use babel'

import {CompositeDisposable} from 'atom'
import StatusIconElement from './elements/status-icon'

export default class StatusIcon {
  constructor() {
    this.subscriptions = new CompositeDisposable()
    this.element = new StatusIconElement()
    this.statusIcon = null

    this.subscriptions.add(this.element)
  }
  attach(statusBar) {
    this.statusIcon = statusBar.addLeftTile({
      item: this.element.element,
      priority: -100
    })
  }
  setStatus(status) {
    this.element.updateStatus(status)
  }
  dispose() {
    if (this.statusIcon) {
      this.statusIcon.destroy()
    }
    this.subscriptions.dispose()
  }
}
