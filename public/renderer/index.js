var ResMgr = require("./res-mgr/res-mgr.js");
var StageMgr = require("./stage-mgr/stage-mgr.js");

//渲染器核心
var Renderer = module.exports = function(){

	//初始化资源管理器
	this.res = new ResMgr();

	//基本逻辑由场景管理器决定
	StageMgr.apply(this,arguments);
}