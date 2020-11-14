var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;


//属性面板
module.exports = 
@lcg
class MapAttrsPanle{
	init(main){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div>
				<div lid="panle"></div>
			</div>;
		});

		//读取types
		var types = main.map.types;

		//样式
		this.css({
			"width":"100%",
			"height":"100%",
			"background-color":"#333"
		});

		//正在处理参数的节点
		var node;
		//当聚焦节点开始发生改变
		this.extend(Camera.Listen,main.store.states,"activeNode",function(){
			node = main.store.states.activeNode;
			if(node == null)
				return;
			var info = node.node.info;
			//初始化每个表单
			for(var i in info.inputs){
				if(node.inputForms[info.inputs[i].key] != null)
					continue;
				//数组类型暂不支持参数填写
				if(info.inputs[i].array == true)
					continue;
				//获取类型
				var type = main.map.types[info.inputs[i].type];
				//没有类型跳过
				if(type == null){
					console.warn("没有找到参数类型["+info.inputs[i].type+"]");
					continue;
				}
				//类型无法选择跳过
				if(type.selector == null)
					continue;
				//初始化
				node.inputForms[info.inputs[i].key] = AttrItem.new({
					node:node,
					node_info:info,
					info:info.inputs[i],
					type_info:type,
					main:main
				});
			}

			//重置组件表
			self.ids["panle"].innerText = "";
			for(var i in node.inputForms)
				self.ids["panle"].appendChild(node.inputForms[i]);
		});
	}
}



//单个属性处理
@lcg
class AttrItem{
	init(d){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div>
				<div class="title">{d.info.name}</div>
				<div class="panle" lid="panle"></div>
			</div>;
		});

		//样式
		this.css({
			"margin":"0px 5px",
			"padding":"5px 0px",
			">.title":{
				"color":"#fff"
			},
			">.panle":{
				"padding":"2px 5px"
			}
		});

		//获取初始值
		var def = d.node.node.attrs.forms[d.info.key] || d.info.default;
		//生成面板
		var dom = d.type_info.selector(def,function(val){
			d.node.node.attrs.forms[d.info.key] = val;
			//触发结构变化消息
			d.main.trigger("struct-change");
		},d.info);

		//加入面板
		self.ids["panle"].appendChild(dom);

	}
}