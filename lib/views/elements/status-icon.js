'use babel'

import {jsx, createClass} from 'vanilla-jsx'
/** @jsx jsx */

export default createClass({
  renderView() {
    return <motion-status class="inline-block">
      Motion
      <span>Connection: <span ref="connection">Idle</span></span>
      <span>Live: <span ref="live">Disabled</span></span>
    </motion-status>
  },
  updateConnectionStatus(status) {
    this.refs.connection.textContent = status
  },
  updateLiveStatus(status) {
    this.refs.live.textContent = status ? 'Enabled' : 'Disabled'
  }
})
