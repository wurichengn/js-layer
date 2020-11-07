var lcg = require("lcg");

//单个组件节点
module.exports = function(info,d,main){
	//info写入
	this.info = info;
	//组件属性
	var attr = this.attr = {
		//组件坐标
		x:0,
		y:0,
		//组件的uid
		uid:lcg.UUID(),
		//组件的输入参数填写状态
		//如果是关联输入的话对应的数据是关联的uid
		inputs:{}
	};
	//写入状态
	lcg.copyJSON(d,attr,true);

	//初始化输入类型（数组类型设置为数组）
	for(var i in info.inputs){
		var ip = info.inputs[i];
		if(attr.inputs[ip.key])
			continue;
		if(ip.array == true)
			attr.inputs[ip.key] = [];
	}

	//初始化触发
	if(info.init)
		info.init.call(this);
}


//设置原型
module.exports.prototype = {
	//添加链接
	addLink:function(key,node,outkey){
		var inputs = this.attr.inputs;
		if(lcg.isArray(inputs[key])){
			//查重
			for(var i in inputs[key]){
				if(inputs[key][i].uid == node.attr.uid && inputs[key][i].key == outkey)
					return;
			}
			//加入
			inputs[key].push({uid:node.attr.uid,key:outkey});
		}else
			inputs[key] = {uid:node.attr.uid,key:outkey};
	},
	//删除连接
	removeLink:function(key,uid,outkey){
		var inputs = this.attr.inputs;
		if(lcg.isArray(inputs[key])){
			for(var i in inputs[key]){
				if(inputs[key][i].uid == uid && inputs[key][i].key == outkey)
					inputs[key].splice(i,1);
			}
		}else
			inputs[key] = null;
	}
};