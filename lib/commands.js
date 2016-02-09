'use babel'

import {CompositeDisposable, Emitter} from 'atom'

export default class Commands {
  constructor() {
    this.subscriptions = new CompositeDisposable()
  }
  activate() {
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'flint:toggle-live-reload': function() {
        atom.config.set('flint.liveReload', !atom.config.get('flint.liveReload'))
      }
    }))
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
