var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;

var Node = require("./map-ui-map-node.js");
var createStore = require("./map-store.js");
var AttrsPanle = require("./map-ui-attrs.js");
var MenuPanle = require("./map-ui-menu.js");
var CMenu = require("./map-ui-contextmenu.js");

//UI主面板
module.exports = 
@lcg
class UIMap{
	init(map){
		var self = this;

		//全局状态机初始化
		var store = this.store = new Camera(createStore(),true);
		//图表
		this.map = map;

		//输出组件表
		this.outputModules = {};

		//组件映射表
		var modules = this.modules = {};

		//初始化dom
		this.$dom(function(){
			return <div>
				<MenuPanle main={self}></MenuPanle>
				<div class="bottom" lid="bottom">
					<div class="view" lid="view">
						<svg lid="svg"></svg>
						<div lid="modules"></div>
					</div>
					<div class="out">
						<OutputPanle main={self}></OutputPanle>
					</div>
				</div>
			</div>;
		});

		//初始化属性面板
		this.attrsDom = this._proxy.attrsDom = AttrsPanle.new(this);

		//样式
		this.css({
			"width":"100%",
			"height":"100%",
			"user-select":"none",
			">.bottom":{
				"height":"calc(100% - 35px)",
				"overflow":"hidden",
				"position":"relative",
				"font-size":"10px",
				"background-color":"#222",
				"background-image":"linear-gradient(#444 0%,#444 5%,rgba(0,0,0,0) 6%),linear-gradient(90deg,#444 0%,#444 5%,rgba(0,0,0,0) 6%)",
				"background-size":"20px 20px",
				">.view":{
					"position":"absolute",
					"left":"50%",
					"top":"50%",
					">svg":{
						"width":"8000px",
						"height":"8000px",
						"position":"absolute",
						"left":"-4000px",
						"top":"-4000px",
						">g":{
							"transform":"translate(4000px,4000px)",
							" path":{
								"stroke":"#fff",
								"fill":"transparent",
								"cursor":"pointer"
							}
						}
					},
					">div":{
						"position":"absolute",
						"left":"0px",
						"top":"0px"
					}
				},
				">.out":{
					"position":"absolute",
					"height":"100%",
					"width":"100px",
					"right":"0px",
					"top":"0px",
					"background-color":"#333",
					"border-left":"1px solid #555"
				}
			}
		});

		//初始化完成后加入面板
		this.message("module-ready",function(){
			//初始化线条绘制
			self.ids["svg"].appendChild(LinesPanle.new({main:self}));
		});

		//初始化事件
		initEvent(this._proxy);

		//根据node添加一个UI组件
		var addNode = function(node){
			var dom = Node.new({node:node,main:self});
			modules[node.attrs.uid] = dom.module;
			self.ids["modules"].appendChild(dom);
		}

		//根据node删除一个UI组件
		var removeNode = function(node){
			modules[node.attrs.uid].remove();
			delete modules[node.attrs.uid];
		}

		//初始化节点加入
		for(var i in map.nodes)
			addNode(map.nodes[i]);

		//节点发生变化处理
		map.nodes.$listen(function(e){
			//添加节点
			if(e.action == "create"){
				for(var i in e.value)
					addNode(e.value[i]);
			}
			//删除节点
			if(e.action == "delete"){
				for(var i in e.deletes)
					removeNode(e.deletes[i]);
			}
			self.trigger("line-draw");
		});

		//关闭右键菜单
		this.on("contextmenu",function(e){
			e.preventDefault();
		});

		//滚轮缩放
		lcg.domEvent(self.ids["view"],"mousewheel",function(e){
			var scale = store.states.scale;
			if(e.deltaY < 0)
				scale += 1;
			if(e.deltaY > 0)
				scale -= 1;
			if(scale < 6)
				scale = 6;
			if(scale > 20)
				scale = 20;
			self.ids["bottom"].style["font-size"] = scale + "px";
			store.states.scale = scale;
		});

		//渲染视图坐标
		var render = function(){
			self.ids["view"].style["margin-left"] = map.attrs.x + "px";
			self.ids["view"].style["margin-top"] = map.attrs.y + "px";
		}
		render();


		//初始化组件菜单
		var createModuleMenu;
		var menuPos = {x:0,y:0};
		!function(){
			var mds = map.modules;
			var menu = {};
			//添加一个菜单
			var addOne = function(md){
				var dom = menu;
				for(var i = 0;i < md.menu.length - 1;i++){
					dom[md.menu[i]] = dom[md.menu[i]] || {};
					dom = dom[md.menu[i]];
				}
				dom[md.menu[i]] = function(){
					map.addNode(md.key,{x:menuPos.x,y:menuPos.y});
				}
			}
			//循环加入菜单
			for(var i in mds)
				if(mds[i].menu)
					addOne(mds[i]);
			createModuleMenu = menu;
		}();


		//右键拖动
		!function(){
			var isd = false;
			var ism = false;
			var sx,sy,mx,my;
			self.on("mousedown",function(e){
				if(e.button != 2)
					return;
				if(e.target != self.ids["bottom"] && e.target != self.ids["svg"])
					return;
				ism = false;
				isd = true;
				sx = map.attrs.x;
				sy = map.attrs.y;
				mx = e.x;
				my = e.y;
			});

			self.message("mousemove",function(e){
				if(!isd)
					return;
				ism = true;
				map.attrs.x = sx + e.x - mx;
				map.attrs.y = sy + e.y - my;
				render();
				self.trigger("line-draw");
			});

			self.message("mouseup",function(e){
				if(!isd)
					return;
				isd = false;
				//如果没有移动则展开右键菜单
				if(!ism){
					menuPos = self.mouse2view(e);
					CMenu.new(e,{
						"创建节点":createModuleMenu
					});
				}
			});
		}();
		

		//根据节点获取view视图坐标
		this.dom2view = function(dom,off){
			off = off || {x:0,y:0};
			off.x += dom.offsetLeft;
			off.y += dom.offsetTop;
			if(dom.parentNode == self.ids["bottom"] || dom.parentNode == null){
				off.x -= self.ids["view"].offsetLeft;
				off.y -= self.ids["view"].offsetTop;
				return off;
			}
			return self.dom2view(dom.parentNode,off);
		}

		//根据鼠标(屏幕)坐标获取视图坐标
		this.mouse2view = function(pos){
			var box = self.ids["view"].getBoundingClientRect();
			return {
				x:pos.x - box.x,
				y:pos.y - box.y
			};
		}

		//触发消息
		this.trigger = function(key,e){
			lcg.triggerDom(key,e,self._proxy);
		}
	}
}



