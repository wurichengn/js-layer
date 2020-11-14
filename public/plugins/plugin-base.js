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
		},
		{
			name:"浮点数",
			key:"float",
			selector:function(value,onchange,cfg){
				//数值输入框
				var re = <input value={value} style="width:100%;" type={cfg.input_type || "number"} min={cfg.min} max={cfg.max} step={cfg.step} onchange={function(e){
					//数值化
					var val = Number(this.value);
					//NaN处理
					if(val.toString() == "NaN")
						val = 0;
					//范围限制
					if(cfg.min != null && val < cfg.min)
						val = cfg.min;
					if(cfg.max != null && val > cfg.max)
						val = cfg.max;
					//反向写入
					this.value = val;
					onchange(Number(val));
				}}/>;
				return re;
			}
		},
		{
			name:"颜色",
			key:"color",
			selector:function(value,onchange,cfg){
				//浏览器自带颜色选择器
				return <input value={value} type="color" onchange={function(e){
					onchange(this.value);
				}}/>;
			},
			//输出界面组件扩展
			outputUIExpand:function(md){
				//展示颜色计算结果用dom
				var dom = <z style="display:inline-block;vertical-align:inherit;width:0.8em;height:0.8em;border-radius:2px;background-color:#000;margin-left:4px;box-shadow:0px 0px 2px rgba(255,255,255,0.5);"></z>;
				md.ids["after"].appendChild(dom);
				//运行结束
				md.node.message("run-end",function(dt){
					var color = dt.outputs[md.data.key];
					dom.style["background-color"] = color;
				});
			}
		}
	],
	//扩展组件
	modules:[
		//一个组件的内容
		{
			//组件名称
			name:"选择本地图片",
			//菜单
			menu:["导入资源","选择本地图片"],
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
			name:"图像对比",
			menu:["其他","图像对比"],
			key:"image-comparison",
			inputs:[
				{
					name:"图像1",
					type:"image",
					key:"image1"
				},
				{
					name:"图像2",
					type:"image",
					key:"image2"
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"对比结果",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:async function(vals){
				//初始化贴图
				if(this.texture == null)
					this.texture = Tools.gl.createTexture();
				//贴图初始化
				var image1 = await Tools.getImage(vals.image1,"texture",{texture:this.texture,gl:Tools.gl});
				//使用简易滤镜逻辑
				var re = await Tools.easyFilter(this,{
					image:vals.image2,
					width:image1.width,
					height:image1.height * 2,
					uniforms:{
						weight:vals.weight,
						uSampler1:image1.data
					},
					fs:`precision mediump float;
						varying vec2 vUV;

						uniform sampler2D uSampler1;
						uniform sampler2D uSampler;
						uniform vec2 uSize;

						void main(void){
							//计算uv
							vec2 uv = vec2(vUV.x,vUV.y * 2.0);

							//原图颜色
							if(uv.y < 1.0)
								gl_FragColor = texture2D(uSampler1, uv);
							else
								gl_FragColor = texture2D(uSampler, uv - vec2(0.0,1.0));
						}`
				});
				return {image:re.outputs[0]};
			}
		},
		{
			name:"饱和度",
			menu:["滤镜","饱和度"],
			key:"filter-gray",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"image"
				},
				{
					name:"饱和度",
					type:"float",
					key:"weight",
					//数值参数
					input_type:"range",
					default:1,
					min:0,
					max:2,
					step:0.01
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
					uniforms:{
						weight:vals.weight
					},
					fs:`precision mediump float;
						varying vec2 vUV;

						uniform sampler2D uSampler;
						uniform vec2 uSize;
						uniform float weight;

						void main(void){
							//原图颜色
							vec4 color = texture2D(uSampler, vUV);
							//rgb平均值
							float c = (color.r + color.g + color.b) / 3.0;
							gl_FragColor = vec4(
								(color.r - c) * weight + c,
								(color.g - c) * weight + c,
								(color.b - c) * weight + c,
								color.a
							);
						}`
				});
				//输出图层1
				return {image:re.outputs[0]};
			}
		},{
			name:"渐变映射",
			menu:["滤镜","渐变映射"],
			key:"filter-gradient-mapping",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"image"
				},
				{
					name:"暗色",
					type:"color",
					key:"color_d",
					default:"#470000"
				},
				{
					name:"亮色",
					type:"color",
					key:"color_l",
					default:"#ffe5e5"
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"图像",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:async function(vals){
				var color_d = new lcg.easycolor(vals.color_d);
				var color_l = new lcg.easycolor(vals.color_l);
				//使用简易滤镜逻辑
				var re = await Tools.easyFilter(this,{
					image:vals.image,
					uniforms:{
						color_d:[color_d.r/256,color_d.g/256,color_d.b/256],
						color_l:[color_l.r/256,color_l.g/256,color_l.b/256]
					},
					fs:`precision mediump float;
						varying vec2 vUV;

						uniform sampler2D uSampler;
						uniform vec2 uSize;
						uniform vec3 color_d;
						uniform vec3 color_l;

						void main(void){
							//原图颜色
							vec4 color = texture2D(uSampler, vUV);
							//rgb平均值
							float c = (color.r + color.g + color.b) / 3.0;
							gl_FragColor = vec4((color_l - color_d) * c + color_d,color.a);
						}`
				});
				//输出图层1
				return {image:re.outputs[0]};
			}
		},{
			name:"主色提取",
			menu:["其他","主色提取"],
			key:"other-color-thief",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"image"
				}
			],
			//组件的输出
			outputs:[
				{type:"color",name:"主色",key:"color-main"},
				{type:"color",name:"辅色1",key:"color1"},
				{type:"color",name:"辅色2",key:"color2"},
				{type:"color",name:"辅色3",key:"color3"},
				{type:"color",name:"辅色4",key:"color4"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:async function(vals){
				var image = await Tools.getImage(vals.image,"img");
				var colorThief = new ColorThief();
				var re = new lcg.easycolor(colorThief.getColor(image.data)).toString();
				var rep = colorThief.getPalette(image.data);
				for(var i in rep){
					rep[i] = lcg.easycolor(rep[i]).toString();
				}
				//输出图层1
				return {
					"color-main":re,
					"color1":rep[1],
					"color2":rep[2],
					"color3":rep[3],
					"color4":rep[4]
				};
			}
		}
	]
}