'use strict';

var module = angular.module('ev-fdm');

/**
 * evAccordion directive works as an attribute
 * and it's working with the accordion directive (required)
 *
 * His role is to add methods to the scope of the accordion
 */
module.directive('evAccordion', ['accordionDirective', function(accordionDirective) {
  return {
    restrict:'A',
    require: 'accordion',
    link: function(scope, element, attr, accordionCtrl) {

        scope.expandAll   = setIsOpenAll.bind(null, true);
        scope.collapseAll = setIsOpenAll.bind(null, false);
        scope.showableAccordionButton = showableAccordionButton;

        // Set the isOpen property for ALL groups (to true or false)
        function setIsOpenAll(isOpen) {
            accordionCtrl.groups.forEach(function(group) {
                group.isOpen = isOpen;
            });
        }

        /**
         * Should we display that 'type' of button?
         *  - type can have the value: 'expand' or 'collapse'
         *
         * Expand btn is displayed when all groups are closed
         * Collaspe btn is displayed when at least one group is open
         */
        function showableAccordionButton(type) {
            var groups = accordionCtrl.groups;
            if(groups.length === 0) {
                return false;
            }

            if(type === 'expand') {
                return groups.every(function(group) {
                    return !group.isOpen;
                });
            } else {
                return groups.some(function(group) {
                    return group.isOpen;
                });
            }
        }
    }
  };
}]);
