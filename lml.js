/**
 * LMLJS Framework
 * Copyright (c) 2014 http://lmlphp.com All rights reserved.
 * Licensed ( http://mit-license.org/ )
 * Author: leiminglin <leiminglin@126.com>
 * 
 * A lovely javascript framework.
 * 
 * $id: $
 * 
 */
(function(win, doc, undf){

	var deferred = {};
	deferred.queue = [];
	deferred.promise = function(){
		if( deferred.queue.length ){
			deferred.queue.shift()();
		}
	};
	deferred.then = function(e){
		deferred.queue.push(e);
	};

	/**
	 * Lazy load img
	 */
	deferred.then(function(){
		var i,x,m = doc.getElementsByTagName('IMG');
		for(i in m){
			if( ( (typeof(m[i])).toString().match(/object/i) )
					&&m[i].getAttribute('osrc')
					&&(x=m[i].getAttribute('osrc')) ){
				m[i].setAttribute('src',x);
			}
		}
		deferred.promise();
	});

	if( typeof document.getElementsByClassName != 'function' ){
		document.getElementsByClassName = function( classname ){
			var d = doc, e = d.getElementsByTagName('*'), 
				c = new RegExp('\\b'+classname+'\\b'), r = [];
			for( var i=0,l=e.length; i<l; i++ ){
				var classname = e[i].className;
				if( c.test(classname) ){
					r.push( e[i] );
				}
			}
			return r;
		}
	}

	var addLazyCss = function( css ) {
		var style = doc.createElement('style');
		style.type='text/css';
		if (style.styleSheet) {
			style.styleSheet.cssText = css;
		}else{
			style.innerHTML = css;
		}
		doc.getElementsByTagName('head')[0].appendChild(style);
	}

	/**
	 * Lazy load CSS
	 */
	deferred.then( function(){
		var e = document.getElementsByClassName('lazyCss');
		for( var i=0; i<e.length; i++ ) {
			addLazyCss( e[i].value || e[i].innerHTML );
		}
		deferred.promise();
	});

	var loadJs = function( src, callback, script, stag ) {
		script = doc.createElement('script'),
		stag = doc.getElementsByTagName('script')[0];
		script.async=1;
		script.src=src;
		try{
			stag.parentNode.insertBefore( script, stag );
			callback = callback || function(){
				deferred.promise();
			};
			if( window.addEventListener ){
				script.addEventListener( 'load', callback, false );
			}else if( window.attachEvent ){
				script.onreadystatechange = function(){
					if(this.readyState.match(/loaded|complete/i)){
						callback();
					}
				}
			}
		}catch(e){
			callback();
		}
	};

	var lml = {};
	lml.deferred = deferred;
	lml.loadJs = loadJs;
	win.lml = lml;
	
})(window, document);

