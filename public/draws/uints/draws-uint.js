

//绘制单位
//根据不同类型调用不同类型的实际逻辑
module.exports = function(d){
	var self = this;
	//如果是图层
	if(d.type == "layer")
		Layer.call(self,d);
	if(d.type == "image")
		Image.call(self,d);
}


//图层
var Layer = require("./draws-layer.js");

//图像
var Image = require("./draws-image.js");