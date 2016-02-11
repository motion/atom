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
  },
  consumeLinter(indieRegistry) {
    const linter = indieRegistry.register({name: 'Flint'})
    this.flint.consumeLinter(linter)
  },
  consumeStatusbar(statusBar) {
    // TODO: Make this work
    // this.flint.consumeStatusBar(statusBar)
  },
  provideAutocomplete() {
    // TODO: Make this work
    return []
  },
  dispose() {
    this.flint.dispose()
  }
}
