var lcg = require("lcg");
var React = lcg.React;


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

			//生成输入表
			var inputs = info.inputs.map(function(input){
				return <div><i></i>{input.name}</div>;
			});

			//生成输出表
			var outputs = info.outputs.map(function(output){
				return <div>{output.name}<i></i></div>;
			});

			return <div style={"left:"+node.attr.x/10+"em;top:"+node.attr.y/10+"em;"}>
				<div lid="title" class="title">{info.name}</div>
				<div class="group">
					<div class="left">{inputs}</div>
					<div class="right">{outputs}</div>
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
			"opacity":0.1,
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
				">div":{
					"display":"inline-block",
					"width":"50%",
					"text-align":"left",
					"vertical-align":"top",
					".right":{
						"text-align":"right"
					},
					">div":{
						"overflow":"hidden",
						"height":"1.8em",
						"line-height":"1.8em",
						"font-size":"1.4em",
						">i":{
							"display":"inline-block",
							"width":"1em",
							"height":"1em",
							"border":"1px solid #fff",
							"vertical-align":"middle",
							"border-radius":"100%",
							"margin":"0px 1px"
						}
					}
				}
			}
		});


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
				self.$r();
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