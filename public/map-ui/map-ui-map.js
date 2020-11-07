var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;

var Node = require("./map-ui-map-node.js");
var createStore = require("./map-store.js");

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

		//初始化dom
		this.$dom(function(){
			//节点表
			var nodes = map.nodes.map(function(node){
				return <Node key={node.attr.uid} node={node} main={self}></Node>
			});
			return <div>
				<div lid="view">
					<svg><LinesPanle main={self}></LinesPanle></svg>
					<div lid="modules"></div>
				</div>
			</div>;
		});

		//样式
		this.css({
			"width":"100%",
			"height":"100%",
			"overflow":"hidden",
			"position":"relative",
			"background-color":"#222",
			"font-size":"10px",
			"background-image":"linear-gradient(#444 0%,#444 5%,rgba(0,0,0,0) 6%),linear-gradient(90deg,#444 0%,#444 5%,rgba(0,0,0,0) 6%)",
			"background-size":"20px 20px",
			">div":{
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
			}
		});

		//初始化事件
		initEvent(this._proxy);

		//组件映射表
		var modules = this.modules = {};

		//根据node添加一个UI组件
		var addNode = function(node){
			var dom = Node.new({node:node,main:self});
			modules[node.attr.uid] = dom.module;
			self.ids["modules"].appendChild(dom);
		}

		//初始化节点加入
		for(var i in map.nodes)
			addNode(map.nodes[i]);

		//关闭右键菜单
		this.on("contextmenu",function(e){
			e.preventDefault();
		});

		//根据节点获取view视图坐标
		this.dom2view = function(dom,off){
			off = off || {x:0,y:0};
			off.x += dom.offsetLeft;
			off.y += dom.offsetTop;
			if(dom.parentNode == self.ids["view"] || dom.parentNode == null)
				return off;
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
				for(var j in nodes[i].attr.inputs){
					if(lcg.isArray(nodes[i].attr.inputs[j])){
						for(var k in nodes[i].attr.inputs[j])
							lines.push(self.getLineOfLink(nodes[i],nodes[i].attr.inputs[j][k],j));
					}else if(nodes[i].attr.inputs[j] != null){
						lines.push(self.getLineOfLink(nodes[i],nodes[i].attr.inputs[j],j));
					}
				}
			}

			return <g>
				<g>{line}</g>
				<g>{lines}</g>
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
	}

	//通过两点得到一个平滑的path对象
	getLine(p1,p2,data){
		var c = {x:(p2.x + p1.x) / 2,y:(p2.y + p1.y) / 2};
		return <path data={data} oncontextmenu={this.delLink} d={"M"+p1.x+","+p1.y+" Q"+(p1.x + 40)+","+p1.y+","+c.x+","+c.y+" T"+p2.x+","+p2.y}></path>;
	}

	//根据关联信息获取一个路径
	getLineOfLink(node,link,inputkey){
		var dom1 = this.main.modules[node.attr.uid];
		var dom2 = this.main.modules[link.uid];
		var main = this.main;
		return this.getLine(
			dom2.outputModules[link.key].getPluginPos(),
			dom1.inputModules[inputkey].getPluginPos(),{node,link,inputkey,main});
	}

	//删除一个关联
	delLink(){
		var data = this.$$dom.attrs.data;
		if(data == null)
			return;
		data.node.removeLink(data.inputkey,data.link.uid,data.link.key);
		data.main.trigger("line-draw");
	}
}



//初始化事件
var initEvent = function(dom){
	lcg.domEvent(document,"click",function(e){
		lcg.triggerDom("click",e,dom);
	});

	lcg.domEvent(document,"mousedown",function(e){
		lcg.triggerDom("mousedown",e,dom);
	});

	lcg.domEvent(document,"mousemove",function(e){
		lcg.triggerDom("mousemove",e,dom);
	});

	lcg.domEvent(document,"mouseup",function(e){
		lcg.triggerDom("mouseup",e,dom);
	});
}