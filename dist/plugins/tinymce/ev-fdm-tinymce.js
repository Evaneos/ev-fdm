/* jshint camelcase: false */
/**
 * Directive to override some settings in tinymce
 * Usage:
 * <ev-tinymce
 *     max-chars="1000"                        -- maxChars this input accept (default: unlimited)
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

        // We choose to have a restrictive approach here.
        // The aim is to output the cleanest html possible.
        // See http://www.tinymce.com/wiki.php/Configuration:valid_elements
        // 'valid_elements':
        //     'strong,em' +
        //     'span[!style<text-decoration: underline;],' +
        //     '@[style<text-align: right;?text-align: left;?text-align: center;],' +
        //     'p,!div,ul,li'
    };


angular.module('ev-tinymce', [])
    .directive('evTinymce', [function () {

        var generatedIds = 0;
        return {
            template: '<div class="tiny-mce-wrapper">'
                + '<div class="ev-placeholder-container"></div>'
                + '<div class="ev-tinymce-content"></div>'
                + '<div ng-click="focusTinymce()" class="ev-tinymce-toolbar"></div>'
                + '<div class="max-chars-info"></div>'
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
                }, defaultOptions, scope.tinymceOptions);


                // /**
                //  * This part is used for the max-chars attibute.
                //  * It allows us to easily limit the number of characters typed in the editor
                //  */
                options.maxChars = attrs.maxChars || options.maxChars || null;
                // // We set the max char warning when the THRESHOLD is reached
                // // Here, it's 85% of max chars
                var THRESHOLD = 85;

                // /**
                //  * Update the information area about the textEditor state (maxChars, ..)
                //  */
                var updateCharCounter = function(currentChars, maxChars) {
                    var maxCharInfosElm = elm.parent().find('.max-chars-info');
                    maxCharInfosElm.text(currentChars + ' / ' + maxChars);

                    var isThresholdReached = ((currentChars / maxChars) * 100) > THRESHOLD;
                    var isMaxLimitReached  = currentChars >= maxChars;

                    maxCharInfosElm.toggleClass('max-chars-warning', isThresholdReached);
                    maxCharInfosElm.toggleClass('max-chars-reached', isMaxLimitReached);
                };

                var hasFocus = false;
                var placeholder = false;
                var currentHtml = '';
                var currentText = '';
                var maxChars = options.maxChars;

                var setPlaceholder = function() {
                    var editor = getTinyInstance();
                    editor.setContent('<span class="placeholder-light">' + attrs.placeholder + '</span>');
                };

                var updatePlaceholder = function(newText) {
                    var editor = getTinyInstance();
                    if (hasFocus) {
                        if (currentText === attrs.placeholder) {
                            editor.setContent('');
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
                    var newTextOverLimit = maxChars && newText.length > maxChars;
                    var currentTextOverLimit = maxChars && currentText.length > maxChars;

                    if (placeholder && newText === attrs.placeholder) {
                        currentHtml = newHtml;
                        currentText = newText;
                    }
                    /*
                     * Specific case where the old and new text are both over the limit of max chars.
                     * This case can occur on the first initilization, if data from DB are over the
                     * limit.
                     * For now, we substring the content (but that break the html and everything..)
                     */
                    else if (newTextOverLimit && (currentTextOverLimit || !currentText.length)) {
                        var shorterText = newText.substr(0, maxChars);
                        // be carefull, setContent call this method again
                        editor.setContent(shorterText, {format: 'text'});
                    } else if(currentTextOverLimit && newTextOverLimit) {
                        editor.setContent(currentHtml); // be carefull, setContent call this method again
                    } else {
                        ngModel.$setViewValue(newHtml);
                        currentHtml = newHtml;
                        currentText = newText;
                    }

                    if (maxChars) {
                        updateCharCounter(currentText.length, maxChars);
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
                        hasFocus = false;
                        tinyElm.blur();
                        updateView();
                    });

                    editor.on('focus', function (e) {
                        hasFocus = true;
                        updateView();
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
