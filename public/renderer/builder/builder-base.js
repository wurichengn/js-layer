


var Builders = require("./builder-main.js");




//======基本图像生成器======
Builders["sprite"] = function(d,main){
	var self = this;

	//精灵
	var sprite = new PIXI.Sprite();
	//加入内容
	this.input_layer.addChild(sprite);

	//数据同步处理
	this.message("unit-sync",function(e){
		sprite.texture = main.res.get(self.attr.res);
	});

}



//======全画布生成器======
Builders["rect-full"] = function(d,main){
	var self = this;

	//创建画板
	var g = new PIXI.Graphics();
	//加入内容
	this.input_layer.addChild(g);

	//数据同步处理
	this.message("unit-sync",function(e){
		g.clear();
		g.beginFill(this.attr.color || 0xFF3300);
		g.drawRect(0, 0, main.setting.width, main.setting.height);
		g.endFill();
	});

}