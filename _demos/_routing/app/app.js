'use strict';

var app = angular.module('demo', ['ev-fdm'])
    .config(function($stateProvider, $urlRouterProvider, $viewPreventUpdateProvider) {

  $viewPreventUpdateProvider
    .view('panel-proposal', function() {
      var toParams   = $viewPreventUpdateProvider.toParams,
          fromParams = $viewPreventUpdateProvider.fromParams;

      return toParams.proposal == fromParams.proposal;
    });

  var asyncResolve = function (value, $q) {
    var deferred = $q.defer();
    setTimeout(function() {
      deferred.resolve({ id: value });
    }, 2000);

    return deferred.promise;
  }

  $stateProvider
    .state('quote', {
      url: "/quote/:quote",
      panels: ['quote'],
      resolve: {
        quote: function($stateParams, $q) {
          return asyncResolve($stateParams.quote, $q);
        }
      },
      views: {
        "panel-quote@": {
          templateUrl: "partials/panelViewQuote.html",
          controller: function($scope, quote) {
            $scope.quote = quote;
          }
        }
      }
    })
    .state('quote.proposal', {
      url: "/proposal/:proposal",
      panels: ['quote', 'proposal'],
      resolve: {
        proposal: function($stateParams, $q) {
          return asyncResolve($stateParams.proposal, $q);
        }
      },
      views: {
        "panel-proposal@": {
          templateUrl: "partials/panelViewProposal.html",
          controller: function($scope, proposal, quote) {
            $scope.proposal = proposal;
            $scope.quote    = quote;
          }
        }
      }
    })
    .state('quote.proposal2', {
      url: "/proposal2/:proposal",
      panels: ['proposal', 'quote'],
      resolve: {
        proposal: function($stateParams, $q) {
          return asyncResolve($stateParams.proposal, $q);
        }
      },
      views: {
        "panel-proposal@": {
          templateUrl: "partials/panelViewProposal.html",
          controller: function($scope, proposal, quote) {
            $scope.proposal = proposal;
            $scope.quote    = quote;
          }
        }
      }
    })
    .state('quote.message', {
      url: "/message/:message",
      panels: ['quote', 'message'],
      resolve: {
        message: function($stateParams, $q) {
          return asyncResolve($stateParams.message, $q);
        }
      },
      views: {
        "panel-message@": {
          templateUrl: "partials/panelViewMessage.html",
          controller: function($scope, message, quote) {
            $scope.message  = message;
            $scope.quote    = quote;
          }
        }
      }
    })
    .state('quote.message.proposal', {
      url: "/proposal/:proposal",
      panels: ['quote', 'message', 'proposal'],
      resolve: {
        proposal: function($stateParams, $q) {
          return asyncResolve($stateParams.proposal, $q);
        }
      },
      views: {
        "panel-proposal@": {
          templateUrl: "partials/panelViewProposal.html",
          controller: function($scope, proposal, message, quote) {
            $scope.proposal = proposal;
            $scope.message  = message;
            $scope.quote    = quote;
          }
        }
      }
    });

  $urlRouterProvider.otherwise("/quote/1");

 }).run(['$rootScope', '$state', '$viewPreventUpdate', 'PanelService', function($rootScope, $state, $viewPreventUpdateProvider, panelService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $viewPreventUpdateProvider.preventViewContentLoading(true);

      $state.nextState = toState;

      var nextPanels = $state.nextState.panels || [];

      angular.forEach(nextPanels, function(panel, i) {
        var panelInstance = panelService.open({
          name: panel,
          template:'<div ui-view="panel-'+panel+'"><div class="container-loading"></div> </div>',
          index: i+1
        });
      });

      angular.forEach(panelService.panels, function(value, panel) {
        if (nextPanels.indexOf(panel) == -1 && panelService.panels[panel]) {
          panelService.close(panel);
          panelService.panels[panel] = false;
        }
      });
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $viewPreventUpdateProvider.preventViewContentLoading(false);
    });
 }]);
