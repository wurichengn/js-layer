var lcg = require("lcg");
var React = lcg.react;

var Tools = require("tools");

module.exports = {
	//扩展数据类型
	types:[
		//一个数据类型
		{
			//数据类型名
			name:"图像",
			//类型全局唯一的下标
			key:"image"
		},
		{
			name:"文件",
			key:"file",
			//类型选择器，一个函数返回一个html节点    如果没有这个属性则只能通过节点的形式输入
			selector:function(value,onchange){
				return <input type="file" onchange={function(e){
					//如果
					if(this.files[0] != null)
						onchange(this.files[0]);
				}}/>
			}
		}
	],
	//扩展组件
	modules:[
		//一个组件的内容
		{
			//组件名称
			name:"选择本地图片",
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
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:function(vals){
				var self = this;
				//如果没有变化则直接返回
				if(self.file && vals.file == self.file)
					return self.imgInfo;
				//写入file缓存
				self.file = vals.file;
				return new Promise(function(next,err){
					//载入dataURL
					var reader = new FileReader();
					reader.onload = function(){
						//载入为img
						self.img = self.img || new Image();
						self.img.src = this.result;
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
					//开始载入文件
					reader.readAsDataURL(vals.file);
				});
			}
		},
		{
			name:"图层",
			key:"image-layer",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"images",
					//是否是数组输入
					array:true
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"图像",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:function(){}
		},
		{
			name:"灰度",
			key:"filter-gray",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"image"
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"图像",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:async function(vals){
				//使用简易滤镜逻辑
				var re = await Tools.easyFilter(this,{
					image:vals.image,
					fs:`precision mediump float;
						varying vec2 vUV;

						uniform sampler2D uSampler;
						uniform vec2 uSize;

						void main(void){
							vec4 color = texture2D(uSampler, vUV);
							float c = (color.r + color.g + color.b) / 3.0;
							gl_FragColor = vec4(c,c,c,color.a);
						}`
				});
				//输出图层1
				return {image:re.outputs[0]};
			}
		}
	]
}