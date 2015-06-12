$ViewPreventUpdateProvider.$inject = [];
function $ViewPreventUpdateProvider() {
  var self = this,
      viewCancels = {};

  this.preventViewContentLoading = function(prevent) {
    if (prevent === undefined) return self.prevent;

    self.prevent = !!prevent;
  };

  this.view = function(name, cancelOn) {
    viewCancels[name] = cancelOn;

    return self;
  };

  this.isCanceled = function(name) {
    if (!viewCancels[name]) return false;
    return viewCancels[name](name);
  };

  this.$get = function() { return this; };
}

angular.module('ui.router.state').provider('$viewPreventUpdate', $ViewPreventUpdateProvider).run(['$rootScope', '$viewPreventUpdate', function($rootScope, $viewPreventUpdate) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $viewPreventUpdate.toParams   = toParams;
    $viewPreventUpdate.toState    = toState;
    $viewPreventUpdate.fromParams = fromParams;
    $viewPreventUpdate.fromState  = fromState;
  });

  $rootScope.$on('$viewResolving', function(event, name) {
    var viewName = name.substring(0, name.length - 1),
        element = angular.element('div[ui-view="'+ viewName + '"]');

    if (!$viewPreventUpdate.isCanceled(viewName)) {
      element.html('<div class="container-loading"></div>');
    }
  });
}]);
