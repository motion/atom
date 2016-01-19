'use babel'

import {join as joinPath} from 'path'
import {readFile} from 'fs'

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

export function obtainConfig(projectPath) {
  return new Promise(function(resolve) {
    const manifestPath = joinPath(projectPath, '.flint', '.internal', 'state.json')
    readFile(manifestPath, function(error, result) {
      if (error) {
        console.debug('No flint state file found in', projectPath)
        resolve(null)
      } else {
        let parsed
        try {
          parsed = JSON.parse(result)
        } catch (_) {
          showError(new Error(`Malformed state file found at ${manifestPath}`))
          resolve(null)
          return
        }
        resolve({path: projectPath, manifest: parsed})
      }
    })
  })
}

export function showError(e) {
  atom.notifications.addError(`[Flint] ${e.message}`, {
    detail: e.stack,
    dismissable: true
  })
}
