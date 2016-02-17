'use babel'

import {jsx, createClass} from 'vanilla-jsx'
/** @jsx jsx */

export default createClass({
  renderView() {
    return <motion-status class="inline-block">
      Motion
      <span>Connection: <span ref="connection">Idle</span></span>
    </motion-status>
  },
  updateConnectionStatus(status) {
    this.refs.connection.textContent = status
  },
})
