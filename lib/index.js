/* @flow */

import Motion from './main'

module.exports = {
  activate() {
    require('atom-package-deps').install('motion')
    this.motion = new Motion()
    this.motion.activate()
  },
  dispose() {
    this.motion.dispose()
  }
}
