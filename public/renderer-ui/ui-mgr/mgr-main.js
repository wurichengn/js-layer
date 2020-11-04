var Camera = require("lcg-camera");


//UI全局管理器
module.exports = function(d){
	var self = this;
	//配置
	var cfg = {
		
	};
	//写入配置
	for(var i in d)
		cfg[i] = d[i];

	//初始化渲染器
	var renderer = this.renderer = new Renderer();

	//初始化状态机
	var store = this.store = new Camera({
		//渲染全局设置
		setting:{
			width:640,
			height:640,
		},
		//资源组
		res:[],
		//图层表
		layers:[]
	},true);

	//面板组
	this.views = {
		//画布
		draws:
	};
}