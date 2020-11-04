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

	//初始化
	if(info.init)
		info.init.call(this);
}