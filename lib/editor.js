'use babel'

/* @flow */

import Path from 'path'
import { CompositeDisposable, Emitter } from 'sb-event-kit'
import { findCachedAsync } from 'atom-linter'
import type { Disposable } from 'sb-event-kit'
import type { TextEditor } from 'atom'

// Matches $root only, not the surroundings
const MAGIC_CONTENT = /['"](\$[\S ]*)['"]/
// Matches all $root requires and imports
const MAGICAL_REGEX = /export ?[\S ]+ ?from ?['"](\$[\S ]*)['"]|import ?[\S ]+ ?from ?['"](\$[\S ]*)['"]|require\(['"](\$[\S ]*['"])\)/g

let queue = Promise.resolve()

export default class Editor {
  emitter: Emitter;
  subscriptions: CompositeDisposable;

  constructor(editor: TextEditor) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(editor.onDidDestroy(() => {
      this.destroy()
    }))
    this.subscriptions.add(editor.onDidStopChanging(() => {
      queue = queue.then(async function() {
        const editorPath = editor.getPath()
        let rootDirectory = await findCachedAsync(Path.dirname(editorPath), ['node_modules', 'package.json'])
        if (!rootDirectory) {
          return
        }
        rootDirectory = Path.dirname(rootDirectory)
        editor.scan(MAGICAL_REGEX, function({ matchText, replace }) {
          const replacementText = matchText.replace(MAGIC_CONTENT, function(_, match) {
            const newPath = Path.join(rootDirectory, match.substr(1))
            let relativePath = Path.relative(Path.dirname(editorPath), newPath)
            if (relativePath.substr(0, 1) !== '.') {
              relativePath = `./${relativePath}`
            }
            return `'${relativePath}'`
          })
          replace(replacementText)
        })
      })
    }))
  }
  destroy() {
    this.emitter.emit('did-destroy')
    this.dispose()
  }
  onDidDestroy(callback: Function): Disposable {
    return this.emitter.on('did-destroy', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
