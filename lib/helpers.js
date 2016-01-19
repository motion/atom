'use babel'

import {join as joinPath} from 'path'
import {readFile} from 'fs'

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
