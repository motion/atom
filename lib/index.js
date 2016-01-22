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
    require('atom-package-deps').install().then(function() {
      atom.config.set('color-picker.automaticReplace', true)
    })
    this.flint = new Flint()
    this.flint.activate()
  },
  consumeLinter(indieRegistry) {
    const linter = indieRegistry.register({name: 'Flint'})
    this.flint.consumeLinter(linter)
  },
  consumeStatusbar(statusBar) {
    this.flint.consumeStatusBar(statusBar)
  },
  dispose() {
    this.flint.dispose()
  }
}
