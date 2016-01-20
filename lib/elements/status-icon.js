'use babel'

import {jsx, createClass} from 'vanilla-jsx'
/** @jsx jsx */

export default createClass({
  renderView() {
    return <flint-status>
      Flint: <span ref="status">Not connected</span>
    </flint-status>
  },
  updateStatus(status) {
    this.refs.status.textContent = status
  }
})
