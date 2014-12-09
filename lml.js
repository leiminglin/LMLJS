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

	function getElementViewTop(element){
		var actualTop = element.offsetTop
			,offsetParentElement = element.offsetParent;
		if( offsetParentElement == null && element.parentNode ){
			/* when style display is none */
			var parentNode = element.parentNode;
			while( offsetParentElement == null ){
				offsetParentElement = parentNode.offsetParent;
				parentNode = parentNode.parentNode;
				if( !parentNode ){
					break;
				}
			}
		}
		while ( offsetParentElement !== null /* document.body */ ){
			actualTop += (offsetParentElement.offsetTop+offsetParentElement.clientTop);
			offsetParentElement = offsetParentElement.offsetParent;
		}
		var elementScrollTop = document.documentElement.scrollTop 
			? document.documentElement.scrollTop : document.body.scrollTop; 
		return actualTop - elementScrollTop;
	}

	function getViewport(){
		if( document.compatMode == "BackCompat" ){
			return { width:document.body.clientWidth, 
				height:document.body.clientHeight }
		}else{
			return { width:document.documentElement.clientWidth, 
				height:document.documentElement.clientHeight }
		}
	}

	/**
	 * Lazy load img
	 */
	deferred.then(function(){
		var i, length, src, m = doc.getElementsByTagName('IMG'),viewport=getViewport(),count=0;
		window.onresize = function(){
			viewport = getViewport();
		};
		var loadImg = function(){
			if( count >= m.length ){
				/*ÒÆ³ýÊÂ¼þ*/
				if( window.addEventListener ){
					document.removeEventListener( 'scroll', loadImg, false );
				}else if( window.attachEvent ){
					window.detachEvent(event, loadImg); 
				}
				return;
			}
			for(i=0,j=m.length; i<j; i++){
				if( m[i].getAttribute('src') ){
					continue;
				}
				var viewtop = getElementViewTop(m[i]);
				if( viewtop>=0 && viewtop < viewport.height && (src=m[i].getAttribute('osrc')) ){
					m[i].setAttribute('src',src);
					m[i].onerror=function(){
						if( src=this.getAttribute('osrc-bak') ){
							this.setAttribute('src',src);
							this.onerror=null;
						}
					};
					m[i].onload=function(){
						count++;
					}
				}
			}
		};
		
		if( window.addEventListener ){
			document.addEventListener( 'scroll', loadImg, false );
		}else if( window.attachEvent ){
			window.attachEvent("onscroll", function(){
				loadImg();
			}); 
		}
		loadImg();
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
	};

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
			}else{
				script.onload = function(){
					callback();
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

