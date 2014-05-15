'use strict';
/// This directive currently depend on ng-repeat $index for the shift selection. It would be great to remove this depency.
angular.module('ev-fdm')
    .directive('selectableSet', [function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$parse', '$element', '$attrs', '$document', function($scope, $parse, $element, $attrs, $document) {
                var self = this,
                    shiftKey = 16;

                var selectedElementsGet = $parse($attrs.selectedElements),
                    selectedElementsSet = selectedElementsGet.assign;

                this.selectableElements = [];
                this.selectedElements = selectedElementsGet($scope);

                var lastClickedIndex,
                    shiftSelectedElements = [];

                $scope.$watchCollection(function() {
                    return self.selectableElements;
                    },
                    function() {
                        self.selectedElements.length = 0;
                    }
                );

                // Toggle a noselect class on the element when the shift key is pressed
                // This allows us to disable selection overlay via css
                $document.on('keydown', function(event) {
                    if(event.keyCode === shiftKey) {
                        $element.addClass('noselect');
                    }
                });

                $document.on('keyup', function(event) {
                    if(event.keyCode === shiftKey) {
                        $element.removeClass('noselect');
                    }
                });

                this.toggleSelection = function(element, index) {
                    lastClickedIndex = index;
                    shiftSelectedElements.length = 0;

                    if(isElementSelected(element)) {
                        unselectElement(element);
                    }
                    else {
                        selectElement(element);
                    }
                };

                this.toggleSelectAll = function() {

                    if(this.selectedElements.length === this.selectableElements.length){
                        this.selectedElements.length = 0;
                    }
                    else {
                        var index;
                        angular.forEach(this.selectableElements, function(element) {
                            if(!isElementSelected(element)) {
                                selectElement(element);
                            }
                        });
                    }
                };

                this.shiftedClick = function(element, index) {
                    if(typeof lastClickedIndex !== undefined) {
                        toggleRangeUpTo(lastClickedIndex, index);
                    }
                };

                function toggleRangeUpTo(firstIndex, lastIndex) {

                    var lastElement = getElementAtIndex(lastIndex),
                        min = Math.min(firstIndex, lastIndex),
                        max = Math.max(firstIndex, lastIndex),
                        element;

                    angular.forEach(shiftSelectedElements, function(element, index) {
                        unselectElement(element);
                    });

                    if(isElementSelected(lastElement)) {
                        for(var i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            unselectElement(element);
                        }

                        lastClickedIndex = lastIndex;
                        shiftSelectedElements.length = 0;
                    }
                    else {
                        shiftSelectedElements.length = 0;
                        for(var i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            selectElement(element);
                            shiftSelectedElements.push(element);
                        }
                    }
                };

                function getElementAtIndex(index) {
                    return self.selectableElements[index];
                }

                function isElementSelected(element) {
                    return self.selectedElements.indexOf(element) > -1;
                };

                function selectElement(element) {
                    if(!isElementSelected(element)) {
                        self.selectedElements.push(element);
                    }
                };

                function unselectElement(element) {
                    var index = self.selectedElements.indexOf(element);
                    if(index > -1) {
                        self.selectedElements.splice(index, 1);
                    }
                };
            }]
        };
    }])
    .directive('selectable', [function() {
        return {
            restrict: 'A',
            require: '^selectableSet',
            link: function(scope, element, attr, ctrl) {

                var currentElement = scope[attr.selectable];

                ctrl.selectableElements.push(currentElement);

                scope.$on('$destroy', function() {
                    var index = ctrl.selectableElements.indexOf(currentElement);
                    if(index > -1) {
                        ctrl.selectableElements.splice(index, 1);
                    }

                    index = ctrl.selectedElements.indexOf(currentElement);
                    if(index > -1) {
                        ctrl.selectedElements.splice(index, 1);
                    }
                });

                scope.$watchCollection(function() { return ctrl.selectedElements; }, function(newSelection) {
                        scope.selected = newSelection.indexOf(currentElement) > -1;
                });

                element.on('click', function(event) {
                    scope.$apply(function() {
                        handleClick(event);
                    });
                });

                function handleClick(event) {
                    if (event.shiftKey) {
                        ctrl.shiftedClick(currentElement, scope.$index);
                    }
                    else if (event.ctrlKey || angular.element(event.target).is('.checkbox')) {
                        ctrl.toggleSelection(currentElement, scope.$index);
                    }
                }

            }
        }
    }])
    .directive('selectBox', function() {
        return {
            restrict: 'E',
            require: '^selectable',
            replace: true,
            template: '<span class="checkbox" ng-class="{ active: selected }"></span>'
        }
    })
    .directive('selectAll', function() {
        return {
            restrict: 'E',
            require: '^selectableSet',
            scope: true,
            template: '<span class="checkbox" ng-class="{ active: allSelected }" ng-click="toggleSelectAll()"></span>',
            link: function(scope, element, attr, ctrl) {

                scope.toggleSelectAll = function () {
                    ctrl.toggleSelectAll();
                };

                scope.$watchCollection(function() { return ctrl.selectedElements; }, function() {
                    scope.allSelected = ctrl.selectedElements.length === ctrl.selectableElements.length
                                     && ctrl.selectedElements.length !== 0;
                });
            }
        }
    });