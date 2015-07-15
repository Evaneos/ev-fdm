angular.module('ev-fdm').directive('evAddTagInList', [
    function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                elements: '=',
                addElement: '=',
                maxElements: '=',
                iconName: '@',
                buttonText: '@',
                tooltipText: '@',
            },
            template:
                '<span ng-hide="elements.length >= maxElements"> ' +
                    '<button type="button" ' +
                        'class="btn btn-tertiary btn-env" ' +
                        'tabIndex="-1"' +
                        'tooltip="{{ tooltipText }}"' +
                        'tooltip-placement="top"' +
                        'tabIndex="-1"' +
                        'ng-hide="context.showSelect" ' +
                        'ng-click="context.showSelect = true"> ' +
                        '<span class="icon {{ iconName }}"></span> ' +
                        '{{ buttonText }} ' +
                    '</button> ' +
                    '<span ng-show="context.showSelect"> ' +
                        '<div class="transclude-addtaginlist"></div>' +
                    '</span> ' +
                '</span> ',
            link: function(scope, element, attrs, controller, transcludeFn) {
                scope.context = {
                    showSelect: false,
                };

                transcludeFn(function(clone, transcludedScope) {
                    transcludedScope.add = function(element) {
                        return scope.addElement(scope.elements, element);
                    };

                    // append body to template
                    element.find('.transclude-addtaginlist').append(clone);
                });
            },
        };
    },
]);
