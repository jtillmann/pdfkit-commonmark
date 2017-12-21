Object.defineProperty(exports, "__esModule", {
    value: true
});
var forHeadingLevel = exports.forHeadingLevel = function forHeadingLevel(level) {
    switch (level) {
        case 1:
            return 'heading-bold';
        case 2:
            return 'heading-bold';
        case 3:
            return 'heading-default';
        case 4:
            return 'heading-bold';
        default:
            return 'heading-default';
    }
};

var sizeForHeadingLevel = exports.sizeForHeadingLevel = function sizeForHeadingLevel(level) {
    var baseSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 12;

    switch (level) {
        case 1:
            return baseSize * 1.4;
        case 2:
            return baseSize * 1.2;
        case 3:
            return baseSize * 1.2;
        default:
            return baseSize;
    }
};

/**
 * Get the defined font for the given
 * internal name from the supplied
 * options map.
 *
 * @param {string} internalName
 * @param {object} options
 * @returns {string} The actual font name to use with pdfkit
 */
var forInternalName = exports.forInternalName = function forInternalName(internalName, options) {

    if (!options || !options.fonts) {
        throw new Error('missing options.fonts');
    }

    return options.fonts[internalName];
};