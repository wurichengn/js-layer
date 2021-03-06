var lcg = require("lcg");

//单个组件节点
module.exports = 
@lcg
class LogicMapNode{
	init(info,d,main){
		var self = this;
		//info写入
		this.info = info;
		//错误信息 - 运行前清空，运行时可能产生
		this.error = null;
		//组件属性
		var attrs = this.attrs = {
			//组件类型
			key:info.key,
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
			outputs:{},
			//缓存，用于存储其他结果
			cache:{}
		};
		//写入状态
		lcg.copyJSON(d,attrs,true);

		//初始化输入类型和参数（数组类型设置为数组）
		for(var i in info.inputs){
			var ip = info.inputs[i];
			if(attrs.inputs[ip.key])
				continue;
			if(ip.array == true)
				attrs.inputs[ip.key] = [];
			else{
				//如果有默认值
				if(ip.default != null && attrs.forms[ip.key] == null)
					attrs.forms[ip.key] = ip.default;
			}

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
				if(info.run)
					re = info.run.call(self,vals);
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
			
			//发送运行完成消息
			self.sendMessage("run-end",{outputs:attrs.outputs});

			return re;
		}
	}

	//添加链接
	addLink(key,node,outkey){
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
	}

	//删除连接
	removeLink(key,uid,outkey){
		var inputs = this.attrs.inputs;
		if(lcg.isArray(inputs[key])){
			for(var i in inputs[key]){
				if(inputs[key][i].uid == uid && inputs[key][i].key == outkey)
					inputs[key].splice(i,1);
			}
		}else
			inputs[key] = null;
	}

	//删除与指定uid相关的关联
	removeUidLink(uid){
		var inputs = this.attrs.inputs;
		for(var key in inputs){
			if(inputs[key] == null)
				continue;
			if(lcg.isArray(inputs[key])){
				for(var i = inputs[key].length - 1;i >= 0;i--){
					if(inputs[key][i].uid == uid)
						inputs[key].splice(i,1);
				}
			}else
				if(inputs[key].uid == uid)
					inputs[key] = null;
		}
	}
}