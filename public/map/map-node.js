var lcg = require("lcg");

//单个组件节点
module.exports = function(info,d,main){
	var self = this;
	//info写入
	this.info = info;
	//错误信息 - 运行前清空，运行时可能产生
	this.error = null;
	//组件属性
	var attrs = this.attrs = {
		//组件坐标
		x:0,
		y:0,
		//组件的uid
		uid:lcg.UUID(),
		//组件的关联输入状态
		//如果是关联输入的话对应的数据是关联的uid
		inputs:{},
		//表单输入值存储
		forms:{},
		//组件运行优先级 - 运行时产生
		level:0,
		//运行输出结果 - 运行后产生
		outputs:{}
	};
	//写入状态
	lcg.copyJSON(d,attrs,true);

	//初始化输入类型（数组类型设置为数组）
	for(var i in info.inputs){
		var ip = info.inputs[i];
		if(attrs.inputs[ip.key])
			continue;
		if(ip.array == true)
			attrs.inputs[ip.key] = [];
	}

	//初始化触发
	if(info.init)
		info.init.call(this);

	//运行节点
	this.run = async function(hx){
		//参数处理
		var vals = {};
		//加入参数面板数据
		for(var i in attrs.forms)
			vals[i] = attrs.forms[i];
		//加入链接内容
		for(var i in attrs.inputs){
			var input = attrs.inputs[i];
			//空内容跳过
			if(input == null)
				continue;
			//多输入
			if(lcg.isArray(input)){
				vals[i] = [];
				for(var j in input){
					//读取
					vals[i].push(hx[input[j].uid].attrs.outputs[input[j].key]);
				}
			}else
				//单输入
				vals[i] = hx[input.uid].attrs.outputs[input.key];
		}

		//运行组件，获取输出
		var re = {};
		try{
			if(info.render)
				re = info.render.call(self,vals);
			//异步则等待
			if(re instanceof Promise)
				re = await re;
			re = re || {};
		}catch(e){
			//设置并抛出错误
			self.error = e;
			throw e;
		}

		//写入输出
		for(var i in info.outputs)
			attrs.outputs[info.outputs[i].key] = re[info.outputs[i].key];

		return re;
	}
}


//设置原型
module.exports.prototype = {
	//添加链接
	addLink:function(key,node,outkey){
		var inputs = this.attrs.inputs;
		if(lcg.isArray(inputs[key])){
			//查重
			for(var i in inputs[key]){
				if(inputs[key][i].uid == node.attrs.uid && inputs[key][i].key == outkey)
					return;
			}
			//加入
			inputs[key].push({uid:node.attrs.uid,key:outkey});
		}else
			inputs[key] = {uid:node.attrs.uid,key:outkey};
	},
	//删除连接
	removeLink:function(key,uid,outkey){
		var inputs = this.attrs.inputs;
		if(lcg.isArray(inputs[key])){
			for(var i in inputs[key]){
				if(inputs[key][i].uid == uid && inputs[key][i].key == outkey)
					inputs[key].splice(i,1);
			}
		}else
			inputs[key] = null;
	}
};