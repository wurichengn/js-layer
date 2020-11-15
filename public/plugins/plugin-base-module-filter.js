var Tools = require("tools");


module.exports = function(map){


	map.addModule({
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
	});










	map.addModule({
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
	});








	map.addModule({
		name:"叠加渐变",
		menu:["滤镜","叠加渐变"],
		key:"filter-line-color",
		inputs:[
			{
				name:"图像",
				type:"image",
				key:"image"
			},
			{
				name:"角度",
				type:"float",
				key:"angle",
				default:0,
				min:0,
				max:360,
				step:0.1,
				input_type:"range"
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
					iAngle:vals.angle * Math.PI / 180
				},
				fs:`precision mediump float;
				varying vec2 vUV;
				uniform sampler2D uSampler;
				//光线角度
				uniform float iAngle;

				void main(void)
				{
					vec4 color = texture2D(uSampler,vUV);
					if(color.a <= 0.0){
						gl_FragColor = vec4(0,0,0,0);
						return;
					}
					//计算渐变比例
					vec2 angle = vec2(cos(iAngle),sin(iAngle));
					float v = 0.5 - dot(angle,vUV - 0.5);
					v = max(0.0,min(1.0,v * 0.7));

					//目标混合颜色rgb
					vec3 end;

					//计算颜色
					if(v > 0.5){
						end = vec3(
							color.r + (2.0 * v - 1.0) * (color.r - color.r * color.r),
							color.g + (2.0 * v - 1.0) * (color.g - color.g * color.g),
							color.b + (2.0 * v - 1.0) * (color.b - color.b * color.b)
						);
					}else{
						end = vec3(
							color.r + (2.0 * v - 1.0) * (sqrt(color.r) - color.r),
							color.g + (2.0 * v - 1.0) * (sqrt(color.g) - color.g),
							color.b + (2.0 * v - 1.0) * (sqrt(color.b) - color.b)
						);
					}

					gl_FragColor = vec4(end,color.a);
				}`
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});








	map.addModule({
		name:"射线投影",
		menu:["滤镜","射线投影"],
		key:"filter-light-shadow",
		inputs:[
			{
				name:"图像",
				type:"image",
				key:"image"
			},
			{
				name:"角度",
				type:"float",
				key:"angle",
				default:0,
				min:0,
				max:360,
				step:0.1,
				input_type:"range"
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
					iAngle:vals.angle * Math.PI / 180,
					iLen:20,
					iLenSamp:20,
					iAngleFade:15 * Math.PI / 180,
					iFade:0.8,
					iAlpha:1,
					iInner:0
				},
				fs:`precision mediump float;
				varying vec2 vUV;
				uniform sampler2D uSampler;
				uniform vec2 uSize;
				//光线角度
				uniform float iAngle;
				//阴影距离
				uniform float iLen;
				//深度采样次数
				uniform float iLenSamp;
				//发散角度
				uniform float iAngleFade;
				//减淡深度
				uniform float iFade;
				//阴影浓度
				uniform float iAlpha;
				//是否是内阴影
				uniform float iInner;

				//π
				const float PI = 3.14159265358979323846264;
				//角度采样次数
				const float COUNT_ANGLE = 24.0;

				//像素宽度
				vec2 thickness;
				//命中值
				float mitValue = 1.0;

				//是否命中像素
				bool mitPix(vec2 p){
					vec4 color = texture2D(uSampler,p);
					if(color.a == mitValue)
						return true;
					return false;
				}


				//投射一个角度
				vec2 rayTestOne(float angle){
					thickness = vec2(1.0 / uSize.x,1.0 / uSize.y);
					//当前采样点
					vec2 p = vUV;
					//当前命中权重
					float weight = 0.0;
					
					//计算步长
					vec2 step = vec2(cos(angle) * thickness.x,sin(angle) * thickness.y) * iLen / iLenSamp;

					//循环采样
					float len = 0.0;
					for(float i = 1.0;i <= 500.0;i++){
						if(i > iLenSamp)
							break;
						len++;
						//步进
						p += step;
						if(mitPix(p))
							weight += 1.0;
						//如果权足够则停止采样
						if(weight >= 1.0)
							break;
					}

					//距离比例
					float bl = len / iLenSamp;
					if(iFade <= 0.0)
						bl = 1.0;
					else
						bl = min(1.0,(1.0 - bl) / iFade);

					return vec2(weight * bl,len * iLen / iLenSamp);
				}

				void main(void)
				{
					//内阴影逻辑转换
					if(iInner > 0.0)
						mitValue = 0.0;

					//如果在内部则不处理
					if(mitPix(vUV)){
						gl_FragColor = vec4(0,0,0,0);
						return;
					}

					//当前点权重
					float weight = 0.0;

					//无角度则单采样
					if(iAngleFade == 0.0)
						weight = rayTestOne(iAngle).x;
					else{
						//当前角度
						float angle;
						float sangle = iAngle - iAngleFade / 2.0;
						float cangle = iAngleFade / COUNT_ANGLE;
						//有角度则多采样
						for(float i = 0.0;i <= COUNT_ANGLE;i++){
							angle = sangle + cangle * i;
							weight += rayTestOne(angle).x / COUNT_ANGLE * (1.0 - abs(i - COUNT_ANGLE / 2.0) / COUNT_ANGLE);
							if(weight >= 1.0)
								break;
						}
					}

					//内阴影边缘处理
					if(iInner > 0.0)
						weight *= texture2D(uSampler,vUV).a;
					else
						weight *= 1.0 - texture2D(uSampler,vUV).a;

					//着色
					gl_FragColor = vec4(vec3(0,0,0),weight * iAlpha);
				}`
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});
}