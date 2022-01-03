const $ = require('gogocode')

const FILE_PATH = 'dist/component.es.js'

function rewrite () {
    const next = $.loadFile(FILE_PATH).after('import "./style.css";').generate()
    $.writeFile(next, FILE_PATH)
}

rewrite()
