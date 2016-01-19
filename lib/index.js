'use babel'

import Flint from './main'

module.exports = {
  config: {
    liveReload: {
      description: 'Automatically reload flint page in editor',
      type: 'boolean',
      default: true
    }
  },
  activate() {
    this.flint = new Flint()
    this.flint.activate()
  },
  dispose() {
    this.flint.dispose()
  }
}
