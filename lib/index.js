'use babel'

import Flint from './main'

module.exports = {
  config: {
    liveReload: {
      description: 'Automatically reload flint page in editor',
      type: 'boolean',
      default: true
    },
    lintingDelay: {
      description: 'Delay for updating lint messages in editor in ms',
      type: 'integer',
      minimum: 0,
      default: 300
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
  provideAutocomplete() {
    return this.flint.autocomplete
  },
  dispose() {
    this.flint.dispose()
  }
}
