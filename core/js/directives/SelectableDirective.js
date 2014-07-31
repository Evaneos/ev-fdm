'use strict';
/// This directive currently depend on ng-repeat $index for the
///  shift selection. It would be great to remove this depency.
angular.module('ev-fdm')
    .directive('selectableSet', [function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$parse', '$element', '$attrs', '$document',
            function($scope, $parse, $element, $attrs, $document) {
                var self = this,
                    shiftKey = 16;

                var selectedElementsGet = $parse($attrs.selectedElements);

                this.selectableElements = [];
                this.selectedElement = [];

                var lastClickedIndex,
                    shiftSelectedElements = [];

                $scope.$watch(function() {
                    return selectedElementsGet($scope);
                  },
                  function() {
                    self.selectedElements = angular.isArray(selectedElementsGet($scope))?
                      selectedElementsGet($scope) : [];
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

                    if(this.isElementSelected(element)) {
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
                      angular.forEach(this.selectableElements, function(element) {
                        if(!self.isElementSelected(element)) {
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

                this.registerElement = function(element, directive) {
                  this.selectableElements.push(element);
                };

                this.unregisterElement = function(element) {
                  var index = this.selectableElements.indexOf(element);
                  if(index > -1) {
                      this.selectableElements.splice(index, 1);
                  }

                  index = this.selectedElements.indexOf(element);
                  if(index > -1) {
                      this.selectedElements.splice(index, 1);
                  }
                };

                this.areAllElementSelected = function() {
                  return this.selectedElements.length === this.selectableElements.length
                     && this.selectedElements.length !== 0;
                };

                this.isElementSelected = function(element) {
                    return self.selectedElements.indexOf(element) > -1;
                };

                function toggleRangeUpTo(firstIndex, lastIndex) {

                    var lastElement = getElementAtIndex(lastIndex),
                        min = Math.min(firstIndex, lastIndex),
                        max = Math.max(firstIndex, lastIndex),
                        element,
                        i;

                    angular.forEach(shiftSelectedElements, function(element, index) {
                        unselectElement(element);
                    });

                    if(self.isElementSelected(lastElement)) {
                        for(i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            unselectElement(element);
                        }

                        lastClickedIndex = lastIndex;
                        shiftSelectedElements.length = 0;
                    }
                    else {
                        shiftSelectedElements.length = 0;
                        for(i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            selectElement(element);
                            shiftSelectedElements.push(element);
                        }
                    }
                }

                function getElementAtIndex(index) {
                    return self.selectableElements[index];
                }

                function selectElement(element) {
                    if(!self.isElementSelected(element)) {
                        self.selectedElements.push(element);
                    }
                }

                function unselectElement(element) {
                    var index = self.selectedElements.indexOf(element);
                    if(index > -1) {
                        self.selectedElements.splice(index, 1);
                    }
                }
            }]
        };
    }])
    .directive('selectable', ['$parse', function($parse) {
      return {
          restrict: 'A',
          require: ['^selectableSet', '?ngModel'],
          link: function(scope, element, attr, ctrls) {

              var currentElementGetter = $parse(attr.selectable);
              var currentElement = currentElementGetter(scope);

              var ctrl = ctrls[0],
                  modelCtrl = ctrls[1];

              ctrl.registerElement(currentElement);

              scope.$on('$destroy', function() {
                  ctrl.unregisterElement(currentElement);
              });

              scope.$watch(function() { return ctrl.isElementSelected(currentElement); }, function() {
                scope.selected = ctrl.isElementSelected(currentElement);
                if(modelCtrl) {
                  modelCtrl.$setViewValue(scope.selected);
                }
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
      };
  }])
    .directive('selectBox', function() {
        return {
            restrict: 'E',
            require: '^selectable',
            replace: true,
            template: '<span class="checkbox" ng-class="{ active: selected }"></span>'
        };
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

                scope.$watchCollection(function() { return ctrl.areAllElementSelected(); }, function() {
                    scope.allSelected = ctrl.areAllElementSelected();
                });
            }
        };
    });