var lcg = require("lcg");
var React = lcg.React;

var Node = require("./map-ui-map-node.js");

//UI主面板
module.exports = 
@lcg
class UIMap{
	init(map){
		var self = this;
		//初始化dom
		this.$dom(function(){
			//节点表
			var nodes = map.nodes.map(function(node){
				return <Node key={node.attr.uid} node={node}></Node>
			});
			return <div>
				<div>{nodes}</div>
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
				"top":"50%"
			}
		});

		//初始化事件
		initEvent(this._proxy);
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