var Tools = require("tools");

module.exports = function(map){

	map.addModule({
		name:"JS代码",
		menu:["其他","JS代码"],
		key:"other-js-code-output",
		inputs:[
			{type:"code",name:"代码",key:"code",default:"return {};"}
		],
		//组件的输出
		outputs:[
			{type:"*",name:"输出",key:"out"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			if(this.lastCode != vals.code){
				this.lastCode = vals.code;
				this.func = new Function(vals.code);
			}
			var re = this.func();
			if(re instanceof Promise)
				re = await re;
			//输出图层1
			return {out:re};
		}
	});




	map.addModule({
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
		run:async function(vals){
			//初始化贴图
			if(this.texture == null)
				this.texture = Tools.gl.createTexture();
			//贴图初始化
			var image1 = await Tools.getImage(vals.image1,"texture",{texture:this.texture,gl:Tools.gl});
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:vals.image2,
				width:image1.width * 2,
				height:image1.height,
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
						vec2 uv = vec2(vUV.x * 2.0,vUV.y);

						//原图颜色
						if(uv.x < 1.0)
							gl_FragColor = texture2D(uSampler1, uv);
						else
							gl_FragColor = texture2D(uSampler, uv - vec2(1.0,0.0));
					}`
			});
			return {image:re.outputs[0]};
		}
	});






	map.addModule({
		name:"画布尺寸",
		menu:["其他","画布尺寸"],
		key:"image-screen-size",
		inputs:[
			{
				name:"图像",
				type:"image",
				key:"image"
			},
			{
				name:"宽度",
				type:"float",
				key:"width",
				default:720,
				min:1,
				max:8192,
				step:1
			},
			{
				name:"高度",
				type:"float",
				key:"height",
				default:480,
				min:1,
				max:8192,
				step:1
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			var image = vals.image;
			var wbl = image.width / vals.width;
			var hbl = image.height / vals.height;
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:vals.image,
				width:vals.width,
				height:vals.height,
				buffers:{
					position:{data:[-wbl,-hbl,  wbl,-hbl,   -wbl,hbl,   -wbl,hbl,   wbl,-hbl,   wbl,hbl],numComponents:2}
				}
			});
			return {image:re.outputs[0]};
		}
	});






	map.addModule({
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
		run:async function(vals){
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
	});

}