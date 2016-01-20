'use babel'

import {jsx, createClass} from 'vanilla-jsx'
/** @jsx jsx */

export default createClass({
  renderView() {
    return <flint-status class="inline-block">
      Flint
      <span>Connection: <span ref="connection">Not connected</span></span>
      <span>Live: <span ref="live">Disabled</span></span>
    </flint-status>
  },
  updateConnectionStatus(status) {
    this.refs.connection.textContent = status
  },
  updateLiveStatus(status) {
    this.refs.live.textContent = status ? 'Enabled' : 'Disabled'
  }
})
