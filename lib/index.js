'use babel'

import {Motion} from './main'
import {ensureUninstalled} from './helpers'

module.exports = {
  config: {
    liveReload: {
      description: 'Automatically reload motion page in editor',
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
    this.motion = new Motion()
    this.motion.activate()
    ensureUninstalled('steel-flint')
    ensureUninstalled('intelli-colorpicker')
    ensureUninstalled('number-range')
    ensureUninstalled('flint')
    ensureUninstalled('language-flint')
  },
  consumeLinter(indieRegistry) {
    const linter = indieRegistry.register({name: 'Motion'})
    this.motion.consumeLinter(linter)
  },
  consumeStatusbar(statusBar) {
    this.motion.consumeStatusbar(statusBar)
  },
  provideAutocomplete() {
    return this.motion.provideAutocomplete()
  },
  provideDeclarations() {
    return this.motion.provideDeclarations()
  },
  dispose() {
    this.motion.dispose()
  }
}
