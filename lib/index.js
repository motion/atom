'use babel'

import Flint from './main'

module.exports = {
  activate() {
    this.flint = new Flint()
    this.flint.activate()
  },
  dispose() {
    this.flint.dispose()
  }
}
