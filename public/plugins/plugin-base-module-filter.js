var Tools = require("tools");
var lcg = require("lcg");


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
		run:async function(vals){
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
		run:async function(vals){
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
		name:"颜色叠加",
		menu:["滤镜","颜色叠加"],
		key:"filter-color-trans",
		inputs:[
			{
				name:"图像",
				type:"image",
				key:"image"
			},
			{
				name:"颜色",
				type:"color",
				key:"color",
				default:"#ffffff"
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			var color = new lcg.easycolor(vals.color);
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:vals.image,
				uniforms:{
					uColor:[color.r/256,color.g/256,color.b/256]
				},
				fs:`precision mediump float;
				varying vec2 vUV;
				uniform sampler2D uSampler;
				uniform vec3 uColor;

				void main(void)
				{
					vec4 c = texture2D(uSampler,vUV);
					gl_FragColor = vec4(uColor,c.a);
				}`
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});








	map.addModule({
		name:"柔光叠加",
		menu:["滤镜","柔光叠加"],
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
		run:async function(vals){
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
						gl_FragColor = vec4(color.rgb,0);
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
			},
			{
				name:"阴影长度",
				type:"float",
				key:"len",
				default:200,
				min:0,
				max:500,
				step:0.1,
				input_type:"range"
			},
			{
				name:"发散角度",
				type:"float",
				key:"angleFade",
				default:15,
				min:0,
				max:150,
				step:0.1,
				input_type:"range"
			},
			{
				name:"阴影浓度",
				type:"float",
				key:"alpha",
				default:1,
				min:0,
				max:5,
				step:0.02,
				input_type:"range"
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:vals.image,
				uniforms:{
					iAngle:(vals.angle + 180) * Math.PI / 180,
					iLen:vals.len,
					iLenSamp:Math.max(1,Math.floor(vals.len / 1.5)),
					iAngleFade:vals.angleFade * Math.PI / 180,
					iFade:1,
					iAlpha:vals.alpha,
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

					bl = bl * bl;

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









	map.addModule({
		name:"内高光",
		menu:["滤镜","内高光"],
		key:"filter-inner-light",
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
			},
			{
				name:"光照强度",
				type:"float",
				key:"str",
				default:10,
				min:0,
				max:40,
				step:0.1,
				input_type:"range"
			}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			vals.angle = ((vals.angle * Math.PI / 180 / (Math.PI * 2)) % 1) * (Math.PI * 2);
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:vals.image,
				uniforms:{
					iAngle:vals.angle,
					iStr:vals.str
				},
				fs:`precision mediump float;
				varying vec2 vUV;
				uniform sampler2D uSampler;
				uniform vec2 uSize;
				//光线角度
				uniform float iAngle;
				//光线模式
				uniform float iMode;
				//光照强度
				uniform float iStr;

				//光照颜色
				vec4 light_color = vec4(1,1,1,1);

				//整圆角度
				const float DOUBLE_PI = 3.14159265358979323846264 * 2.0;
				//角度采样次数
				const float COUNT_ANGLE = 12.0;
				//深度采样次数
				const float COUNT_LENGTH = 3.0;
				//总深度
				const float LENGTH = 6.0;

				vec2 thickness;

				//获取角度差值
				float getAngleL(float a1,float a2){
					float a_max = max(a1,a2);
					float a_min = min(a1,a2);
					float val = min(abs(a_max - a_min),abs(a_max - a_min - DOUBLE_PI));
					val = -val / DOUBLE_PI * 4.0 + 1.0;
					if(val > 0.0)
						val = val * val;
					else
						val = -val * val;
					//val = max(0.0,val - 0.3) / 0.7;
					return val;
				}

				void main(void)
				{
					thickness = vec2(1.0 / uSize.x,1.0 / uSize.y);
					//当前颜色
					vec4 color = texture2D(uSampler,vUV);
					//当前采样点坐标
					vec2 samp_pos;
					//采样点颜色
					vec4 samp_color;
					//光照权重强度
					float samp_val = 0.0;
					//采样角度
					float angle;
					//采样深度
					float length;
					//深度权重
					float samp_val_len;
					//角度权重
					float samp_val_angle;

					//透明部分直接返回
					if(color.a <= 0.0){
						gl_FragColor = color;
						return;
					}

					//开始循环深度采样
					for(float j = 0.0;j < COUNT_LENGTH;j += 1.0){
						length = 1.0 - LENGTH * j / COUNT_LENGTH;
						samp_val_len = (j + 1.0) / COUNT_LENGTH;
						samp_val_len = samp_val_len * samp_val_len;
						//开始循环角度采样
						for(float i = 0.0;i < COUNT_ANGLE;i += 1.0){
							angle = DOUBLE_PI * i / COUNT_ANGLE;
							//计算角度权重
							samp_val_angle = getAngleL(angle,iAngle);
							//计算采样点坐标
							vec2 samp_pos = vec2(
								vUV.x + thickness.x * cos(angle) * length,
								vUV.y + thickness.y * sin(angle) * length
							);
							samp_color = texture2D(uSampler, samp_pos);
							samp_val += max(color.a - samp_color.a,0.0) * samp_val_len * samp_val_angle;
						}
					}

					//强度计算
					samp_val = samp_val / COUNT_ANGLE / COUNT_LENGTH * iStr;
					if(samp_val > 1.0)
						samp_val = 1.0;
					samp_val = samp_val * color.a;

					//如果光照模式是纯光照
					if(iMode == 1.0){
						gl_FragColor = light_color * samp_val;
						return;
					}

					//混合颜色
					if(samp_val >= 0.0)
						gl_FragColor = vec4(color * (1.0 - samp_val) + light_color * samp_val);
					else{
						samp_val = -samp_val / color.a * 0.5;
						gl_FragColor = vec4(color * (1.0 - samp_val) + vec4(0,0,0,1) * samp_val);
					}
				}`
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});
}