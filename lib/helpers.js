'use babel'

import {join as joinPath} from 'path'
import {readFile} from 'fs'

export function obtainConfig(projectPath, config) {
  const manifestPath = joinPath(projectPath, '.flint', '.internal', 'state.json')
  readFile(manifestPath, function(error, result) {
    if (error) {
      console.debug('No flint state file found in', projectPath)
    } else {
      let parsed
      try {
        parsed = JSON.parse(result)
      } catch (_) {
        showError(new Error(`Malformed state file found at ${manifestPath}`))
        return
      }
      config.found = true
      config.manifest = parsed
    }
  })
}

export function showError(e) {
  atom.notifications.addError(`[Flint] ${e.message}`, {
    detail: e.stack,
    dismissable: true
  })
}
