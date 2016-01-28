'use babel'

import {Range} from 'atom'

const FS = require('fs')
const MESSAGE_EXTRACTION_REGEXP = /[\S ]+: ([\S ]+)\(/

export function promisify(callback){
  return function promisified(){
    const parameters = arguments
    const parametersLength = arguments.length + 1
    return new Promise((resolve, reject) => {
      Array.prototype.push.call(parameters, function(error, data) {
        if (error) {
          reject(error)
        } else resolve(data)
      })
      if (parametersLength === 1) {
        callback.call(this, parameters[0])
      } else if (parametersLength === 2) {
        callback.call(this, parameters[0], parameters[1])
      } else if (parametersLength === 3) {
        callback.call(this, parameters[0], parameters[1], parameters[2])
      } else if (parametersLength === 4) {
        callback.call(this, parameters[0], parameters[1], parameters[2], parameters[3])
      } else {
        callback.apply(this, parameters)
      }
    })
  }
}

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

export function rangeFromCompilerLocation(location) {
  return Range.fromObject([[location.start.line - 1, location.start.column], [location.end.line - 1, location.end.column]])
}