//线条面板
@lcg
class LinesPanle{
	init(d){
		var self = this;
		this.main = d.main;
		//关联线条组
		var lines = [];
		//组件节点表
		var nodes = d.main.map.nodes;

		//初始化dom
		this.$dom(function(){
			//临时线条渲染
			var line;
			if(d.main.store.states.activeLine != null){
				var ld = d.main.store.states.activeLine;
				line = self.getLine({x:ld.x1,y:ld.y1},{x:ld.x2,y:ld.y2});
			}

			//关联线条渲染
			lines = [];
			for(var i in nodes){
				for(var j in nodes[i].attrs.inputs){
					if(lcg.isArray(nodes[i].attrs.inputs[j])){
						for(var k in nodes[i].attrs.inputs[j])
							lines.push(self.getLineOfLink(nodes[i],nodes[i].attrs.inputs[j][k],j));
					}else if(nodes[i].attrs.inputs[j] != null){
						lines.push(self.getLineOfLink(nodes[i],nodes[i].attrs.inputs[j],j));
					}
				}
			}

			//全局输出连线
			g_lines = [];
			for(var i in d.main.map.attrs.outputs){
				if(d.main.map.attrs.outputs[i] == null)
					continue;
				g_lines.push(self.getLineOfLinkGlobal(d.main.map.attrs.outputs[i],i));
			}

			return <g>
				<g>{line}</g>
				<g>{lines}</g>
				<g>{g_lines}</g>
			</g>;
		});

		//侦听状态变化重渲染
		this.extend(Camera.Listen,d.main.store.states,function(){
			self.$r();
		});

		//侦听重新绘制消息
		this.message("line-draw",function(){
			self.$r();
		});

		//布局改动重绘
		this.message("resize",function(){
			self.$r();
		});

		setTimeout(function(){
			self.$r();
		});
	}

