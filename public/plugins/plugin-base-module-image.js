var Tools = require("tools");



module.exports = function(map){

	map.addModule({
		//组件名称
		name:"选择本地图片",
		//菜单
		menu:["图像","选择本地图片"],
		//组件全局唯一下标
		key:"image-file-select",
		//组件的输入 - 可以分组
		inputs:[
			{
				//输入名称
				name:"图片文件",
				//输入类型
				type:"file",
				//输入下标
				key:"file",
				//是否使用关联输入 - 默认使用
				use_link:false
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//初始化执行
		init:function(){
			//读取缓存图片数据
			if(this.attrs.cache["save-url"]){
				this.urlCache = this.attrs.cache["save-url"];
				this.attrs.forms["file"] = null;
			}
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		render:function(vals){
			var self = this;
			//根据URL载入
			var loadURL = function(url,next){
				//载入为img
				self.img = self.img || new Image();
				self.img.src = url;
				self.attrs.cache["save-url"] = url;
				//载入完成
				self.img.onload = function(){
					self.imgInfo = {
						//图片
						image:{
							//图片数据
							data:self.img,
							//图片类型
							type:"img"
						}
					}
					//载入完成
					next(self.imgInfo);
				}
			}
			//如果发生变化清空
			if(self.file != vals.file)
				self.urlCache = null;
			//如果有url缓存
			if(self.urlCache)
				return new Promise(function(next){
					loadURL(self.urlCache,next);
				});
			//如果没有变化则直接返回
			if(self.file && vals.file == self.file && self.imgInfo != null)
				return self.imgInfo;
			//如果图片为空则直接报错
			if(vals.file == null)
				throw new Error("没有选择文件");
			//如果不是图片文件则直接报错
			if(vals.file.type.substr(0,5) != "image")
				throw new Error("载入的不是图片文件");
			//文件过大则报错
			if(vals.file.size > 1024 * 1024 * 40)
				throw new Error("载入的文件大于40M载入上限");
			//写入file缓存
			self.file = vals.file;
			return new Promise(function(next,err){
				//载入dataURL
				var reader = new FileReader();
				reader.onload = function(){
					loadURL(this.result,next);
				}
				//开始载入文件
				reader.readAsDataURL(vals.file);
			});
		}
	});







	map.addModule({
		name:"文字",
		menu:["图像","文字"],
		key:"image-text",
		inputs:[
			{
				name:"文本",
				type:"string",
				key:"text",
				default:"Hello!"
			},
			{
				name:"字体大小",
				type:"float",
				key:"font_size",
				default:30,
				step:1,
				min:1,
				max:300
			},
			{
				name:"文字颜色",
				type:"color",
				key:"font_color",
				default:"#ffffff"
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//初始化
		init:function(){
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext("2d");
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		render:async function(vals){
			var ctx = this.ctx;
			var tex = vals.text;
			//设置字体  italic斜体 bold粗体
			var font = "bold " + vals.font_size + "px 微软雅黑";
			//计算宽度
			ctx.font = font;
			var box = ctx.measureText(tex);
			//根据宽度设置画布大小
			this.canvas.width = Math.floor(box.actualBoundingBoxRight + box.actualBoundingBoxLeft);
			this.canvas.height = vals.font_size + box.actualBoundingBoxDescent;
			//绘制文字
			ctx.font = font;
			ctx.fillStyle = vals.font_color;
			ctx.fillText(tex,box.actualBoundingBoxLeft,vals.font_size);
			//输出图层1
			return {
				"image":{
					data:this.canvas,
					type:"canvas",
					width:this.canvas.width,
					height:this.canvas.height
				}
			};
		}
	});
	

}