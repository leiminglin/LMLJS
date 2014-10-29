$ && $.fn.lmlScroll = function(o){
	var items = $(this).children(":eq(0)");
	var item = items.children();
	var screens = {
		"total":item.length,
		"count":1,
		"next":function(d){
			if(d == -1){
				return this.prev();
			}
			if(this.count >= this.total){
				this.count = 0;
			}
			return ++this.count;
		},
		"prev":function(){
			if(this.count <= 1){
				this.count = this.total+1;
			}
			return --this.count;
		}
	};
	var speed = o.speed||1000;
	var timeout = o.timeout||3000;
	var direction = o.direction!=undefined?o.direction:1;
	var w = o.width?o.width.match(/\d+/):100;
	var h = o.height?o.height.match(/\d+/):100;
	var width = w+"px";
	var height = h+"px";
	var th = this;
	var timer = {};
	var sidebar = o.sidebar||undefined;
	var panel = o.panel||undefined;
	if(sidebar){
		side_width = sidebar.width.match(/\d+/)||50;
		var s = $("<div/>").css({"width":side_width,"height":height,"position":"absolute","opacity":0.5,"background":"gray","z-index":9,"line-height":height,"text-align":"center","font-weight":"bold","color":"#000"}).append("<").mouseover(function(){
			$(this).css({"opacity":0.9,"color":"#FFF"});
		}).mouseout(function(){
			$(this).css({"opacity":0.5,"color":"#000"});
		});
		$(this).prepend($(s).clone(true).click(function(){
			if(timer.run){
				clearTimeout(timer.run);
			}
			th.run(-1);
		})).append($(s).clone(true).click(function(){
			if(timer.run){
				clearTimeout(timer.run);
			}
			th.run(1);
		}).html(">").css({"left":(w-side_width)+"px"}));
	}
	var panel_element;
	if(panel){
		var psize = panel.size.match(/\d+/)||14;
		var gap = 2;
		var margin_width = screens.total>1?(screens.total-1)*gap:0;
		var pwidth = screens.total*psize + margin_width;
		var panel_color = panel.color||"red";
		panel_element = $("<div/>").css({"width":pwidth,"height":psize,"left":(w-pwidth)/2+"px","position":"absolute","top":h-psize-5+"px"}).append(function(){
			var x = $("<div/>").css({"border":"1px solid #333","width":psize-2+"px","height":psize-2+"px","float":"left","opacity":0.5,"background":"#FFF"}).click(function(){
				var id = $(this).attr("v");
				if(timer.run){
					clearTimeout(timer.run);
				}
				screens.count = id;
				panel_element.children().eq(id-1).css({"background":panel_color}).siblings().css({"background":"#FFF"});
				items.stop(true,true).animate({"left" : -1*id*w+"px"}, speed).queue(function(){
					th.start();
				});
			});
			for (var i=0;i<screens.total;i++ )
			{
				var g = x.clone(true);
				if(i > 0){
					g.css("margin-left",gap+"px");
				}else{
					g.css("background",panel_color);
				}
				$(this).append(g.attr("v",i+1));
			}
		});
		$(this).append(panel_element);
	}
	$(this).css({"height":height,"width":width,"overflow":"hidden","margin":"0 auto","position":"relative"});
	items.css({"position":"absolute","height":height,"width":"20000em","left":-1*w+"px" });
	item.css({"overflow":"hidden","height":height,"width":width,"float":"left"});
	item.children().css({"float":"left"});
	var first = item.first().clone(true).addClass("clone");
	var last = item.last().clone(true).addClass("clone");
	items.append(first).prepend(last);
	this.run = function(dire){
		/*-1 left, 1 right*/
		if(items.queue("fx") != ''){
			items.stop(true, false);
		}
		var d = dire==undefined?direction:dire;
		var i = screens.next(d);
		var left = -1*i*w+"px";
		var queue = function(){};
		if( i==1 && d==1){
			left = -1*(screens.total+1)*w+"px";
			queue = function(){
				items.css("left",-1*w+"px");
			}
		}
		if( i==screens.total && d==-1){
			left = "0px";
			queue = function(){
				items.css("left",-1*screens.total*w+"px");
			}
		}
		items.animate({"left" : left}, speed)
		.queue("fx", function(){
			queue();
			panel_element.children().eq(i-1).css({"background":panel_color}).siblings().css({"background":"#FFF"});
			items.dequeue();
		});
		this.start = function(){
			timer.run = setTimeout(function(){th.run(d)}, timeout);
		}
		this.start();
	}
	setTimeout(function(){
		th.run();
	}, timeout);
}