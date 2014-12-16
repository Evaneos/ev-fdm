(function() {
'use strict';

var hasOwnProp = Object.prototype.hasOwnProperty;
var isObject = angular.isObject;

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
    return function mapFilter(key, mapping) {
      // Mapping is directly provided
      if (isObject(mapping)) {
        return hasOwnProp.call(mapping, key)) ? mapping[key] : key;
      }
      // or it's just a mapping name
      assertMapping(mapping);
      var map = maps[mapping];
      switch (true) {
        case hasOwnProp.call(map, key):
          return map[key];
        case hasOwnProp.call(defaults, mapping):
          return defaults[mapping];
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
