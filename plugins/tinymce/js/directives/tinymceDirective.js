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
            template: '<div class="tiny-mce-wrapper">' +
                            '<textarea ui-tinymce="tinymceFinalOptions" ng-model="ngModel"></textarea>' +
                            '<span class="max-chars-info">&nbsp;</span>' +
                      '</div>',
            restrict: 'AE',
            replace: false,
            scope: {
                ngModel: '=',
                tinymceOptions: '='
            },
            controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {

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
                var updateInfo = function(currentChars, maxChars, isMaxLimitReached) {
                    var $maxCharInfos = $element.parent().find('.max-chars-info');
                    $maxCharInfos.text(currentChars + ' / ' + maxChars);

                    var isThresholdReached = ((currentChars / maxChars) * 100) > THRESHOLD;

                    var warningClassName = 'max-chars-warning';
                    var alertClassName   = 'max-chars-reached';
                    if(isThresholdReached) {
                        $maxCharInfos.addClass(warningClassName);
                    } else {
                        $maxCharInfos.removeClass(warningClassName);
                    }

                    if(isMaxLimitReached) {
                            $maxCharInfos.addClass(alertClassName);
                    } else {
                            $maxCharInfos.removeClass(alertClassName);
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

                    /**
                     * On keydown we look if the number of chars is superior of the maxchars
                     * If so, we prevent this event
                     */
                    editor.on('keydown', function(e) {
                        // Keys that can be pressed even if the max size is reached,
                        // otherwise they would have been prevented
                        var silentKeys   = [8, 13, 16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 46];
                        var isSilentKeys = silentKeys.indexOf(e.keyCode) !== -1;

                        var currentChars = $(editor.getBody()).text().length;
                        // Because we're on keydown
                        if(!isSilentKeys) {
                            currentChars += 1;
                        }
                        var maxChars = $scope.tinymceFinalOptions.maxChars;

                        var isMaxLimitReached = currentChars > maxChars;

                        if(isSilentKeys) {
                            return;
                        }

                        if (isMaxLimitReached) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                    });

                    /**
                     * On keyup, we count the number of chars in the editor and we update the
                     * information section
                     */
                    editor.on('keyup', function(e) {
                        var currentChars      = $(editor.getBody()).text().length;
                        var maxChars          = $scope.tinymceFinalOptions.maxChars;
                        var isMaxLimitReached = currentChars >= maxChars;

                        updateInfo(currentChars, maxChars, isMaxLimitReached);
                    });
                };
                $scope.tinymceFinalOptions.setup = setup;
            }]
        };
    }]);
