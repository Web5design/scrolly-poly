/*!
 * ScrollyPoly
 * infinite scrolling
**/

( function( window ) {

'use strict';

// ----- dependencies ----- //

var eventie = window.eventie;
var EventEmitter = window.EventEmitter;
var getSize = window.getSize;

// ----- vars ----- //

var document = window.document;
var docElem = document.documentElement;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// http://stackoverflow.com/a/384380/182183
var isElement = ( typeof HTMLElement === 'object' ) ?
  function isElementDOM2( obj ) {
    return obj instanceof HTMLElement;
  } :
  function isElementQuirky( obj ) {
    return obj && typeof obj === 'object' &&
      obj.nodeType === 1 && typeof obj.nodeName === 'string';
  };

// -------------------------- ScrollyPoly -------------------------- //

function ScrollyPoly( element, options ) {
  // bail out if not proper element
  if ( !element || !isElement( element ) ) {
    if ( console ) {
      console.error( 'Bad ' + this.settings.namespace + ' element: ' + element );
    }
    return;
  }

  this.element = element;

  // options
  this.options = extend( {}, this.options );
  extend( this.options, options );

  // kick it off
  this._create();
}

// add event emitter
extend( ScrollyPoly.prototype, EventEmitter.prototype );

ScrollyPoly.prototype.options = {
  scroller: window,
  triggerHeight: 150
};

ScrollyPoly.prototype._create = function() {

  this.pageIndex = 1;

  if ( this.options.scroller ) {
    eventie.bind( this.options.scroller, 'scroll', this );
  }
};

ScrollyPoly.prototype.ajaxNextPage = function() {
  // console.log('AJAX TIME');
  // don't trigger if already ajaxing
  if ( this.isAjaxing ) {
    // console.log('already ajaxing');
    return;
  }
  var request = new XMLHttpRequest();
  var pageIndex = this.pageIndex + 1;
  var url = this.options.pagePath[0] + pageIndex + this.options.pagePath[1];
  var _this = this;
  request.open( 'GET', url, true );
  request.onreadystatechange = function() {
    if ( request.readyState !== 4 ) {
      return;
    }
    if ( request.status === 200 ) {
      _this.gotPage( request.responseText );
    }

    // console.log( request.responseText );
    delete _this.isAjaxing;
  };
  request.send();
  this.isAjaxing = true;
};

ScrollyPoly.prototype.gotPage = function( responseText ) {
  var div = document.createElement('div');
  div.innerHTML = responseText;
  var items = div.querySelectorAll( this.options.itemSelector );
  var fragment = document.createDocumentFragment();
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    fragment.appendChild( item );
  }
  this.element.appendChild( fragment );
  this.pageIndex++;
  // console.log( items );
};

// -------------------------- events -------------------------- //

// enable event handlers for listeners
// i.e. scroll -> scroll
ScrollyPoly.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// original debounce by John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

// this fires every resize
ScrollyPoly.prototype.onscroll = function() {
  if ( this.scrollTimeout ) {
    clearTimeout( this.scrollTimeout );
  }

  var _this = this;
  function delayed() {
    _this.scroll();
    delete _this.scrollTimeout;
  }

  this.scrollTimeout = setTimeout( delayed, 100 );
};

// debounced
ScrollyPoly.prototype.scroll = function() {
  // do stuff

  var scrollY = window.pageYOffset !== undefined ? window.pageYOffset :
    // IE8
    docElem.scrollTop;

  var windowHeight = window.innerHeight || docElem.clientHeight;

  var bodyHeight = getSize( document.body ).height;

  // console.log( scrollY + windowHeight, bodyHeight - this.options.triggerHeight );

  if ( scrollY + windowHeight >= bodyHeight - this.options.triggerHeight ) {
    this.ajaxNextPage();
  }

};



// --------------------------  -------------------------- //

window.ScrollyPoly = ScrollyPoly;

})( window );
