(function( $ ){

  var methods = {
    init : function( options ) {

      return this.each( function () {

        var $this = $(this);

        $.each(options, function( label, setting ) {
          $this.data(label, setting);
        });

        $this.bind('dragenter.dndUploader', methods.dragEnter);
        $this.bind('dragover.dndUploader', methods.dragOver);
        $this.bind('drop.dndUploader', methods.drop);

      });
    },

    dragEnter : function ( event ) {
      event.stopPropagation();
      event.preventDefault();

      return false;
    },

    dragOver : function ( event ) {
      event.stopPropagation();
      event.preventDefault();

      return false;
    },

    drop : function( event ) {
      event.stopPropagation();
      event.preventDefault();

      var $this = $(this);
      var dataTransfer = event.originalEvent.dataTransfer;

      if (dataTransfer.files.length > 0) {
        $.each(dataTransfer.files, function ( i, file ) {

          // Check whether an image file is being uploaded.
          var fn = file.name;
          if (['png', 'jpg', 'jpeg'].indexOf(fn.ext().toLowerCase()) == -1)
            return false; // skip if not these extensions

          var xhr    = new XMLHttpRequest();
          var upload = xhr.upload;

          xhr.open($this.data('method') || 'POST', $this.data('url'), true);
          xhr.setRequestHeader('X-Filename', fn.hashName());

          //Call a function when the state changes.
          xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
              if ($this.data('done')) // Request finished, execute handler.
                $this.data('done')(fn)
          }

          xhr.send(file);
        });

      };

      return false;
    }
  };

  $.fn.dndUploader = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.dndUploader' );
    }
  };
})( jQuery );
