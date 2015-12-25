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

	function createDeferred(/**/ deferred) {
		deferred = {};
		deferred.queue = [];
		deferred.running = 0;
		deferred.promise = function(){
			if( deferred.queue.length ){
				deferred.running = 1;
				deferred.queue.shift()();
			}else{
				deferred.running = 0;
			}
		};
		deferred.then = function(e){
			deferred.queue.push(e);
		};
		return deferred;
	};

	var
	deferred = createDeferred(),
	loadJs = createWithJs(),
	lml = {}
	;


	function createWithJs(/**/ neededJs){

		neededJs = {};

		function loadJs( src, callback, /**/ script, stag ) {
			script = doc.createElement('script'),
			stag = doc.getElementsByTagName('script')[0];
			script.async = 1;
			script.src = src;
			try{
				stag.parentNode.insertBefore( script, stag );
				if( win.addEventListener ){
					script.addEventListener( 'load', callback, false );
				}else if( win.attachEvent ){
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

		function seqLoad(jsArr, callback, isForceAppend, /**/ firstJs) {
			firstJs = jsArr[0];
			function loop(/**/ js, nextJs){
				js = jsArr.shift(), nextJs = jsArr.shift();
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
		}


		withJs.competeLoad = function(jsArr, callback, isForceAppend, /**/ i, j) {
			for(i=0, j=jsArr.length; i<j; i++){
				withJs(jsArr.shift(), function(){
					if(this.flag){
						return;
					}else{
						callback();
						this.flag = 1;
					}
				});
			}
		}


		function withJs(js, callback, isForceAppend, /**/ def){
			if(typeof js == 'object' && js instanceof Array){
				return seqLoad(js, callback);
			}
			callback = callback || function(){
				deferred.promise();
			};
			function cb() {
				isForceAppend = isForceAppend+'' == '1' ? 1 : 0;
				function to_load(){loadJs(js, function(){
					neededJs[js].loaded = 1;
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
				neededJs[js].start = 1;
			};
			if(!neededJs[js]){
				def = createDeferred();
				def.then(cb);
				neededJs[js] = {
					'loaded': 0,
					'start': 0,
					'callback': def
				};
			}else{
				neededJs[js].callback.then(cb);
			}
			if(!neededJs[js].callback.running){
				withJs.start(js);
			}
		}

		withJs.start = function(js, /**/ i){
			if(!lml.onload){
				return;
			}
			if(js){
				neededJs[js].callback.promise();
			}else{
				for(i in neededJs){
					neededJs[i].callback.promise();
				}
			}

		};

		return withJs;
	}




	function getElementViewTop(element){
		var
		actualTop = element.offsetTop
		,offsetParentElement = element.offsetParent
		,parentNode
		,pageScrollTop
		;
		if( offsetParentElement == null && element.parentNode ){
			/* when style display is none */
			parentNode = element.parentNode;
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
		var
		i, length, src, m = doc.getElementsByTagName('IMG'),
		viewport=getViewport(), count=0, viewtop, imgHeight
		;
		win.onresize = function(){
			viewport = getViewport();
		};
		function loadImg() {
			if( count >= m.length ){
				/* remove event */
				if( win.addEventListener ){
					doc.removeEventListener( 'scroll', loadImg, false );
				}else if( win.attachEvent ){
					win.detachEvent(event, loadImg);
				}
				return;
			}
			for(i=0,j=m.length; i<j; i++){
				if( m[i].getAttribute('src') ){
					continue;
				}
				viewtop = getElementViewTop(m[i]);
				imgHeight = m[i].getAttribute('height')||0;
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

		if( win.addEventListener ){
			doc.addEventListener( 'scroll', loadImg, false );
		}else if( win.attachEvent ){
			win.attachEvent("onscroll", loadImg);
		}
		loadImg();
		deferred.promise();
	});

	if( typeof doc.getElementsByClassName != 'function' ){
		doc.getElementsByClassName = function (classname) {
			var
			e = doc.getElementsByTagName('*'),
			c = new RegExp('\\b'+classname+'\\b'),
			r = [], i, l, classname
			;
			for (i=0, l=e.length; i<l; i++) {
				classname = e[i].className;
				if( c.test(classname) ){
					r.push( e[i] );
				}
			}
			return r;
		}
	}

	function addLazyCss(css, /**/ style) {
		style = doc.createElement('style');
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
	deferred.then(function(/**/ e, i){
		e = doc.getElementsByClassName('lazyCss');
		for (i=0; i<e.length; i++) {
			addLazyCss( e[i].value || e[i].innerHTML );
		}
		deferred.promise();
	});

	/**
	 * Lazy load HTML
	 */
	deferred.then(function(){
		var
		e = doc.getElementsByClassName('lazyHtml'),
		i, wrapdiv
		;
		for (i=0; i<e.length; i++ ) {
			if(e[i].tagName == 'TEXTAREA'){
				wrapdiv = doc.createElement('DIV');
				wrapdiv.innerHTML = e[i].value;
				e[i].parentNode.insertBefore(wrapdiv, e[i]);
			}
		}
		deferred.promise();
	});

	lml.deferred = deferred;
	lml.createDeferred = createDeferred;
	lml.loadJs = loadJs;
	lml.onload = 0;
	lml.run = function(){
		lml.onload = 1;
		deferred.promise();
		loadJs.start();
	};

	win.lml = lml;

})(window, document);

