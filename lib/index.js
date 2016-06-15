'use babel'

import Motion from './main'

module.exports = {
  config: {
    liveReload: {
      description: 'Automatically reload motion page in editor',
      type: 'boolean',
      default: true
    }
  },
  activate() {
    require('atom-package-deps').install()
    this.motion = new Motion()
    this.motion.activate()
  },
  dispose() {
    this.motion.dispose()
  }
}
