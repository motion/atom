'use babel'

import {CompositeDisposable, Emitter} from 'atom'

export class Commands {
  constructor() {
    this.subscriptions = new CompositeDisposable()
  }
  activate() {
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'motion:toggle-live-reload': function() {
        atom.config.set('motion.liveReload', !atom.config.get('motion.liveReload'))
      }
    }))
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
