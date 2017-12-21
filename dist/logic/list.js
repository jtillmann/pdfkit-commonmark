Object.defineProperty(exports, "__esModule", {
    value: true
});
var arabicIndent = exports.arabicIndent = function arabicIndent(doc, count) {
    return doc.widthOfString(String(count) + '.') + 5;
};

var discIndent = exports.discIndent = function discIndent(doc, fontSize) {
    return (fontSize || 12) * 1.5;
}; // eslint-disable-line no-unused-vars

/**
 * Return the calculated indent for the given listStyle,
 * listCount, fontSize and document.
 *
 * @param {PDFKitDocument} document
 * @param {string} listStyle
 * @param {number} listCount
 * @param {number} fontSize
 * @returns {number} The indent for the given list parameters
 */
var indent = exports.indent = function indent(document, listStyle, listCount, fontSize) {

    switch (listStyle) {
        case 'arabic':
            return arabicIndent(document, listCount);
        case 'disc':
        default:
            return discIndent(document, fontSize);
    }
};