'use babel'

export default class Autocomplete {
  selector = '.source.js, .source.js.jsx'
  disableForSelector = '.comment'
  inclusionPriority = 100
  excludeLowerPriority = false
  constructor() {

  }
  getSuggestions({editor, bufferPosition, prefix}) {
    return []
  }
  dispose() {

  }
}
