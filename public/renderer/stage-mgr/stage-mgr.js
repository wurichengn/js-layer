var lcg = require("lcg");
var StageUnit = require("./stage-unit.js");


//场景管理器
module.exports = function(d){
	var self = this;

	//配置写入
	var cfg = {
		
	};
	for(var i in d)
		cfg[i] = d[i];

	//初始化主场景
	var app = this.app = new PIXI.Application({
		transparent:true
	});
	this.view = app.view;
	var stage = StageUnit.new({},self,app.stage);

	//场景配置
	var setting = this.setting = {
		//场景宽高
		width:320,
		height:320,
		//渲染时是否先清空属性，如果不清空缺审则为之前状态
		clear_attr:false,
		//开启的渲染功能（通过配置渲染功能调整渲染效率）
		opens:{
			//是否渲染效果器
			effect:true,
			//是否渲染滤镜
			filter:false,
			//是否渲染前置层
			bfore_layer:false,
			//是否渲染后置层
			after_layer:false
		}
	};

	//待主动渲染的层列表
	var renderList = [];

	//开始渲染
	this.render = async function(dt){
		if(dt == null){
			console.warn("【渲染失败】没有渲染的数据结构体");
			return;
		}
		//写入配置
		lcg.copyJSON(dt.setting,self.setting,true);
		//同步资源
		await self.res.sync(dt.res);
		
		//根据配置更新场景
		app.renderer.resize(setting.width,setting.height);

		//同步场景结构与参数
		renderList = [];
		this.sync(dt.stage);

		//运行需要单独渲染的层面
		for(var i in renderList){
			if(renderList[i].render)
				await renderList[i].render();
		}
	}

	//同步场景
	this.sync = function(dt){
		stage.sync(dt);
	}

	//增加需要主动渲染的层
	this.addRender = function(layer){
		renderList.push(layer);
	}

}