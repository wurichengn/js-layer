var lcg = require("lcg");


var Filters = require("./filter-main.js");




//======模糊滤镜======
Filters["blur"] = lcg.bind(function(d,main){
	var self = this;

	//代理模糊滤镜
	var p = this.proxy(new PIXI.filters.BlurFilter());

	//同步
	p.sync = function(dt){
		if(dt.attr == null)
			return;
		p.blur = dt.attr.blur;
	}

});