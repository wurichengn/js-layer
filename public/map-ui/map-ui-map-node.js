var lcg = require("lcg");
var React = lcg.React;
var Camera = require("lcg-camera");


//单个组件面板
module.exports = 
@lcg
class UIMapNode{
	init(d){
		var node = d.node;
		var info = node.info;
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div>
				<div lid="title" class="title">{info.name}</div>
				<div class="group">
					<div lid="left" class="left"></div>
					<div lid="right" class="right"></div>
				</div>
			</div>;
		});

		//样式
		this.css({
			"width":"200px",
			"color":"#eee",
			"border-radius":"4px",
			"user-select":"none",
			"border":"1px solid #666",
			"position":"absolute",
			":hover":{
				"box-shadow":"0px 0px 3px rgba(255,255,255,0.5)"
			},
			">.title":{
				"background-color":"#444",
				"border-radius":"4px 4px 0px 0px",
				"text-align":"center",
				"height":"1.4em",
				"line-height":"1.4em",
				"overflow":"hidden",
				"border-bottom":"1px solid #555",
				"font-size":"1.6em",
				"cursor":"pointer"
			},
			">.group":{
				"background-color":"#333",
				"border-radius":"0px 0px 4px 4px",
				"position":"relative",
				">div":{
					"display":"inline-block",
					"width":"50%",
					"text-align":"left",
					"vertical-align":"top",
					"position":"relative",
					".right":{
						"text-align":"right"
					}
				}
			}
		});

		//输入输出组件记录
		this.inputModules = {};
		this.outputModules = {};

		//生成输入表
		for(var i in info.inputs){
			var dom = InputItem.new({data:info.inputs[i],key:i,...d});
			this.inputModules[info.inputs[i].key] = dom.module;
			self.ids["left"].appendChild(dom);
		}

		//生成输出表
		for(var i in info.outputs){
			var dom = OutputItem.new({data:info.outputs[i],key:i,...d});
			this.outputModules[info.outputs[i].key] = dom.module;
			self.ids["right"].appendChild(dom);
		}

		//渲染组件
		var render = function(){
			self._proxy.style["left"] = node.attr.x / 10 + "em";
			self._proxy.style["top"] = node.attr.y / 10 + "em";
		}

		//组件拖动处理
		!function(){
			var isd = false,sx,sy,ex,ey;
			//鼠标按下
			lcg.domEvent(self.ids["title"],"mousedown",function(e){
				isd = true;
				ex = e.x;
				ey = e.y;
				sx = node.attr.x;
				sy = node.attr.y;
			});

			//鼠标移动
			self.message("mousemove",function(e){
				if(!isd)
					return;
				node.attr.x = sx + (e.x - ex);
				node.attr.y = sy + (e.y - ey);
				render();
				d.main.trigger("line-draw");
			});

			//鼠标放开
			self.message("mouseup",function(e){
				if(!isd)
					return;
				isd = false;
			});
		}();
	}
}


//输入输出组件通用样式
var ItemStyle = function(d){
	var self = this;
	//样式
	this.css({
		"overflow":"hidden",
		"height":"1.8em",
		"line-height":"1.8em",
		">z":{
			"font-size":"1.4em",
			"display":"inline-block",
			"vertical-align":"middle"
		},
		">i":{
			"display":"inline-block",
			"width":"0.8em",
			"height":"0.8em",
			"border":"1px solid #fff",
			"vertical-align":"middle",
			"border-radius":"100%",
			"margin":"0px 3px",
			"cursor":"pointer",
			"opacity":0.3,
			":hover":{
				"box-shadow":"0px 0px 3px #fff",
				"opacity":1
			},
			".active":{
				"box-shadow":"0px 0px 3px 1px #ffff00",
				"opacity":1
			}
		}
	});

	//通用方法，获取接口坐标
	this.getPluginPos = function(){
		var re = d.main.dom2view(self.ids["plugin"]);
		re.x += 5;
		re.y += 5;
		return re;
	}
}


//输入参数
@lcg
class InputItem{
	init(d){
		var self = this;
		this.data = d.data;
		this.node = d.node;
		//初始化dom
		this.$dom(function(){
			return <div><i lid="plugin"></i><z>{d.data.name}</z></div>;
		});

		//继承通用样式
		this.extend(ItemStyle,d);

		//状态处理
		var render = function(){
			if(d.main.store.states.activeOutputNode && d.main.store.states.activeOutputNode.data.type == d.data.type)
				self.ids["plugin"].classList.add("active");
			else
				self.ids["plugin"].classList.remove("active");
		}

		//侦听状态变化
		this.extend(Camera.Listen,d.main.store.states,function(){
			render();
		});

		//接口鼠标放开事件
		lcg.domEvent(self.ids["plugin"],"mouseup",function(e){
			var node = d.main.store.states.activeOutputNode;
			if(node == null || node.data.type != d.data.type || node.node == d.node)
				return;
			//添加关联项
			d.node.addLink(d.data.key,node.node,node.data.key);
			d.main.trigger("line-draw");
		});
	}
}



//输出参数
@lcg
class OutputItem{
	init(d){
		var self = this;
		this.data = d.data;
		this.node = d.node;
		//初始化dom
		this.$dom(function(){
			return <div><z>{d.data.name}</z><i lid="plugin"></i></div>;
		});

		//继承通用样式
		this.extend(ItemStyle,d);

		//输出接口操作
		!function(){
			var isd = false,spos;

			lcg.domEvent(self.ids["plugin"],"mousedown",function(e){
				isd = true;
				d.main.store.states.activeOutputNode = self;
				spos = self.getPluginPos();
				d.main.store.states.activeLine = {x1:spos.x,y1:spos.y,x2:spos.x,y2:spos.y};
			});

			self.message("mousemove",function(e){
				if(!isd)
					return;
				var pos = d.main.mouse2view(e);
				d.main.store.states.activeLine = {
					x1:spos.x,
					y1:spos.y,
					x2:pos.x,
					y2:pos.y
				};
			});

			self.message("mouseup",function(){
				if(!isd)
					return;
				isd = false;
				d.main.store.states.activeLine = null;
				d.main.store.states.activeOutputNode = null;
			});
		}();
	}
}