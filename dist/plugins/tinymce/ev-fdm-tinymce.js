/**
 * Directive to override some settings in tinymce
 * Usage:
 * <ev-tinymce
 *     max-chars="1000"                        -- maxChars this input accept (default: unlimited)
 *     ng-model="message.body"                 -- ng-model
 *     tinymce-options="tinymceOptions"        -- override default options with yours (object expected)
 *  ></ev-tinymce>
 */
angular.module('ev-tinymce', ['ui.tinymce'])
    .directive('evTinymce', [function () {
        return {
            template: '<div class="tiny-mce-wrapper">'
                + '<textarea ui-tinymce="tinymceFinalOptions" ng-model="ngModel" ng-required="ngRequired"></textarea>'
                + '<span class="max-chars-info">&nbsp;</span>'
                + '</div>',
            restrict: 'AE',
            replace: false,
            scope: {
                ngModel: '=',
                tinymceOptions: '=',
                ngRequired: '&'
            },
            controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {
                $scope.$on('module-layout-changed', function() {
                    var textareaId = $element.find('textarea').attr('id'),
                        tinyMCE = window.tinyMCE,
                        editor = tinyMCE.get(textareaId);

                    if (editor) {
                        try {
                            editor.remove();
                            tinyMCE.execCommand("mceAddEditor", false, textareaId);
                        } catch (e) {}
                    }
                });

                var defaultOptions = {
                    menubar: false,
                    statusbar: false,
                    resize: false,
                    toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist',
                    'content_css': '/bower_components/ev-fdm/dist/css/ev-fdm.min.css',
                    skin: false,
                    'verify_html': true,
                    'convert_fonts_to_spans': true,

                    // We choose to have a restrictive approach here.
                    // The aim is to output the cleanest html possible.
                    // See http://www.tinymce.com/wiki.php/Configuration:valid_elements
                    // 'valid_elements':
                    //     'strong,em' +
                    //     'span[!style<text-decoration: underline;],' +
                    //     '@[style<text-align: right;?text-align: left;?text-align: center;],' +
                    //     'p,!div,ul,li'
                };
                $scope.tinymceFinalOptions = angular.extend({}, defaultOptions, $scope.tinymceOptions);

                /**
                 * This part is used for the max-chars attibute.
                 * It allows us to easily limit the number of characters typed in the editor
                 */
                $scope.tinymceFinalOptions.maxChars = $attrs.maxChars || $scope.tinymceFinalOptions.maxChars || null;
                // We set the max char warning when the THRESHOLD is reached
                // Here, it's 85% of max chars
                var THRESHOLD = 85;

                /**
                 * Update the information area about the textEditor state (maxChars, ..)
                 */
                var updateInfo = function(currentChars, maxChars) {
                    var maxCharInfosElm = $element.parent().find('.max-chars-info');
                    maxCharInfosElm.text(currentChars + ' / ' + maxChars);

                    var isThresholdReached = ((currentChars / maxChars) * 100) > THRESHOLD;
                    var isMaxLimitReached  = currentChars >= maxChars;

                    var warningClassName = 'max-chars-warning';
                    var alertClassName   = 'max-chars-reached';
                    if(isThresholdReached) {
                        maxCharInfosElm.addClass(warningClassName);
                    } else {
                        maxCharInfosElm.removeClass(warningClassName);
                    }

                    if(isMaxLimitReached) {
                            maxCharInfosElm.addClass(alertClassName);
                    } else {
                            maxCharInfosElm.removeClass(alertClassName);
                    }
                };

                /**
                 * Setup and listen to the editor events
                 */
                var setup = function(editor) {
                    // If there is no maxChars options defined, we return
                    if($scope.tinymceFinalOptions.maxChars === null) {
                        return;
                    }

                    var currentText       = '';
                    var currentTextLength = '';
                    var oldText           = '';
                    var maxChars          = $scope.tinymceFinalOptions.maxChars;

                    editor.on('init', function(e) {
                       $scope.$watch(function() { return editor.getContent(); }, function(newHtml, oldHtml) {
                            currentText       = angular.element(newHtml).text();
                            currentTextLength = currentText.length;
                            oldText           = angular.element(oldHtml).text();

                            /**
                             * Specific case where the old and new text are both over the limit of max chars.
                             * This case can occur on the first initilization, if data from DB are over the limit.
                             * For now, we substring the content (but that break the html and everything..)
                             */
                            var isLimitAlert = (oldText.length > maxChars) && (currentTextLength > maxChars);
                            if(isLimitAlert) {
                                var shorterText = oldText.substring(0, maxChars);
                                $scope.ngModel = shorterText;
                                currentTextLength = shorterText.length;

                            } else if(currentTextLength > maxChars) {
                                $scope.ngModel    = oldHtml;
                                currentTextLength = angular.element($scope.ngModel).text().length;
                            }

                            updateInfo(currentTextLength, maxChars);
                        });
                    });
                };

                $scope.tinymceFinalOptions.setup = setup;
            }]
        };
    }]);
