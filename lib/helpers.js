'use babel'

/* @flow */

import FS from 'fs'
import {spawn} from 'child_process'
import promisify from 'sb-promisify'
import type {Grammar} from 'atom'

export const WEBSOCKET_STATUS = {
  CLOSED: 'Closed',
  CONNECTED: 'Connected',
  CONNECTING: 'Connecting'
}

export const readFile = promisify(FS.readFile)
export const realPath = promisify(FS.realpath)
export function exists(filePath: string): Promise<boolean> {
  return new Promise(function(resolve) {
    // $FlowIgnore: Flow doesn't recognize FS.R_OK
    FS.access(filePath, FS.R_OK, function(error) {
      resolve(error === null)
    })
  })
}

export function ensureUninstalled(name: string) {
  if (atom.packages.isPackageLoaded(name)) {
    atom.packages.deactivatePackage(name)

    const apm = atom.packages.getApmPath()
    spawn(apm, ['uninstall', '--hard', name])
    atom.notifications.addSuccess('[Flint] Automatic package removal', {detail: `The package ${name} was no longer required and has been removed automatically`})
  }
}

export function getGrammarByName(scopeName: string): ?Grammar {
  const grammars = atom.grammars.getGrammars()
  for (const grammar of grammars) {
    if (grammar.scopeName === scopeName) {
      return grammar
    }
  }
  return null
}

export function showError(message: string | Error, detail: ?string = null) {
  if (message instanceof Error) {
    detail = message.stack
    message = message.message
  }
  atom.notifications.addError(`[Flint] ${message}`, {
    detail: detail,
    dismissable: true
  })
}
