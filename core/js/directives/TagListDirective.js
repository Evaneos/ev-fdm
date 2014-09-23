'use strict';

angular.module('ev-fdm')
    .directive('evTagList', function () {
        return {
            restrict: 'EA',
            scope: {
                elements: '=',
                editable: '=',
                className: '@',
                maxElements: '=',
                maxAlertMessage: '@'
            },
            replace: true,
            template:
                '<ul class="list-inline {{ className }}">' +
                    '<li ng-repeat="element in elements track by element.name" class="ev-animate-tag-list">' +
                        '<span class="label label-default" >' +
                            '{{ element.name }}' +
                            '<button ng-show="editable" tabIndex="-1" type="button" class="close inline" ' +
                                'ng-click="remove($index)">×</button> ' +
                        '</span>' +
                    '</li>' +
                    '<li ng-show="editable && elements.length >= maxElements" class="text-warning no-margin">' +
                        ' {{ maxAlertMessage }}' +
                    '</li>' +
                '</ul>',
            link: function ($scope, elem, attrs) {

                $scope.remove = function (index) {
                    $scope.elements.splice(index, 1);
                };
            }
        };
    });
