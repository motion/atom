'use babel'

import StatusIcon from '../../lib/elements/status-icon'

describe('Status Icon', function() {
  it('works', function() {
    const icon = new StatusIcon()

    expect(icon.element instanceof HTMLElement).toBe(true)
    expect(icon.refs.connection.textContent).toBe('Not connected')
    icon.updateConnectionStatus('Connected')
    expect(icon.refs.connection.textContent).toBe('Connected')
    icon.updateConnectionStatus('Idle')
    expect(icon.refs.connection.textContent).toBe('Idle')

    expect(icon.refs.live.textContent).toBe('Disabled')
    icon.updateLiveStatus(true)
    expect(icon.refs.live.textContent).toBe('Enabled')
    icon.updateLiveStatus(null)
    expect(icon.refs.live.textContent).toBe('Disabled')
    icon.updateLiveStatus(50)
    expect(icon.refs.live.textContent).toBe('Enabled')
    icon.updateLiveStatus(40)
    expect(icon.refs.live.textContent).toBe('Enabled')
    icon.updateLiveStatus(0)
    expect(icon.refs.live.textContent).toBe('Disabled')
  })
})
