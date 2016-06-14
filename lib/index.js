'use babel'

import {Motion} from './main'
import {ensureUninstalled} from './helpers'

module.exports = {
  config: {
    liveReload: {
      description: 'Automatically reload motion page in editor',
      type: 'boolean',
      default: true
    }
  },
  activate() {
    require('atom-package-deps').install().then(function() {
      atom.config.set('color-picker.automaticReplace', true)
      atom.config.set('autocomplete-plus.enableBuiltinProvider', false)
    })
    this.motion = new Motion()
    this.motion.activate()
  },
  provideAutocomplete() {
    return this.motion.provideAutocomplete()
  },
  provideDeclarations() {
    return this.motion.provideDeclarations()
  },
  provideLinter() {
    return this.motion.provideLinter()
  },
  dispose() {
    this.motion.dispose()
  }
}
