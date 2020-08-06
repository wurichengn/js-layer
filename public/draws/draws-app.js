var Camera = require("lcg-camera");
var Util = require("./draws-util.js");
var Uint = require("./uints/draws-uint.js");


//==========绘制核心=============
module.exports = function(d){
	var self = this;
	//默认配置
	var cfg = {
		//默认运行
		autoStart:false,
		//透明
		transparent:true,
		//尺寸
		width:800,
		height:800
	};
	//写入配置
	for(var i in d)
		cfg[i] = d[i];
	
	//初始化pixiAPP
	var app = new PIXI.Application(cfg);
	this.view = app.view;

	//画布全局数据
	var data = this.data = new Camera({
		//舞台
		stage:{
			//图层类型
			type:"layer",
			//子节点
			childs:[]
		}
	},true);

	//初始化舞台图层
	var stage = new Uint(data.stage);
	app.stage.addChild(stage.body);

	//添加一张图像
	this.addImage = async function(url){
		var tex = await PIXI.Texture.fromURL(url);
		self.data.stage.childs.push({
			type:"image",
			input:tex,
			effects:[]
		});
	}

	//侦听粘贴
	document.onpaste = async function(e){
		var items = e.clipboardData.items;
		var list = [];
		//循环处理每个对象
		for(var i = 0;i < items.length;i++){
			//字符串处理
			if(items[i].kind == "string")
				var re = await Util.copyString(items[i]);//items[i].getAsString(function(res){console.log(res);});
			else
				//文件处理
				var re = await Util.copyFile(items[i]);
			//作为图像添加
			if(re != null)
				self.addImage(re);
		}
	}
}