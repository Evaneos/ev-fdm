(function() {
'use strict';

var hasOwnProp = Object.prototype.hasOwnProperty;

function MapFilterProvider() {
  var maps = {};
  var defaults = {};

  function assertMapping(name) {
    if (!hasOwnProp.call(maps, name)) {
      throw new Error('Mapping "' + name + '" is not valid, did you register it using mapSymbolFilterProvider#registerMapping() ?');
    }
  }

  this.registerMapping = function(name, mapping) {
    if (hasOwnProp.call(maps, name)) {
      throw new Error('A mapping named "' + name + '" was already registered');
    }
    var map = maps[name] = {};
    for (var key in mapping) {
      if (hasOwnProp.call(mapping, key)) {
        map[key] = mapping[key];
      }
    }
  };

  this.registerDefault = function(name, value) {
    assertMapping(name);
    defaults[name] = value;
  };

  this.$get = function factory() {
    return function mapFilter(key, mappingName) {
      assertMapping(mappingName);
      var map = maps[mappingName];
      switch (true) {
        case hasOwnProp.call(map, key):
          return map[key];
        case hasOwnProp.call(defaults, key):
          return defaults[key];
        default:
          return key;
      }
    };
  };
}


angular.module('ev-fdm')
  .provider('mapFilter', MapFilterProvider)
;

})();
