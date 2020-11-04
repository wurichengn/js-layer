var plugins = require("plugins");
var Node = require("./map-node.js");

//整个流程处理核心
module.exports = function(){
	var self = this;

	//节点表
	var nodes = this.nodes = [];

	//数据类型表
	var types = this.types = {};

	//组件表
	var modules = this.modules = {};

	//添加数据类型
	this.addType = function(type){
		if(type == null)
			return console.warn("无法添加null作为数据类型");
		if(type.key == null)
			return console.warn("添加数据类型必须有key值");
		if(types[type.key])
			return console.warn("添加数据类型失败，数据类型的key ["+type.key+"] 已存在");
		types[type.key] = type;
	}

	//添加组件
	this.addModule = function(module){
		if(module == null)
			return console.warn("无法添加null作为组件");
		if(module.key == null)
			return console.warn("添加组件必须有key值");
		if(modules[module.key])
			return console.warn("添加组件失败，组件的key ["+module.key+"] 已存在");
		modules[module.key] = module;
	}

	//引入扩展
	this.usePlugin = function(plugin){
		if(plugin == null)
			return;
		//加入数据类型扩展
		for(var i in plugin.types)
			this.addType(plugin.types[i]);
		//加入组件扩展
		for(var i in plugin.modules)
			this.addModule(plugin.modules[i]);
	}


	//添加节点
	this.addNode = function(type,d){
		if(modules[type] == null)
			return console.warn("没有找到[" + type + "]组件");
		nodes.push(new Node(modules[type],d,self));
	}


	//默认引入基础扩展
	this.usePlugin(plugins["base"]);
	//添加一个默认节点
	this.addNode("image-file-select");

}