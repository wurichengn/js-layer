var Node = require("./map-node.js");
var lcg = require("lcg");
var Camera = require("lcg-camera");

//整个流程处理核心
module.exports = 
@lcg
class LogicMap{
	init(){
		var self = this;

		//节点表
		var nodes = this.nodes = new Camera([]);

		//数据类型表
		var types = this.types = {};

		//组件表
		var modules = this.modules = {};

		//全局输出表
		var outputs = this.outputs = [
			{
				key:"image",
				type:"image",
				name:"屏幕"
			}
		];

		//全局属性
		var attrs = this.attrs = {
			//全局视图坐标
			x:0,
			y:0,
			//全局输出结果
			outputs:{}
		};

		//添加数据类型
		this.addType = function(type){
			if(type == null)
				return console.warn("无法添加null作为数据类型");
			if(type.key == null)
				return console.warn("添加数据类型必须有key值");
			if(types[type.key])
				return console.warn("添加数据类型失败，数据类型的key ["+type.key+"] 已存在");
			types[type.key] = type;
			//如果类型可以创建变量组件
			if(type.selector)
				self.addModule(typeModule(type));
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
			nodes.push(Node.new(modules[type],d,self));
		}

		//删除节点
		this.removeNode = function(node){
			//删除关联
			var uid = node.attrs.uid;
			for(var i in nodes){
				if(nodes[i] == node)
					continue;
				nodes[i].removeUidLink(uid);
			}
			//全局关联
			for(var i in attrs.outputs){
				if(attrs.outputs[i].uid == uid)
					attrs.outputs[i] = null;
			}
			//删除节点
			nodes.remove(node);
		}


		//保存拓扑图
		this.save = function(){
			var re = {
				attrs:attrs
			};
			var nds = re.nodes = [];
			for(var i in nodes){
				nds.push(nodes[i].attrs);
			}
			return re;
		}


		//载入拓扑图
		this.load = function(data){
			//写入图属性
			lcg.copyJSON(data.attrs,attrs,true);
			//初始化节点
			for(var i in data.nodes){
				self.addNode(data.nodes[i].key,data.nodes[i]);
			}
		}


		//运行拓扑图  异步
		this.run = async function(){
			//生成组件哈希表
			var hx = {};
			for(var i in nodes){
				//设置运行前级别
				nodes[i].attrs.level = -1;
				//写入哈希
				hx[nodes[i].attrs.uid] = nodes[i];
				//重置错误状态
				nodes[i].error = null;
			}
			//设置优先级
			var ns = setLevels(nodes,attrs.outputs,hx);
			//按顺序运行组件
			for(var i in ns)
				await ns[i].run(hx);
			//整理全局输出
			var re = {};
			for(var i in attrs.outputs){
				if(attrs.outputs[i] == null)
					continue;
				if(hx[attrs.outputs[i].uid])
					re[i] = hx[attrs.outputs[i].uid].attrs.outputs[attrs.outputs[i].key];
			}
			//输出全局结果
			return re;
		}

	}
}





//遍历节点的运行优先级
var setLevels = function(nodes,outputs,hx){
	//计算一个节点的优先级
	var setOne = function(node,level){
		if(level > node.attrs.level)
			node.attrs.level = level;
		for(var i in node.attrs.inputs){
			var inputs = node.attrs.inputs[i];
			if(inputs == null)
				continue;
			if(lcg.isArray(inputs)){
				for(var j in inputs){
					if(inputs[j].uid && hx[inputs[j].uid])
						setOne(hx[inputs[j].uid],level + 1);
				}
			}else{
				if(inputs.uid && hx[inputs.uid])
					setOne(hx[inputs.uid],level + 1);
			}
		}
	}

	//循环计算每一个输出
	for(var i in outputs){
		if(outputs[i] == null || hx[outputs[i].uid] == null)
			continue;
		setOne(hx[outputs[i].uid],0);
	}

	//返回所有level大于-1的节点
	var re = [];
	for(var i in nodes){
		if(nodes[i].attrs.level > -1)
			re.push(nodes[i]);
	}

	//level排序
	re.sort(function(a,b){
		return b.attrs.level - a.attrs.level;
	});

	return re;
}






//创建变量组件
var typeModule = function(type){
	return {
		name:"变量-" + type.name,
		menu:["变量",type.name],
		key:"$$type-vars-" + type.key,
		inputs:[
			{type:type.key,name:"值",key:"value",use_link:false}
		],
		//组件的输出
		outputs:[
			{type:type.key,name:"输出",key:"value"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			//输出图层1
			return {value:vals.value};
		}
	};
}