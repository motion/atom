'use babel'

const Path = require('path')
const FS = require('fs')

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

export function showError(e) {
  atom.notifications.addError(`[Flint] ${e.message}`, {
    detail: e.stack,
    dismissable: true
  })
}
