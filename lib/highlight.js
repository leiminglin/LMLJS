(function(){
	var tags = document.getElementsByTagName('PRE');

	for (var i=0; i<tags.length; i++) {
		if (tags[i].className && tags[i].className.indexOf('highlight') == -1 && tags[i].className.indexOf('code') > -1) {
			high_light(tags[i]);
		}
	}

	function loopArr(arr, regexp, color){
		for (var i in arr) {
			var pattern2 = new RegExp(regexp, "gi"), result2;
			while((result2 = pattern2.exec(arr[i])) != null){
				arr[i] = arr[i].replace(pattern2, "<font color="+color+">$&"+"</font>");
			}
		}
	}

	function escapeStr(str){
		return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function highlightQuotes(html, char){
		var newline = '', flag = 0;
		for (var x=0, y=html.length; x<y; x++ ) {
			if (html.charAt(x) == char) {
				if(flag == 0){
					newline += '<font color="blue">';
					newline += html.charAt(x);
					flag = 1;
				}else if(flag == 1 && html.charAt(x-1) != '\\') {
					newline += html.charAt(x);
					newline += '</font>';
					flag = 0;
				}else {
					newline += html.charAt(x);
				}
			}else {
				newline += html.charAt(x);
			}
		}
		return newline;
	};

	function hasSingleQuotation (html){
		return html.indexOf("'") != -1;
	}

	function hasDoubleQuotation (html){
		return html.indexOf('"') != -1;
	}

	function hasEscapeCharacter  (html){
		return html.indexOf('\\') != -1;
	}

	function high_light(tag){
		var arr = tag.innerHTML.split("\n")
		, div = document.createElement('PRE')
		, ldiv = document.createElement('DIV')
		, rdiv = document.createElement('DIV')
		, arr_len = arr.length
		, str_len = arr_len + '';

		div.appendChild(ldiv);
		div.appendChild(rdiv);

		if (arr[arr_len - 1] == '') {
			arr.pop();
			arr_len --;
		}

		var keywords = {
			"red":['function', 'var', 'instanceof', 'if', 'else', 'return', 'array'],
			"#fb0495":['(', ')', '[', ']', '{', '}'],
			"#f94304":['+', '-', ',', '*', '/', '=', '!']
		};

		var regexps = {
			"green":['\\$[a-zA-Z_][a-zA-Z0-9_]*'],
			"gray":['\/\/[^<>]*?$']
		};

		for (var i in arr) {
			var hasSingle = hasSingleQuotation(arr[i]);
			var hasDouble = hasDoubleQuotation(arr[i]);
			if (hasSingle && hasDouble) {
			} else if(hasSingle){
				arr[i] = highlightQuotes(arr[i], "'");
			} else if(hasDouble){
				arr[i] = highlightQuotes(arr[i], '"');
			}
		}

		for (var j in regexps) {
			for (var x in regexps[j]) {
				loopArr(arr, '(?!<font>*|<[^<>]*)'+regexps[j][x]+'(?![^<>]*<\/font>|<\/[^<>]*|[^<>]*>)', j);
			}
		}

		for (var j in keywords) {
			for (var x in keywords[j]) {
				loopArr(arr, '(?!<font>*|<[^<>]*)'+escapeStr(keywords[j][x])+'(?![^<>]*<\/font>|<\/[^<>]*|[^<>]*>)', j);
			}
		}

		var width = str_len.length * 10;
		ldiv.style.width = width + 'px';
		ldiv.style.float = 'left';
		ldiv.style.padding = "0 4px 0 0";
		ldiv.style.margin = "0 6px 0 0";
		ldiv.style.position = 'absolute';
		ldiv.style.borderRight = "1px dotted #CCC";
		ldiv.style.textAlign = "right";
		rdiv.style.paddingLeft = (width + 11) + 'px';
		div.style.position = 'relative';
		div.className = "code highlight wbreak";

		for (var i in arr) {
			ldiv.innerHTML += '<span style="display:block;">'+i+'</span>';
		}

		for (var i in arr) {
			var div_style = 'style="display:block;"';
			if (arr[i].replace(/\s/, '') == '') {
				div_style = 'style="height:26px;display:block;"';
			}
			rdiv.innerHTML += '<span '+div_style+'>'+ arr[i] +"</span>";
		}

		tag.parentNode.insertBefore(div, tag.nextSibling);
		tag.style.display = 'none';

		function adjust_height(){
			var ldiv_child = ldiv.getElementsByTagName('SPAN');
			var rdiv_child = rdiv.getElementsByTagName('SPAN');
			for (var i in ldiv.getElementsByTagName('SPAN')) {
				if(ldiv_child[i].tagName){
					ldiv_child[i].style.height = rdiv_child[i].offsetHeight + 'px';
				}
			}
		}
		this.adjust_height = adjust_height;
		adjust_height();

		if(window.addEventListener){
			window.addEventListener( 'resize', adjust_height, false );
		}else if(window.attachEvent){
			window.attachEvent("onresize", adjust_height);
		}
	}

})();
