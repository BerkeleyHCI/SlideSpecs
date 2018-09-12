/*
 * Augment local storage to work with objects.
 */

Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
};

/*
 * jQuery autoResize (textarea auto-resizer)
 */

function defer(method) {
  if (window.jQuery) {
    method();
  } else {
    setTimeout(function() {
      defer(method);
    }, 50);
  }
}

defer(loadAutoResize);

function loadAutoResize() {
  $ = jQuery;
  $.fn.autoResize = function(options) {
    var settings = $.extend(
      {
        selector: 'textarea',
        onResize: function() {},
        animate: false,
        animateDuration: 50,
        animateCallback: function() {},
        extraSpace: 5,
        limit: 500,
      },
      options,
    );

    // Only textarea's auto-resize:
    this.filter('textarea').each(function() {
      // Get rid of scrollbars and disable WebKit resizing:
      var textarea = $(this).css({resize: 'none', 'overflow-y': 'hidden'}),
        // Cache original height, for use later:
        origHeight = textarea.height(),
        // Need clone of textarea, hidden off screen:
        clone = (function() {
          // Properties which may effect space taken up by chracters:
          var props = [
              'height',
              'width',
              'lineHeight',
              'textDecoration',
              'letterSpacing',
            ],
            propOb = {};

          // Create object of styles to apply:
          $.each(props, function(i, prop) {
            propOb[prop] = textarea.css(prop);
          });

          // Clone the actual textarea removing unique properties
          // and insert before original textarea:
          return textarea
            .clone()
            .removeAttr('id')
            .removeAttr('name')
            .css({
              position: 'absolute',
              top: 0,
              left: -9999,
            })
            .css(propOb)
            .attr('tabIndex', '-1')
            .insertBefore(textarea);
        })(),
        lastScrollTop = null,
        updateSize = function() {
          // Prepare the clone:
          clone
            .height(0)
            .val($(this).val())
            .scrollTop(10000);

          // Find the height of text:
          var scrollTop =
              Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
            toChange = $(this).add(clone);

          // Don't do anything if scrollTip hasen't changed:
          if (lastScrollTop === scrollTop) {
            return;
          }
          lastScrollTop = scrollTop;

          // Check for limit:
          if (scrollTop >= settings.limit) {
            $(this).css('overflow-y', '');
            return;
          }

          // Fire off callback:
          settings.onResize(textarea);

          // Either animate or directly apply height:
          settings.animate && textarea.css('display') === 'block'
            ? toChange
                .stop()
                .animate(
                  {height: scrollTop},
                  settings.animateDuration,
                  settings.animateCallback,
                )
            : toChange.height(scrollTop);
        };

      // Bind namespaced handlers to appropriate events:
      textarea
        .unbind('.dynSiz')
        .bind('keyup.dynSiz', updateSize)
        .bind('keydown.dynSiz', updateSize)
        .bind('change.dynSiz', updateSize);
    });

    // Chain:
    return this;
  };
}
