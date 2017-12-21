Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _deepDefaults = require('deep-defaults');

var _deepDefaults2 = _interopRequireDefault(_deepDefaults);

var _executeOperation = require('./logic/execute-operation');

var _executeOperation2 = _interopRequireDefault(_executeOperation);

var _font = require('./logic/font');

var Font = _interopRequireWildcard(_font);

var _defaultOptions = require('./default-options');

var _defaultOptions2 = _interopRequireDefault(_defaultOptions);

var _list = require('./logic/list');

var List = _interopRequireWildcard(_list);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * An implementation of an renderer for commonmark. Using
 * pdfkit for rendering of the pdf.
 */
var CommonmarkPDFKitRenderer = function () {
    function CommonmarkPDFKitRenderer() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3['default'])(this, CommonmarkPDFKitRenderer);


        if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3['default'])(options)) !== 'object' || Array.isArray(options)) {
            throw new Error('options must be a plain object');
        }

        // apply default options
        (0, _deepDefaults2['default'])(options, _defaultOptions2['default']);

        this.options = options;
    }

    /**
     * Takes a commonmark node tree and converts it into our
     * intermediate operations format.
     *
     * For information on the commonmark nodeTree
     * {@see https://github.com/commonmark/commonmark.js#usage}.
     *
     * @param {object} nodeTree
     * @returns {Array} of operations
     */


    (0, _createClass3['default'])(CommonmarkPDFKitRenderer, [{
        key: 'operations',
        value: function () {
            function operations(nodeTree) {

                var walker = nodeTree.walker();
                var event = void 0,
                    node = void 0;

                // array holding the extracted operations
                var operations = [];

                var PDFOperationPropertyStack = function () {
                    function PDFOperationPropertyStack() {
                        (0, _classCallCheck3['default'])(this, PDFOperationPropertyStack);

                        this.stack = [];
                    }

                    /**
                     * Push instance to the stack
                     * @param instance
                     * @returns {PDFOperationPropertyStack} the stack instance
                     */


                    (0, _createClass3['default'])(PDFOperationPropertyStack, [{
                        key: 'push',
                        value: function () {
                            function push(instance) {
                                this.stack.push(instance);
                                return this;
                            }

                            return push;
                        }()

                        /**
                         * Remove the top-most item from the stack and return it.
                         * @returns {*} the top-most item of the stack
                         */

                    }, {
                        key: 'pop',
                        value: function () {
                            function pop() {
                                return this.stack.pop();
                            }

                            return pop;
                        }()

                        /**
                         * Returns the top-most item of the stack, {@see #pop},
                         * without removing it from the stack.
                         *
                         * @returns {*} the top-most item of the stack
                         */

                    }, {
                        key: 'peek',
                        value: function () {
                            function peek() {
                                if (this.stack.length === 0) return undefined;
                                return this.stack[this.stack.length - 1];
                            }

                            return peek;
                        }()

                        /**
                         * Returns the union of all stack items. Where
                         * properties from items higher up the stack will
                         * overwrite properties from items lower in the
                         * stack.
                         *
                         * @returns {*}
                         */

                    }, {
                        key: 'get',
                        value: function () {
                            function get() {
                                var additional = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                                var stackUnion = this.stack.reduce(function (reduced, current) {
                                    return (0, _assign2['default'])(reduced, current);
                                }, {});
                                return (0, _assign2['default'])(stackUnion, additional);
                            }

                            return get;
                        }()

                        /**
                         * Return the top-most object from the stack having
                         * set the requested property
                         *
                         * @param {string|Symbol} property to search for
                         * @returns {*} the top-most item on the stack having the requested property
                         */

                    }, {
                        key: 'find',
                        value: function () {
                            function find(property) {
                                for (var i = this.stack.length - 1; i >= 0; i--) {
                                    var f = this.stack[i];
                                    if (f.hasOwnProperty(property)) {
                                        return f;
                                    }
                                }
                                return undefined;
                            }

                            return find;
                        }()

                        /**
                         * Returns the property-value from the top-most item
                         * where the requested property is defined.
                         *
                         * {@see #find}
                         *
                         * @param {string|Symbol} property property to search for
                         * @returns {*} the property-value of the top-most item on the stack having the requested property
                         */

                    }, {
                        key: 'getValue',
                        value: function () {
                            function getValue(property) {
                                var frame = this.find(property);
                                if (frame) {
                                    return frame[property];
                                }
                                return undefined;
                            }

                            return getValue;
                        }()

                        /**
                         * Returns the incremented property value from the
                         * top-most item where the requested property is
                         * defined.
                         *
                         * @param property
                         * @param {number} [inc] defaults to 1
                         * @returns {number}
                         */

                    }, {
                        key: 'getIncValue',
                        value: function () {
                            function getIncValue(property) {
                                var inc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

                                var frame = this.find(property);
                                if (frame) {
                                    if (typeof frame[property] !== 'number') {
                                        throw new Error('property \'' + String(property) + '\' must be a number');
                                    }
                                    frame[property] += inc;
                                    return frame[property];
                                }
                                return undefined;
                            }

                            return getIncValue;
                        }()
                    }]);
                    return PDFOperationPropertyStack;
                }();

                var stack = new PDFOperationPropertyStack();

                // define initial values
                stack.push({
                    font: 'default',
                    fontSize: this.options.fontSize || 12,
                    fillColor: 'black',
                    strokeColor: 'black',
                    fillOpacity: 1,
                    strokeOpacity: 1,
                    continued: false,
                    listDepth: 0
                });

                /*
                     text
                        emp -> push(font=italic)
                            link -> push(link,fillColor,underline)
                                strong -> push(font=bold-italic)
                                /strong -> pull(font)
                            /link -> pull(link, fillColor, underline)
                        /emp -> pull(font)
                        text
                        /text
                    /text
                  */

                var lastOperationWith = function () {
                    function lastOperationWith(property) {
                        for (var i = operations.length - 1; i >= 0; i--) {
                            var operation = operations[i];
                            if (operation.hasOwnProperty(property)) {
                                return operation;
                            }
                        }
                        return undefined;
                    }

                    return lastOperationWith;
                }();

                var mapListTypes = function () {
                    function mapListTypes(type) {
                        var defaultListStyleType = 'disc';
                        switch (type) {
                            case 'bullet':
                                return 'disc';
                            case 'ordered':
                                return 'arabic';
                            default:
                                console.error('unkown list type \'' + String(type) + '\', falling back to default: ' + defaultListStyleType);
                                return defaultListStyleType;
                        }
                    }

                    return mapListTypes;
                }();

                // walk the commonmark AST
                while (event = walker.next()) {

                    node = event.node;

                    var previousOperation = operations[operations.length - 1];

                    var moveDown = function () {
                        function moveDown() {
                            var moveDownIsAllowed = stack.getValue('listDepth') === 0;
                            if (moveDownIsAllowed) {
                                operations.push({
                                    moveDown: true
                                });
                            }
                        }

                        return moveDown;
                    }();

                    switch (node.type) {
                        case 'text':
                            {
                                if (event.entering) {
                                    operations.push(stack.get({
                                        text: node.literal
                                    }));
                                }
                                break;
                            }

                        case 'softbreak':
                            {
                                if (event.entering) {
                                    var previousText = lastOperationWith('text');
                                    // check if previous texts ends on whitespace
                                    if (previousText && !/ $/.test(previousText.text)) {
                                        // if not, add an additional whitespace operation
                                        operations.push({
                                            text: ' ',
                                            continued: true
                                        });
                                    }
                                }
                                break;
                            }
                        case 'linebreak':
                            {
                                if (event.entering) {
                                    // must discontinue any open text
                                    if (previousOperation && previousOperation.continued === true) {
                                        previousOperation.continued = false;
                                    }
                                    operations.push(stack.get({
                                        continued: true,
                                        text: '\n'
                                    }));
                                } else {
                                    // this case is never called!
                                }
                                break;
                            }
                        case 'emph':
                            {
                                if (event.entering) {
                                    var nextFont = stack.getValue('font') === 'bold' ? 'bold-italic' : 'italic';
                                    operations.push(stack.push({ font: nextFont }).get());
                                } else {
                                    stack.pop();
                                    operations.push(stack.get());
                                }
                                break;
                            }
                        case 'strong':
                            {
                                if (event.entering) {
                                    var _nextFont = stack.getValue('font') === 'italic' ? 'bold-italic' : 'bold';
                                    operations.push(stack.push({ font: _nextFont }).get());
                                } else {
                                    stack.pop();
                                    operations.push(stack.get());
                                }
                                break;
                            }
                        case 'link':
                            {
                                if (event.entering) {
                                    operations.push(stack.push({
                                        fillColor: 'blue',
                                        link: node.destination,
                                        underline: true
                                    }).get());
                                } else {
                                    stack.pop();
                                    operations.push(stack.get());
                                }
                                break;
                            }
                        case 'image':
                            // unsupported
                            break;
                        case 'code':
                            // unsupported
                            // TODO
                            break;
                        case 'document':
                            // ignored
                            break;
                        case 'html_inline':
                            // unsupported
                            break;
                        case 'paragraph':
                            {
                                if (event.entering) {
                                    stack.push({
                                        continued: true
                                    });
                                } else {
                                    stack.pop();

                                    lastOperationWith('text').continued = false;

                                    // prevent repeated move down operations
                                    if (!previousOperation.moveDown) {
                                        moveDown();
                                    }
                                }
                                break;
                            }
                        case 'block_quote':
                            {
                                // unsupported
                                // TODO
                                break;
                            }
                        case 'item':
                            {
                                if (event.entering) {

                                    var listItemIndex = stack.getIncValue('listItemIndex');

                                    operations.push(stack.get({
                                        listItem: true,
                                        listItemStyle: mapListTypes(node._listData.type),
                                        listItemIndex: listItemIndex
                                    }));
                                }
                                break;
                            }
                        case 'list':
                            {
                                if (event.entering) {
                                    operations.push(stack.push({
                                        listDepth: stack.getValue('listDepth') + 1,
                                        listItemIndex: -1
                                    }).get({
                                        listItemStyle: mapListTypes(node._listData.type),
                                        list: true
                                    }));
                                } else {
                                    var item = stack.pop();

                                    // find start operation
                                    for (var i = operations.length - 1; i >= 0; i--) {
                                        var operation = operations[i];
                                        // update the listItemCount (used for arabic, as there we need to
                                        // space the number and the list items according to the longest
                                        // number we need to print
                                        if (operation.listDepth === item.listDepth) {
                                            if (operation.listItem === true || operation.list === true) {
                                                operation.listItemCount = item.listItemIndex + 1;
                                            }
                                            if (operation.list === true) {
                                                break;
                                            }
                                        }
                                    }

                                    operations.push(stack.get());
                                    moveDown();
                                }
                                break;
                            }
                        case 'heading':
                            {
                                if (event.entering) {
                                    operations.push(stack.push({
                                        font: Font.forHeadingLevel(node.level),
                                        fontSize: Font.sizeForHeadingLevel(node.level),
                                        continued: true
                                    }).get());
                                } else {
                                    stack.pop();
                                    operations.push(stack.get());

                                    var _previousText = lastOperationWith('text');
                                    if (_previousText) {
                                        _previousText.continued = false;
                                    }

                                    moveDown();
                                }
                                break;
                            }
                        case 'code_block':
                            {
                                // unsupported
                                // TODO
                                break;
                            }
                        case 'html_block':
                            {
                                // unsupported
                                break;
                            }
                        case 'thematic_break':
                            {
                                // unsupported
                                if (event.entering) {
                                    operations.push({
                                        horizontalLine: true
                                    });
                                }
                                break;
                            }
                    }
                }

                var removeRedundancies = function () {
                    function removeRedundancies(operation, index, operations) {

                        var previousState = operations.slice(0, index).reduce(function (reduced, current) {
                            return (0, _assign2['default'])(reduced, current);
                        }, {});

                        //console.log('_', index);
                        //console.log('_previousState', JSON.stringify(previousState));
                        //console.log('_operation____', JSON.stringify(operation));

                        var PROPERTY_RULES = {
                            continued: function () {
                                function continued(current) {
                                    return current.hasOwnProperty('text');
                                }

                                return continued;
                            }(),
                            link: function () {
                                function link(current) {
                                    return current.hasOwnProperty('text');
                                }

                                return link;
                            }(),
                            underline: function () {
                                function underline(current) {
                                    return current.hasOwnProperty('text');
                                }

                                return underline;
                            }(),
                            font: function () {
                                function font(current, previous) {
                                    var hasChanged = current.font !== previous.font;
                                    return (
                                        // include on text operation if changed
                                        current.hasOwnProperty('text') && hasChanged ||
                                        // include on non-text operation if changed
                                        hasChanged
                                    );
                                }

                                return font;
                            }(),
                            fontSize: function () {
                                function fontSize(current, previous) {
                                    return previous.fontSize !== current.fontSize;
                                }

                                return fontSize;
                            }(),
                            moveDown: function () {
                                function moveDown() {
                                    return true;
                                }

                                return moveDown;
                            }(), // keep always
                            listItemStyle: function () {
                                function listItemStyle(current) {
                                    return current.listItem === true || current.list === true;
                                }

                                return listItemStyle;
                            }(),
                            listItem: function () {
                                function listItem() {
                                    return true;
                                }

                                return listItem;
                            }(), // keep always
                            listItemIndex: function () {
                                function listItemIndex(current) {
                                    return current.listItem === true;
                                }

                                return listItemIndex;
                            }(),
                            listItemCount: function () {
                                function listItemCount(current) {
                                    return current.listDepth > 0 || current.listItem === true;
                                }

                                return listItemCount;
                            }()
                        };

                        var propertiesToKeepEvenIfRedundant = [
                            //'continued', 'link', 'underline'
                        ];

                        if (previousState) {

                            var properties = (0, _keys2['default'])(operation);
                            var propertiesToKeep = properties.filter(function (property) {

                                var keepAccordingToPropertyRules = PROPERTY_RULES.hasOwnProperty(property) && PROPERTY_RULES[property](operation, previousState);

                                return propertiesToKeepEvenIfRedundant.includes(property) || keepAccordingToPropertyRules || !PROPERTY_RULES.hasOwnProperty(property) && operation[property] !== previousState[property];
                            });

                            var reducedOperation = propertiesToKeep.reduce(function (reduced, property) {
                                return (0, _assign2['default'])(reduced, (0, _defineProperty3['default'])({}, property, operation[property]));
                            }, {});

                            //console.log('_reduced______', JSON.stringify(reducedOperation));

                            return reducedOperation;
                        }

                        //console.log('_original_____', JSON.stringify(operation));
                        return operation;
                    }

                    return removeRedundancies;
                }();

                operations = operations.map(removeRedundancies);

                if (operations[operations.length - 1].moveDown) {
                    operations.pop();
                }

                return operations;
            }

            return operations;
        }()

        /**
         * Return the (estimated) height which the provided
         * markdown will require upon rendering.
         *
         * Similar to the 'heightOfString' function provided
         * by pdfkit. It's also used here.
         *
         * TODO: What to return if the rendering would span multiple pages?
         *
         * @param {PDFDocument} doc
         * @param {object} nodeTree
         * @param {object} pdfkitOptions
         * @returns {number} the height which the provided markdown will require upon rendering
         */

    }, {
        key: 'heightOfMarkdown',
        value: function () {
            function heightOfMarkdown(doc, nodeTree, pdfkitOptions) {
                return this.dimensionsOfMarkdown(doc, nodeTree, pdfkitOptions).h;
            }

            return heightOfMarkdown;
        }()

        /**
         * Return the (estimated) dimensions which the provided
         * markdown will occupy upon rendering.
         **
         * TODO: What to return if the rendering would span multiple pages?
         *
         * @param {PDFDocument} doc
         * @param {object} nodeTree
         * @param {object} pdfkitOptions
         * @returns {{x:number,y:number,w:number,h:number}} the dimensions of the bounding box of the rendered markup
         */

    }, {
        key: 'dimensionsOfMarkdown',
        value: function () {
            function dimensionsOfMarkdown(doc, nodeTree, pdfkitOptions) {
                var _this = this;

                var operations = this.operations(nodeTree);

                var targetWidth = pdfkitOptions && pdfkitOptions.width || doc.page && doc.page.width - doc.page.margins.left - doc.page.margins.right;

                var initialPosition = { x: doc.x, y: doc.y };
                var dimensions = (0, _assign2['default'])({}, initialPosition, {
                    w: targetWidth,
                    h: 0
                });

                var currentLineHeight = 0;
                var currentFontSize = this.options.fontSize;
                var continuousText = '';
                var indent = 0;
                operations.forEach(function (op) {

                    var heightChange = 0;

                    // Must move down BEFORE changing the font!
                    // As the moveDown is based on the PREVIOUS lines height,
                    // not on the next lines height.
                    if (op.moveDown) {
                        currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                        heightChange += currentLineHeight * op.moveDown;
                    }

                    if (op.moveUp) {
                        currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                        heightChange -= currentLineHeight * op.moveUp;
                    }

                    // change the font
                    if (op.font) {
                        var resolvedFont = Font.forInternalName(op.font, _this.options);
                        doc.font(resolvedFont);
                    }

                    // change the fontSize
                    if (op.fontSize) {
                        currentFontSize = op.fontSize;
                        doc.fontSize(currentFontSize);
                    }

                    // calculate height for text
                    if (op.text) {

                        // if we have continuous text, we collect it all, and then do
                        // a single height calculation for the full text.
                        continuousText += op.text;

                        if (!op.continued) {

                            var textOptions = (0, _assign2['default'])({}, pdfkitOptions);
                            if (pdfkitOptions && pdfkitOptions.hasOwnProperty('width')) {
                                textOptions.width = pdfkitOptions.width - indent;
                            }

                            // might be inaccurate, due to different fonts?
                            // TODO: Continuous text height might need to take different fonts into account
                            var delta = doc.heightOfString(continuousText, textOptions);

                            heightChange += delta;

                            // for each linebreak, we need to subtract one currentLineHeight
                            var numLinebreaks = ((continuousText || '').match(/\n/g) || []).length;
                            if (numLinebreaks > 0) {
                                currentLineHeight = doc._font.lineHeight(currentFontSize, true);
                                heightChange -= numLinebreaks * currentLineHeight;
                            }

                            if (_this.options.debug) {
                                console.log('\t', heightChange, 'from text "' + String(continuousText) + '"');
                                console.log('\t', 'currentLineHeight', doc._font.lineHeight(currentFontSize, true));
                            }

                            // make sure the text already included in the height
                            // is not evaluated again
                            continuousText = '';
                        }
                    }

                    if (op.list === true) {
                        indent = op.listDepth * List.indent(doc, op.listStyleType, op.listItemCount, pdfkitOptions.fontSize);
                    }

                    if (_this.options.debug) {
                        console.log('height change', heightChange, 'for', op);
                        console.log('total height', dimensions.h + heightChange);
                    }

                    dimensions.h += heightChange;
                });

                return dimensions;
            }

            return dimensionsOfMarkdown;
        }()

        /**
         * Render into an pdf document.
         *
         * TODO: What to return if the rendering spans multiple pages?
         *
         * @param {PDFDocument} doc to rende into
         * @param {object} nodeTree
         * @returns {{x:number,y:number,w:number,h:number}} The dimensions of the rendered markdown.
         */

    }, {
        key: 'render',
        value: function () {
            function render(doc, nodeTree, pdfkitOptions) {
                var _this2 = this;

                var operations = this.operations(nodeTree);

                var initialPosition = {
                    y: doc.y,
                    x: doc.x
                };

                operations.forEach(function (op) {
                    (0, _executeOperation2['default'])(op, doc, (0, _assign2['default'])({}, _this2.options, { pdfkit: pdfkitOptions, initialPosition: initialPosition }));
                });

                var finalPosition = {
                    y: doc.y,
                    x: doc.x
                };

                return {
                    y: initialPosition.y,
                    x: initialPosition.x,
                    w: pdfkitOptions && pdfkitOptions.width || doc && doc.page && doc.page.width - doc.page.margins.left - doc.page.margins.right || 0,
                    h: finalPosition.y - initialPosition.y
                };
            }

            return render;
        }()
    }]);
    return CommonmarkPDFKitRenderer;
}();

exports['default'] = CommonmarkPDFKitRenderer;