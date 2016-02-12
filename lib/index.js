'use babel'

import {Flint} from './main'
import {ensureUninstalled} from './helpers'

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
      atom.config.set('autocomplete-plus.enableBuiltinProvider', false)
      atom.packages.disablePackage('autocomplete-snippets')
    })
    this.flint = new Flint()
    this.flint.activate()
    ensureUninstalled('steel-flint')
    ensureUninstalled('intelli-colorpicker')
    ensureUninstalled('number-range')
  },
  consumeLinter(indieRegistry) {
    const linter = indieRegistry.register({name: 'Flint'})
    this.flint.consumeLinter(linter)
  },
  consumeStatusbar(statusBar) {
    this.flint.consumeStatusbar(statusBar)
  },
  provideAutocomplete() {
    return this.flint.provideAutocomplete()
  },
  dispose() {
    this.flint.dispose()
  }
}
