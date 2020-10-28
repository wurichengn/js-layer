
var Uint = require("./draws-uint.js");

//======图层======
module.exports = function(d){
	//以容器作为代理
	var body = this.body = new PIXI.Container();

	//初始化画布
	/*var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	//初始化贴图
	var tex = PIXI.Texture.from(canvas);*/

	//初始化精灵
	var sprite = new PIXI.Sprite(d.input);
	body.addChild(sprite);

	//获取输入贴图
	/*var img = d.input.baseTexture.resource.source;
	canvas.width = d.input.baseTexture.width;
	canvas.height = d.input.baseTexture.height;

	
	ctx.drawImage(img,0,0);
	tex.update();*/
}