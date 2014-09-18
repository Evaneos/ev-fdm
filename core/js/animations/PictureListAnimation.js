'use strict';

angular.module('ev-fdm')
   .animation('.ev-animate-picture-list', function() {

    return {
      enter : function(element, done) {
            var width = element.width();
            element.css('width', 0);
            element.css('opacity', 0);
            jQuery(element).animate({
                width: width,
                opacity: 1
            }, 300, done);

            return function(isCancelled) {
                if(isCancelled) {
                    jQuery(element).stop();
                }
            };
        },
        leave : function(element, done) {
            var width = element.width();
            element.css('opacity', 1);
            element.css('width', width + "px");

            jQuery(element).animate({
                width: 0,
                opacity: 0.3
            }, 300, done);

            return function(isCancelled) {
              if(isCancelled) {
                jQuery(element).stop();
              }
            };
        },
        move : function(element, done) {
          element.css('opacity', 0);
          jQuery(element).animate({
              opacity: 1
          }, done);

          return function(isCancelled) {
              if(isCancelled) {
                  jQuery(element).stop();
              }
          };
        },

        // you can also capture these animation events
        addClass : function(element, className, done) {},
        removeClass : function(element, className, done) {}
    };
});
