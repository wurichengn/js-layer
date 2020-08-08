var lcg = require("lcg");
var Item = require("./res-item.js");


//资源管理器
module.exports = function(){

	//资源表
	var ress = {};

	//通过uid删除资源
	this.remove = function(uid){
		if(ress[uid])
			ress[uid].destroy();
		delete ress[uid];
	}

	//通过数据同步资源
	this.sync = async function(data){
		//克隆对象
		data = lcg.cloneJSON(data);
		var uses = {};
		//循环处理每一个资源
		for(var i in data){
			uses[data[i].uid] = true;
			//未存在资源则初始化
			if(!ress[data[i].uid]){
				var item = new Item();
				ress[data[i].uid] = item;
			}
			//更新资源
			await ress[data[i].uid].sync(data[i]);
		}
		//释放不需要的资源
		for(var i in ress){
			if(uses[i] == null)
				this.remove(i);
		}
	}

	//通过uid获取资源
	this.get = function(uid){
		if(ress[uid])
			return ress[uid].get();
	}

}