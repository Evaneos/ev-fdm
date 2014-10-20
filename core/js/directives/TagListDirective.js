'use strict';

angular.module('ev-fdm')
    .directive('evTagList', function () {
        return {
            restrict: 'EA',
            scope: {
                elements: '=',
                displayElement: '=',
                editable: '=',
                className: '@',
                maxElements: '=',
                maxAlertMessage: '@',
                onTagDeleted: '&'
            },
            replace: true,
            template:
                '<ul class="list-inline {{ className }}">' +
                    '<li ng-repeat="element in elements track by element.name" class="ev-animate-tag-list">' +
                        '<span class="label label-default" >' +
                            '{{ displayElement(element) }}' +
                            '<button ng-show="editable" tabIndex="-1" type="button" class="close inline" ' +
                                'ng-click="remove($index)">×</button> ' +
                        '</span>' +
                    '</li>' +
                    '<li ng-show="editable && elements.length >= maxElements" class="text-warning no-margin">' +
                        ' {{ maxAlertMessage }}' +
                    '</li>' +
                '</ul>',
            link: function ($scope, elem, attrs) {
                $scope.displayElement = $scope.displayElement || function(element) {
                    return element.name;
                };

                $scope.remove = function (index) {
                    $scope.elements.splice(index, 1);
                    $scope.onTagDeleted();
                };
            }
        };
    });
