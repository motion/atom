/* @flow */

import Motion from './main'

module.exports = {
  activate() {
    // eslint-disable-next-line global-require
    require('atom-package-deps').install('motion', true)

    this.motion = new Motion()
    this.motion.activate()
  },
  dispose() {
    this.motion.dispose()
  },
}
