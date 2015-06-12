angular.module('ev-fdm')
    .animation('.ev-animate-tag-list', function() {
        return {
          enter : function(element, done) {
                element.css('opacity', 0);
                jQuery(element).animate({
                    opacity: 1
                }, 300, done);

                return function(isCancelled) {
                    if(isCancelled) {
                        jQuery(element).stop();
                    }
                };
            },
            leave : function(element, done) {
                element.css('opacity', 1);

                jQuery(element).animate({
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
