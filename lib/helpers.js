'use babel'

import {Range} from 'atom'
import promisify from 'sb-promisify'

const FS = require('fs')
const MESSAGE_EXTRACTION_REGEXP = /[\S ]+: ([\S ]+)\(/

export const readFile = promisify(FS.readFile)
export const realPath = promisify(FS.realpath)

export function fileExists(filePath, fail = true) {
  return new Promise(function(resolve, reject) {
    FS.access(filePath, FS.R_OK, function(error) {
      if (error && fail) {
        reject(error)
      } else resolve(error === null)
    })
  })
}

export function showError(message, detail = null) {
  if (message instanceof Error) {
    detail = message.stack
    message = message.message
  }
  atom.notifications.addError(`[Flint] ${message}`, {
    detail: detail,
    dismissable: true
  })
}

export function getMessage(error) {
  const matches = MESSAGE_EXTRACTION_REGEXP.exec(error.message)
  if (matches === null) {
    return error.message
  } else {
    return matches[1]
  }
}

export function getStatusText(status) {
  switch(status) {
    case WebSocket.OPEN:
      return 'Connected';
    case WebSocket.CLOSED:
      return 'Disconnected';
    case WebSocket.CONNECTING:
      return 'Connecting';
    default:
      console.debug('[Flint] Unknown websocket status', status)
      return 'Unknown'
  }
}

export function debounce(callback, delay) {
  let timeout = null
  return function(arg) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback.call(this, arg)
    }, delay)
  }
}

export function aggressiveDebounce(callback, delay) {
  let timeout = null
  let latestArg = null
  return function(_) {
    latestArg = _
    if (timeout === null) {
      timeout = setTimeout(() => {
        timeout = null
        callback.call(this, latestArg)
      }, delay)
    }
  }
}

export function pointInRange(point, range) {
  return point.isGreaterThanOrEqual(range[0]) && point.isLessThanOrEqual(range[1])
}
