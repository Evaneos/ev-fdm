/* jshint camelcase: false */
/* global tinymce */
/**
 * Directive to override some settings in tinymce
 * Usage:
 * <ev-tinymce
 *     min-chars="1000"                        -- minChars this input accept (default: none)
 *     max-chars="1000"                        -- maxChars this input accept (default: unlimited)
 *     min-words="1000"                        -- minWords this input accept (default: none)
 *     max-words="1000"                        -- maxWords this input accept (default: unlimited)
 *     ng-model="message.body"                 -- ng-model
 *     tinymce-options="tinymceOptions"        -- override default options with yours (object expected)
 *  ></ev-tinymce>
 */
(function (tinyMCE) {
    var defaultOptions = {
        menubar: false,
        statusbar: false,
        //resize: false,
        toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist',
        skin: false,
        'verify_html': true,
        'convert_fonts_to_spans': true,
        //'content_css': '/bower_components/ev-fdm/dist/css/ev-fdm.min.css',
        inline: true,
        browser_spellcheck : true,

        // We choose to have a restrictive approach here.
        // The aim is to output the cleanest html possible.
        // See http://www.tinymce.com/wiki.php/Configuration:valid_elements
        // 'valid_elements':
        //     'strong,em' +
        //     'span[!style<text-decoration: underline;],' +
        //     '@[style<text-align: right;?text-align: left;?text-align: center;],' +
        //     'p,!div,ul,li'
    };

    // u2019 and x27 : apostrophes
    // u00C0-\u1FFF : accents
    var countregexp = /[\w\u2019\x27\-\u00C0-\u1FFF]+/g;
    function countWords(text) {
        var wordArray = text.match(countregexp);
        if (wordArray) {
            return wordArray.length;
        }
        return 0;
    }


angular.module('ev-tinymce', [])
    .provider('evTinymce', function() {
        var configs = {};

        this.register = function(name, value) {
            if (configs.hasOwnProperty(name)) {
                throw new Error('A config named "' + name + '" was already registered');
            }
            configs[name] = value;
        };

        this.get = function(name) {
            return configs[name];
        };

        this.$get = function() { return configs; };
    })
    .directive('evTinymce', ['$timeout', 'evTinymce', function($timeout, evTinymce) {
        var generatedIds = 0;
        return {
            template: '<div class="tiny-mce-wrapper form-control">'
                + '<div class="ev-placeholder-container"></div>'
                + '<div class="ev-tinymce-content"></div>'
                + '<div ng-click="focusTinymce()" class="ev-tinymce-toolbar"></div>'
                + '<div class="counter-info"></div>'
                + '</div>',
            restrict: 'AE',
            replace: true,
            require: '?ngModel',

            scope: {
                tinymceOptions: '=',
            },

            link: function (scope, elm, attrs, ngModel) {
                var tinyId = 'uiTinymce' + generatedIds++;
                var tinyElm = elm.find('.ev-tinymce-content');
                tinyElm.attr('id', tinyId);
                elm.find('.ev-tinymce-toolbar').attr('id', tinyId + 'toolbar');

                var tinyInstance;
                var getTinyInstance = function() {
                    if (!tinyInstance) {
                        tinyInstance = tinyMCE.get(tinyId);
                    }
                    return tinyInstance;
                };
                var options = angular.extend({
                    fixed_toolbar_container: '#' + tinyId + 'toolbar',
                }, defaultOptions, evTinymce[attrs.configKey], scope.tinymceOptions);

                // /**
                //  * This part is used for the max-chars attribute.
                //  * It allows us to easily limit the number of characters typed in the editor
                //  */
                var minChars = options.minChars = attrs.minChars || options.minChars || null;
                var maxChars = options.maxChars = attrs.maxChars || options.maxChars || null;
                var minWords = options.minWords = attrs.minWords || options.minWords || null;
                var maxWords = options.maxWords = attrs.maxWords || options.maxWords || null;
                // // We set the max char warning when the THRESHOLD is reached
                // // Here, it's 85% of max chars
                var THRESHOLD = 85;

                // /**
                //  * Update the information area about the textEditor state (maxChars, ..)
                //  */
                var updateCounter = function(currentValue, minValue, maxValue) {
                    var counterInfosElm = elm.parent().find('.counter-info');
                    counterInfosElm.text(currentValue + (maxValue ? ' / ' + maxValue : ''));

                    if (maxValue) {
                        var isThresholdReached = ((currentValue / maxValue) * 100) > THRESHOLD;
                        counterInfosElm.toggleClass('counter-warning', isThresholdReached);
                    }

                    var isMinLimitNotReached = minValue && currentValue < minValue;
                    var isMaxLimitReached = maxValue && currentValue >= maxValue;
                    counterInfosElm.toggleClass('counter-reached', !!(isMinLimitNotReached || isMaxLimitReached));
                };

                var hasFocus = false;
                var placeholder = false;
                var currentHtml = '';
                var currentText = '';

                var setPlaceholder = function() {
                    var editor = getTinyInstance();
                    tinymce.DOM.addClass(tinyElm, 'placeholder-light');
                    editor.setContent(attrs.placeholder);
                };

                var updatePlaceholder = function(newText) {
                    var editor = getTinyInstance();
                    if (hasFocus) {
                        if (currentText === attrs.placeholder) {
                            editor.setContent('');
                            editor.selection.setCursorLocation();
                            tinymce.DOM.removeClass(tinyElm, 'placeholder-light');
                        }
                    } else {
                        if (newText !== attrs.placeholder) {
                            setPlaceholder();
                        }
                    }
                };

                var updateView = function () {
                    var editor = getTinyInstance();
                    var newHtml = tinyElm.html();
                    var newText = tinyElm.text();
                    var newTextOverLimit = false, currentTextOverLimit = false;
                    var newCount, minCount, maxCount;

                    if (placeholder && newText === attrs.placeholder) {
                        currentHtml = newHtml;
                        currentText = newText;
                        if (maxChars || minChars || maxWords || minWords) {
                            newCount = 0;
                        }
                    } else {
                        if (maxChars || minChars) {
                            newCount = newText.length;
                        } else if (maxWords || minWords) {
                            newCount = countWords(newText);
                        }

                        if (minChars) {
                            minCount = minChars;
                        } else if (minWords) {
                            minCount = minWords;
                        }

                        if (maxChars) {
                            maxCount = maxChars;
                            newTextOverLimit = newCount > maxChars;
                        } else if (maxWords) {
                            maxCount = maxWords;
                            newTextOverLimit = newCount > maxWords;
                        }

                        /*
                         * Specific case where the old and new text are both over the limit of max chars.
                         * This case can occur on the first initialization, if data from DB are over the
                         * limit.
                         * For now, we substring the content (but that break the html and everything..)
                         */
                        if (newTextOverLimit && (currentTextOverLimit || !currentText.length)) {
                            var shorterText = newText.substr(0, maxChars);
                            // be careful, setContent call this method again
                            editor.setContent(shorterText, { format: 'text' });
                        } else if (newTextOverLimit) {
                            editor.setContent(currentHtml); // be careful, setContent call this method again
                        } else {
                            $timeout(function() {
                                ngModel.$setViewValue(newText === '' || newText === attrs.placeholder ? '' : newHtml);
                            });
                            currentHtml = newHtml;
                            currentText = newText;
                        }
                    }

                    // newCount not null nor undefined
                    if (newCount != null) {
                        updateCounter(newCount, minCount, maxCount);
                    }


                    placeholder = newText === '' || newText === attrs.placeholder;

                    if (placeholder && attrs.placeholder) {
                        updatePlaceholder(newText);
                    }
                };

                ngModel.$render = function() {
                    var editor = getTinyInstance();
                    if (editor) {
                        if (ngModel.$viewValue) {
                            editor.setContent(ngModel.$viewValue);
                        } else if (attrs.placeholder) {
                            placeholder = true;
                            setPlaceholder();
                        }
                    }
                };

                scope.focusTinymce = function() {
                    var editor = getTinyInstance();
                    if (editor) {
                        editor.focus();
                    }
                };

                /* Options */

                var setup = function(editor) {
                    editor.on('init', function() {
                        if (ngModel.$viewValue) {
                            ngModel.$render();
                        }
                    });
                    // Update model on button click
                    editor.on('ExecCommand', function (e) {
                        updateView();
                    });
                    // Update model on keypress
                    editor.on('KeyUp', function (e) {
                        updateView();
                    });
                    // Update model on change, i.e. copy/pasted text, plugins altering content
                    editor.on('SetContent', function (e) {
                        if (!e.initial) {
                            updateView();
                        }
                    });
                    editor.on('blur', function(e) {
                        if (hasFocus) {
                            hasFocus = false;
                            updateView();
                        }
                        tinyElm.blur();
                    });

                    editor.on('focus', function (e) {
                        if (!hasFocus) {
                            hasFocus = true;
                            updateView();
                        }
                    });
                };

                // extend options with initial uiTinymceConfig and options from directive attribute value
                options.setup = setup;
                options.elems = tinyId;
                options.mode = 'exact';

                tinyMCE.init(options);

                scope.$on('$destroy', function() {
                    var editor = getTinyInstance();
                    if (editor) {
                        editor.destroy();
                    }
                });

                tinyMCE.execCommand('mceToggleEditor', false, tinyId);
            },
        };
    }]);
}) (window.tinyMCE);
