Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _font = require('./font');

var Font = _interopRequireWildcard(_font);

var _list = require('./list');

var List = _interopRequireWildcard(_list);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Execute the given operation on the given document.
 *
 * @param {object} operation
 * @param {PDFDocument} doc
 * @param {object} options
 */
exports['default'] = function (operation, doc, options) {

    if (!options || options.debug) {
        console.log('executing operations', operation);
    }

    if (operation.moveDown) {
        doc.moveDown();
    }

    if (operation.moveUp) {
        doc.moveUp();
    }

    if (operation.font) {
        doc.font(Font.forInternalName(operation.font, options));
    }

    if (operation.fontSize) {
        doc.fontSize(operation.fontSize);
    }

    if (operation.fillColor) {
        doc.fillColor(operation.fillColor);
    }

    if (operation.listItem) {

        var textHeight = doc.heightOfString('The quick brown fox jumps over the lazy dog');
        if (textHeight + doc.y > doc.page.height - doc.page.margins.bottom) {
            var oldX = doc.x;
            doc.addPage();
            doc.x = oldX;
        }

        var renderDisc = function renderDisc(doc) {
            var radius = (options.fontSize || 12) * .15;
            var x = doc.x - 6 * radius;
            var y = doc.y + textHeight / 2 - radius / 2;
            doc.circle(x, y, radius).fill();
        };

        var renderArabic = function renderArabic(doc) {
            var oldX = doc.x;
            var x = doc.x - List.arabicIndent(doc, operation.listItemCount);
            var y = doc.y;
            var index = operation.listItemIndex + 1;
            console.log('_renderArabic', x, y, operation.listItemIndex, index);
            doc.text(String(index) + '.', x, y, { continued: false });
            doc.moveUp();
            doc.x = oldX;
        };

        switch (operation.listItemStyle) {
            case 'arabic':
                renderArabic(doc);
                break;
            case 'disc':
            default:
                renderDisc(doc);
        }
    }

    // indent for lists
    if (operation.listDepth >= 0) {
        var indent = List.indent(doc, operation.listItemStyle, operation.listItemCount, options.fontSize);
        doc.x = options.initialPosition.x + operation.listDepth * indent;
    }

    if (operation.hasOwnProperty('text')) {
        // the space on empty/missing text is required, as pdfkit
        // would otherwise ignore the command
        var textOptions = (0, _assign2['default'])({}, options.pdfkit, {
            continued: operation.continued,
            // requires false, to stop the link: https://github.com/devongovett/pdfkit/issues/464
            link: operation.link || false,
            underline: operation.underline || false
        });

        if ((options.pdfkit || {}).hasOwnProperty('width')) {
            var _indent = doc.x - options.initialPosition.x;
            if (_indent > 0) {
                textOptions.width -= _indent;
            }
        }

        doc.text(operation.text || ' ', textOptions);
    }
};