/* @flow */

import Motion from './main'

module.exports = {
  activate() {
    this.motion = new Motion()
    this.motion.activate()
  },
  dispose() {
    this.motion.dispose()
  },
}
