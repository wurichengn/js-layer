


var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;

var Map = require("map");
var UI = require("map-ui");
var Tools = require("tools");
var Plugins = require("plugins");

window.lcg = lcg;

//主面板
module.exports = 
@lcg
class Panle{
	init(saveData){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div>
				<div class="left">
					<div class="top" lid="top">
						<div lid="view">
							<canvas style="display:none;" lid="canvas"></canvas>
						</div>
					</div>
					<div class="bottom" lid="map"></div>
				</div>
				<div class="right" lid="attrs"></div>
			</div>;
		});

		//初始化上下文
		self.ids["canvas"].getContext("2d");


		//初始化一个流程图
		var map = Map.new();
		//初始化配置
		Plugins["base"](map);
		//如果有保存内容
		if(saveData){
			try{
				map.load(saveData);
			}catch(e){console.error(e);}
		}
		var uiMap = UI.map.new(map);
		uiMap.module.message("struct-change",function(){
			run();
		});
		self.ids["map"].appendChild(uiMap);
		self.ids["attrs"].appendChild(uiMap.attrsDom);

		//保存
		window.save = function(){
			var re = map.save();
			var data = JSON.stringify(re);
			console.log(data);
			//localStorage["save"] = data;
		}

		//运行一次图像处理
		var running = false;
		var needRun = false;
		var run = async function(){
			//运行中不重复运行
			if(running){
				needRun = true;
				return;
			}
			try{
				//开始运行图
				var re = await map.run();
				if(re.image){
					//渲染图像
					var re = await Tools.getImage(re.image,"canvas",{canvas:self.ids["canvas"]});
					//console.log(re);
					self.ids["canvas"].style["display"] = "";
					//设置canvas位置
					self.ids["canvas"].style["left"] = -self.ids["canvas"].width / 2 + "px";
					self.ids["canvas"].style["top"] = -self.ids["canvas"].height / 2 + "px";
				}
			}catch(e){console.error(e);}
			running = false;
			//如果需要再次运行
			if(needRun){
				needRun = false;
				run();
			}
		};

		//首次运行
		run();

		//视图状态表
		var state = new Camera({
			scale:1
		});

		//渲染视图
		var render = function(){
			//设置缩放
			self.ids["view"].style["transform"] = "scale3d("+state.scale+","+state.scale+",1)";
		}

		//状态改变时渲染视图
		state.$listen(function(){
			render();
		});

		//滚轮缩放视图
		lcg.domEvent(self.ids["top"],"mousewheel",function(e){
			if(e.deltaY < 0)
				state.scale *= 1.1;
			if(e.deltaY > 0)
				state.scale /= 1.1;
		});

		//接收文件拖入
		this.on("dragover",function(e){
			e.preventDefault();
		});

		//拖入文件处理
		this.on("drop",function(e){
			e.preventDefault();
			var files = event.dataTransfer.files;
			for(var i = 0;i < files.length;i++){
				//图像导入
				if(files[i].type.substr(0,5) == "image"){
					var pos = uiMap.module.mouse2view(e);
					map.addNode("image-file-select",{x:pos.x,y:pos.y,forms:{file:files[i]}});
				}
			}
		});

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
					"width":"calc(100% - 350px)",
					">div":{
						".top":{
							"height":"50%",
							"overflow":"hidden",
							"position":"relative",
							">div":{
								"position":"absolute",
								"left":"50%",
								"top":"50%",
								">canvas":{
									"position":"absolute",
									"border":"1px solid #777"
								}
							}
						},
						".bottom":{
							"height":"50%",
							"border-top":"1px solid #555"
						}
					}
				},
				".right":{
					"width":"350px",
					"border-left":"1px solid #555"
				}
			}
		});
	}
}