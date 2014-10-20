'use strict';

var module = angular.module('ev-fdm')
    .directive('evPagination', [function () {
        var ELLIPSIS = '...';
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'ev-pagination.html',
            scope: {
                currPage:     '=',
                nbPage:       '=',
                onPageChange: '='
            },

            link: function (scope){
                scope.paginationButtons = [];
                scope.prevClass = '';
                scope.nextClass = '';

                scope.currPage = scope.currPage || 1;
                scope.nbPage   = scope.nbPage   || 1;

                scope.generateButtons = function () {
                    var i = 0;
                    var nbAround = 2; // We want to have this amount of links around the current page.

                    scope.paginationButtons = [];
                    // Add 1
                    scope.paginationButtons.push ({value: 1, class:scope.currPage==1 ? 'active':'' });

                    // Add the 3 dots
                    if (scope.currPage-nbAround > 2) {
                        scope.paginationButtons.push({ value: ELLIPSIS, class:'disabled' });
                    }

                    // add the surrounding page numbers
                    for (i = nbAround; i > 0; i--) {
                        if (scope.currPage-i > 1) {
                            scope.paginationButtons.push ({value: scope.currPage-i});
                        }
                    }

                    // add the actual page
                    if (scope.currPage != 1 && scope.currPage != scope.nbPage) {
                        scope.paginationButtons.push ({ value: scope.currPage, class:'active' });
                    }

                    // add the surrounding page numbers
                    for (i = 1; i <= nbAround; i++) {
                        if (scope.currPage+i < scope.nbPage) {
                            scope.paginationButtons.push ({value: scope.currPage+i});
                        }
                    }

                    // Add the 3 dots
                    if (scope.currPage+nbAround < scope.nbPage-1){
                        scope.paginationButtons.push ({ value: ELLIPSIS, class:'disabled' });
                    }

                    // Add final page number
                    if (scope.nbPage > 1){
                        scope.paginationButtons.push ({value: scope.nbPage,class:scope.currPage==scope.nbPage ? 'active':''});
                    }
                    // if (scope.currPage == 1)            { scope.prevClass='inactive'; }
                    // if (scope.currPage == scope.nbPage) { scope.nextClass='inactive'; }
                };

                scope.previousPage = function (){
                    if (scope.currPage > 1) {
                        scope.currPage--;
                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage);
                        }
                    }

                };

                scope.changePage = function (value){
                    if (value != ELLIPSIS && value >=1 && value <= scope.nbPage){
                        scope.currPage = value;

                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(value);
                        }
                    }
                };

                scope.nextPage = function (){
                    if (scope.currPage < scope.nbPage){
                        scope.currPage++;

                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage);
                        }
                    }
                };

                scope.$watch('nbPage + currPage', function() {
                    scope.generateButtons ();
                });
            }
        };
    }]);