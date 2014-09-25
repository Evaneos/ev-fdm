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
        //skin: false,
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
                + '<span class="max-chars-info">&nbsp;</span>'
                + '<div class="ev-tinymce-toolbar"></div>'
                + '</div>',
            restrict: 'AE',
            replace: true,
            require: '?ngModel',
            scope: {
                tinymceOptions: '=',
            },

            link: function (scope, elm, attrs, ngModel) {
                var updateView = function () {
                    ngModel.$setViewValue(getTinyElm().html());
                    if (!scope.$root.$$phase) {
                      scope.$apply();
                    }
                };
                var tinyId = 'uiTinymce' + generatedIds++;
                var getTinyElm = function() {
                    return elm.find(".ev-tinymce-content");
                };
                getTinyElm().attr('id', tinyId);
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
                // options.maxChars = attrs.maxChars || options.maxChars || null;
                // // We set the max char warning when the THRESHOLD is reached
                // // Here, it's 85% of max chars
                // var THRESHOLD = 85;

                // /**
                //  * Update the information area about the textEditor state (maxChars, ..)
                //  */
                // var updateInfo = function(currentChars, maxChars) {
                //     var maxCharInfosElm = elm.parent().find('.max-chars-info');
                //     maxCharInfosElm.text(currentChars + ' / ' + maxChars);

                //     var isThresholdReached = ((currentChars / maxChars) * 100) > THRESHOLD;
                //     var isMaxLimitReached  = currentChars >= maxChars;

                //     var warningClassName = 'max-chars-warning';
                //     var alertClassName   = 'max-chars-reached';
                //     if(isThresholdReached) {
                //         maxCharInfosElm.addClass(warningClassName);
                //     } else {
                //         maxCharInfosElm.removeClass(warningClassName);
                //     }

                //     if(isMaxLimitReached) {
                //             maxCharInfosElm.addClass(alertClassName);
                //     } else {
                //             maxCharInfosElm.removeClass(alertClassName);
                //     }
                // };


                /* Options */

                var setup = function (ed) {
                    ed.on('init', function() {
                        ngModel.$render();
                    });
                    // Update model on button click
                    ed.on('ExecCommand', function (e) {
                        ed.save();
                        updateView();
                    });
                    // Update model on keypress
                    ed.on('KeyUp', function (e) {
                        ed.save();
                        updateView();
                    });
                    // Update model on change, i.e. copy/pasted text, plugins altering content
                    ed.on('SetContent', function (e) {
                        if(!e.initial){
                            ed.save();
                            updateView();
                        }
                    });
                    ed.on('blur', function(e) {
                        getTinyElm().blur();
                    });

                    // TODO : refactor with new changes
                    // if(options.maxChars) {
                    //     var currentText       = '';
                    //     var currentTextLength = '';
                    //     var oldText           = '';
                    //     var maxChars          = options.maxChars;

                    //     ed.on('init', function(e) {
                    //        scope.$watch(function() { return ed.getContent(); }, function(newHtml, oldHtml) {
                    //             currentText       = angular.element(newHtml).text();
                    //             currentTextLength = currentText.length;
                    //             oldText           = angular.element(oldHtml).text();

                    //             *
                    //              * Specific case where the old and new text are both over the limit of max chars.
                    //              * This case can occur on the first initilization, if data from DB are over the
                    //              * limit.
                    //              * For now, we substring the content (but that break the html and everything..)

                    //             var isLimitAlert = (oldText.length > maxChars) && (currentTextLength > maxChars);
                    //             if(isLimitAlert) {
                    //                 var shorterText = oldText.substring(0, maxChars);
                    //                 scope.ngModel = shorterText;
                    //                 currentTextLength = shorterText.length;

                    //             } else if(currentTextLength > maxChars) {
                    //                 scope.ngModel    = oldHtml;
                    //                 currentTextLength = angular.element(scope.ngModel).text().length;
                    //             }

                    //             updateInfo(currentTextLength, maxChars);
                    //         });
                    //     });
                    // }
                };

                // extend options with initial uiTinymceConfig and options from directive attribute value
                options.setup = setup;
                options.elems = tinyId;
                options.mode = "exact";

                tinyMCE.init(options);
                tinyMCE.execCommand("mceToggleEditor", false, tinyId);

                ngModel.$render = function() {
                    var editor = getTinyInstance();
                    if (editor) {
                        editor.setContent(ngModel.$viewValue || '');
                    }
                };

                // scope.$on('$destroy', function() {
                //     if (tinyInstance) {
                //         tinyInstance.destroy();
                //         tinyInstance = null;
                //     }
                // });
            },
        };
    }]);
}) (window.tinyMCE);
