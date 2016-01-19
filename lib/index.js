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
  consumeLinter(indieRegistry) {
    const linter = indieRegistry.register({name: 'Flint'})
    this.flint.consumeLinter(linter)
  },
  dispose() {
    this.flint.dispose()
  }
}
