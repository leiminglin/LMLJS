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

	var createDeferred = function(){
		var deferred = {};
		deferred.queue = [];
		deferred.running = false;
		deferred.promise = function(){
			if( deferred.queue.length ){
				deferred.running = true;
				deferred.queue.shift()();
			}else{
				deferred.running = false;
			}
		};
		deferred.then = function(e){
			deferred.queue.push(e);
		};
		return deferred;
	};

	var deferred = createDeferred();


	function createWithJs(){

		var neededJs = {};

		function loadJs( src, callback, script, stag ) {
			script = doc.createElement('script'),
			stag = doc.getElementsByTagName('script')[0];
			script.async = 1;
			script.src = src;
			try{
				stag.parentNode.insertBefore( script, stag );
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

		function seqLoad(jsArr, callback, isForceAppend){
			var firstJs = jsArr[0];
			function loop(){
				var js = jsArr.shift(), nextJs = jsArr.shift();
				jsArr.unshift(nextJs);
				withJs(js, function(){
					if(nextJs){
						loop();
						if(!neededJs[nextJs].callback.running){
							withJs.start(nextJs);
						}
					}else{
						callback();
					}
				}, isForceAppend);
			}
			loop();
			if(!neededJs[firstJs].callback.running){
				withJs.start(firstJs);
			}
		}


		function withJs(js, callback, isForceAppend){
			if(typeof js == 'object' && js instanceof Array){
				return seqLoad(js, callback);
			}
			callback = callback || function(){
				deferred.promise();
			};
			var cb = function(){
				isForceAppend = isForceAppend+'' == '1' ? true : false;
				var to_load = function(){loadJs(js, function(){
					neededJs[js].loaded = true;
					callback();
					withJs.start(js);
				})};
				if(isForceAppend){
					to_load();
				}else{
					if(neededJs[js].start || neededJs[js].loaded){
						callback();
						withJs.start(js);
					}else{
						to_load();
					}
				}
				neededJs[js].start = true;
			};
			if(!neededJs[js]){
				var def = createDeferred();
				def.then(cb);
				neededJs[js] = {
					'loaded': false,
					'start': false,
					'callback': def
				};
			}else{
				neededJs[js].callback.then(cb);
			}
			if(!neededJs[js].callback.running){
				withJs.start(js);
			}
		}

		withJs.start = function(js){
			if(js){
				neededJs[js].callback.promise();
			}else{
				for(var i in neededJs){
					neededJs[i].callback.promise();
				}
			}

		};

		return withJs;
	}

	var loadJs = createWithJs();



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

		var pageScrollTop;
		if ( typeof win.pageYOffset === 'number' ) {
			pageScrollTop = win.pageYOffset;
		} else {
			docElement = (doc.compatMode && doc.compatMode === 'CSS1Compat')
			? doc.documentElement : doc.body;
			pageScrollTop = docElement.scrollTop;
		}

		return actualTop - pageScrollTop;
	}

	function getViewport(){
		if( doc.compatMode && doc.compatMode == "BackCompat" && doc.body){
			return { width : doc.body.clientWidth,
				height : doc.body.clientHeight }
		}else{
			return { width : doc.documentElement.clientWidth,
				height : doc.documentElement.clientHeight }
		}
	}

	/**
	 * Lazy load img
	 */
	deferred.then(function(){
		var i, length, src, m = doc.getElementsByTagName('IMG'),
			viewport=getViewport(), count=0;
		window.onresize = function(){
			viewport = getViewport();
		};
		var loadImg = function(){
			if( count >= m.length ){
				/* remove event */
				if( window.addEventListener ){
					doc.removeEventListener( 'scroll', loadImg, false );
				}else if( window.attachEvent ){
					window.detachEvent(event, loadImg);
				}
				return;
			}
			for(i=0,j=m.length; i<j; i++){
				if( m[i].getAttribute('src') ){
					continue;
				}
				var viewtop = getElementViewTop(m[i])
					,imgHeight = m[i].getAttribute('height')||0;
				if( viewtop>=-imgHeight && viewtop < viewport.height
					&& (src=m[i].getAttribute('osrc')) ){
					m[i].setAttribute('src',src);
					m[i].onerror=function(){
						if( src=this.getAttribute('osrc-bak') ){
							this.setAttribute('src',src);
							this.onerror=null;
						}
					};
					m[i].onload = function(){
						count++;
					}
				}
			}
		};

		if( window.addEventListener ){
			doc.addEventListener( 'scroll', loadImg, false );
		}else if( window.attachEvent ){
			window.attachEvent("onscroll", loadImg);
		}
		loadImg();
		deferred.promise();
	});

	if( typeof doc.getElementsByClassName != 'function' ){
		doc.getElementsByClassName = function( classname ){
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
		var e = doc.getElementsByClassName('lazyCss');
		for( var i=0; i<e.length; i++ ) {
			addLazyCss( e[i].value || e[i].innerHTML );
		}
		deferred.promise();
	});

	/**
	 * Lazy load HTML
	 */
	deferred.then( function(){
		var e = doc.getElementsByClassName('lazyHtml');
		for( var i=0; i<e.length; i++ ) {
			if(e[i].tagName == 'TEXTAREA'){
				var wrapdiv = doc.createElement('DIV');
				wrapdiv.innerHTML = e[i].value;
				e[i].parentNode.insertBefore(wrapdiv, e[i]);
			}
		}
		deferred.promise();
	});

	var lml = {};
	lml.deferred = deferred;
	lml.createDeferred = createDeferred;
	lml.loadJs = loadJs;
	lml.run = function(){
		deferred.promise();
		loadJs.start();
	};

	win.lml = lml;

})(window, document);

