$.fn.lmlFloat = function(setting){
	var t = setting||{},
	top = t.top||0,
	on_float = t.on||function(){},
	off_float = t.off||function(){},
	lml_float = function(e) {
		var element_top = e.position().top,
		ele_position = e.css("position");
		$(window).scroll(function(){
			var scroll_top = $(this).scrollTop();
			if( scroll_top > element_top - top ) {
				if(window.XMLHttpRequest){
					e.css({position:"fixed", top:0+top})
				}else{
					e.css({top:scroll_top+top})
				}
				on_float()
			} else {
				e.css({position:ele_position, top:element_top});
				off_float()
			}
		})
	};
	return $(this).each(function(){
		lml_float($(this))
	})
};