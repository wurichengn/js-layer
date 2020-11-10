var lcg = require("lcg");
var React = lcg.React;

var Map = require("map");
var UI = require("map-ui");
var Tools = require("tools");

//主面板
@lcg
class Panle{
	init(){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div>
				<div class="left">
					<div class="top"><canvas lid="canvas"></canvas></div>
					<div class="bottom" lid="map"></div>
				</div>
				<div class="right" lid="attrs"></div>
			</div>;
		});

		//初始化上下文
		self.ids["canvas"].getContext("2d");

		//初始化一个流程图
		var map = new Map();
		var uiMap = UI.map.new(map);
		self.ids["map"].appendChild(uiMap);
		self.ids["attrs"].appendChild(uiMap.attrsDom);

		//运行一次图像处理
		window.run = async function(){
			var re = await map.run();
			if(re.image){
				Tools.getImage(re.image,"canvas-2d",{canvas:self.ids["canvas"]});
			}
		};

		//样式
		this.css({
			"height":"100%",
			"width":"100%",
			"background-color":"#444",
			">div":{
				//"opacity":0.1,
				"display":"inline-block",
				"height":"100%",
				"vertical-align":"top",
				".left":{
					"width":"calc(100% - 300px)",
					">div":{
						".top":{
							"height":"50%",
							"overflow":"hidden"
						},
						".bottom":{
							"height":"50%"
						}
					}
				},
				".right":{
					"width":"300px"
				}
			}
		});
	}
}

document.body.appendChild(Panle.new());

//document.body.appendChild(uiMap);
//document.body.style["background-color"] = "#444";