'use babel'

/* @flow */

import FS from 'fs'
import {spawn} from 'child_process'
import promisify from 'sb-promisify'
import type {Grammar} from 'atom'

let remote
try {
  remote = require('electron').remote
} catch (_) {
  remote = require('remote')
}

export const WEBSOCKET_STATUS = {
  CLOSED: 'Closed',
  CONNECTED: 'Connected',
  CONNECTING: 'Connecting'
}
const MESSAGE_EXTRACTION_REGEXP = /: ([\S ]+) \(/

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
  atom.notifications.addError(`[Motion] ${message}`, {
    detail: detail,
    dismissable: true
  })
}

export function getErrorMessage(error: string): string {
  const matches = MESSAGE_EXTRACTION_REGEXP.exec(error)
  if (matches) {
    return matches[1]
  }
  return error
}

export function createJumpRange(position: [number, number], length: number) {
  return [[position[0], position[1]], [position[0], position[1] + length + 1]]
}

export function focusWindow() {
  remote.getCurrentWindow().focus()
}