	//通过两点得到一个平滑的path对象
	getLine(p1,p2,data){
		var c = {x:(p2.x + p1.x) / 2,y:(p2.y + p1.y) / 2};
		return <path data={data} oncontextmenu={this.delLink} d={"M"+p1.x+","+p1.y+" Q"+(p1.x + 40)+","+p1.y+","+c.x+","+c.y+" T"+p2.x+","+p2.y}></path>;
	}

	//根据关联信息获取一个路径
	getLineOfLink(node,link,inputkey){
		var dom1 = this.main.modules[node.attrs.uid];
		var dom2 = this.main.modules[link.uid];
		var main = this.main;
		return this.getLine(
			dom2.outputModules[link.key].getPluginPos(),
			dom1.inputModules[inputkey].getPluginPos(),{node,link,inputkey,main});
	}

	//根据关联信息获取一个全局输出路径
	getLineOfLinkGlobal(link,inputkey){
		var output = this.main.modules[link.uid].outputModules[link.key].getPluginPos();
		var input = this.main.outputModules[inputkey].getPluginPos();
		return this.getLine(output,input,{node:this.main,main:this.main,inputkey,link});
	}

	//删除一个关联
	delLink(){
		var data = this.$$dom.attrs.data;
		if(data == null)
			return;
		if(data.node == data.main){
			data.main.map.attrs.outputs[data.inputkey] = null;
		}else{
			data.node.removeLink(data.inputkey,data.link.uid,data.link.key);
		}
		data.main.trigger("line-draw");
		//触发结构变化消息
		data.main.trigger("struct-change");
	}
}


//全局输出面板
@lcg
class OutputPanle{
	init(d){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div></div>;
		});

		for(var i in d.main.map.outputs){
			var output = d.main.map.outputs[i];
			var dom = OutputItem.new({
				data:output,
				main:d.main
			});
			self._proxy.appendChild(dom);
			d.main.outputModules[output.key] = dom.module;
		}

		//样式
		this.css({
			"height":"100%",
			"width":"100%"
		});
	}
}


//全局输出参数
@lcg
class OutputItem{
	init(d){
		var self = this;
		this.data = d.data;
		this.node = d.node;
		//初始化dom
		this.$dom(function(){
			return <div><i lid="plugin"></i><z>{d.data.name}</z></div>;
		});

		//继承通用样式
		this.extend(Node.ItemStyle,d);

		//状态处理
		var render = function(){
			if(d.main.store.states.activeOutputNode && (d.main.store.states.activeOutputNode.data.type == d.data.type || d.data.type == "*"))
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
			if(node == null || (node.data.type != d.data.type && d.data.type != "*"))
				return;
			//添加关联项
			d.main.map.attrs.outputs[d.data.key] = {uid:node.node.attrs.uid,key:node.data.key};
			//触发结构变化消息
			d.main.trigger("struct-change");
		});
	}
}



//初始化事件
var initEventEnd = false;
var initEvent = function(dom){
	if(initEventEnd)
		return;
	initEventEnd = true;
	lcg.domEvent(document,"click",function(e){
		lcg.triggerDom("click",e);
	});

	lcg.domEvent(document,"mousedown",function(e){
		lcg.triggerDom("mousedown",e);
	});

	lcg.domEvent(document,"mousemove",function(e){
		lcg.triggerDom("mousemove",e);
	});

	lcg.domEvent(document,"mouseup",function(e){
		lcg.triggerDom("mouseup",e);
	});

	lcg.domEvent(window,"resize",function(e){
		lcg.triggerDom("resize",e);
	});
}