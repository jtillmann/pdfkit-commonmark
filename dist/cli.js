#!/usr/bin/env node
var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pdfkit = require('pdfkit');

var _pdfkit2 = _interopRequireDefault(_pdfkit);

var _commonmark = require('commonmark');

var _commonmark2 = _interopRequireDefault(_commonmark);

var _commonmarkPdfkitRenderer = require('./commonmark-pdfkit-renderer');

var _commonmarkPdfkitRenderer2 = _interopRequireDefault(_commonmarkPdfkitRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// get input file info
var inputFilePath = process.argv[2];
var absInputFilePath = _path2['default'].resolve(__dirname, inputFilePath);

// check input file exists
if (!_fs2['default'].existsSync(absInputFilePath)) {
    console.error('File not found:', absInputFilePath);
    process.exit(1);
}

// get/define output file info
var baseName = _path2['default'].basename(inputFilePath);
var outputFilePath = process.argv[3] || String(baseName) + '.pdf';
var absOutputFilePath = _path2['default'].resolve(__dirname, outputFilePath);

var fileContents = void 0,
    parsed = void 0;

// read input
try {
    fileContents = _fs2['default'].readFileSync(absInputFilePath, 'utf8');
} catch (e) {
    console.error('Could not read file \'' + String(absInputFilePath) + '\': ' + String(e.message));
    process.exit(2);
}

// get parser instance
var reader = new _commonmark2['default'].Parser();

// parse input
try {
    parsed = reader.parse(fileContents);
} catch (e) {
    console.error('Could not parse contents of file \'' + String(absInputFilePath) + '\': ' + String(e.message));
    process.exit(3);
}

// get renderer instance
var writer = new _commonmarkPdfkitRenderer2['default']();

// create pdf document
var doc = new _pdfkit2['default']();

// pipe document to output file
doc.pipe(_fs2['default'].createWriteStream(absOutputFilePath));

// render the parsed content
writer.render(doc, parsed);

// close the document
doc.end();