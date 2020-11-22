var P = require("./p-main.js");
var Tools = require("tools");
var gp = require("./p-glsl.js");

module.exports = function(map){

	map.addType({
		//数据类型名
		name:"粒子处理器",
		//类型全局唯一的下标
		key:"particle-core"
	});



	map.addModule({
		//组件名称
		name:"创建粒子处理器",
		//菜单
		menu:["粒子","创建粒子处理器"],
		//组件全局唯一下标
		key:"particle-core-create",
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//初始化执行
		init:function(){
			this.core = new P({
				canvas:Tools.canvas,
				gl:Tools.gl
			});
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			return {
				core:this.core
			}
		}
	});


	map.addModule({
		//组件名称
		name:"粒子发射器",
		//菜单
		menu:["粒子","粒子发射器"],
		//组件全局唯一下标
		key:"particle-send",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector({
				fs:`
				#include pf-main;
				void run(){
					//没有生命线则初始化
					if(p.life == 0.0){
						//随机坐标
						p.position.x = rand() * 2.0 - 1.0;
						p.position.y = rand() * 2.0 - 1.0;
						p.position.z = rand() * 2.0 - 1.0;
						//随机速度
						p.velocity.x = (rand() * 2.0 - 1.0);
						p.velocity.y = (rand() * 2.0 - 1.0);
						p.velocity.z = (rand() * 2.0 - 1.0);
						//写入生命线
						p.life = 1.0;
						//随机权重
						p.weight = rand();
					}
				}
				`
			});
			this.effect.run();
			return vals;
		}
	});




	map.addModule({
		//组件名称
		name:"重力/速度处理",
		//菜单
		menu:["粒子","重力/速度处理"],
		//组件全局唯一下标
		key:"particle-gv-jax",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector({
				fs:`
				#include pf-main;
				void run(){
					if(p.life != 0.0){
						//根据重力调整速度
						p.velocity += p.gravity / 120.0;
						//根据速度调整坐标
						p.position += p.velocity / 120.0;
						//清除重力
						p.gravity = vec3(0,0,0);
						//阻力
						//p.velocity = p.velocity * 0.9985;
					}
				}
				`
			});
			this.effect.run();
			return vals;
		}
	});




	map.addModule({
		//组件名称
		name:"引力点",
		//菜单
		menu:["粒子","引力点"],
		//组件全局唯一下标
		key:"particle-g-point",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"},
			{type:"float",name:"x",key:"x",step:0.01,min:-2.0,max:2.0,default:0,input_type:"range",use_link:false},
			{type:"float",name:"y",key:"y",step:0.01,min:-2.0,max:2.0,default:0,input_type:"range",use_link:false},
			{type:"float",name:"z",key:"z",step:0.01,min:-2.0,max:2.0,default:0,input_type:"range",use_link:false},
			{type:"float",name:"引力强度",key:"str",step:0.01,min:0,max:20.0,default:3,input_type:"range",use_link:false},
		],
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector({
				fs:`
				#include pf-main;

				uniform vec3 uGPoint;
				uniform float uStr;

				void run(){
					if(p.life != 0.0){
						//重力写入
						p.gravity += normalize(uGPoint - p.position) / max(0.5,distance(uGPoint,p.position)) * uStr;
					}
				}
				`
			});
			this.effect.run({uniforms:{
				uGPoint:[vals.x,vals.y,vals.z],
				uStr:vals.str
			}});
			return vals;
		}
	});




	map.addModule({
		//组件名称
		name:"涡流",
		//菜单
		menu:["粒子","涡流"],
		//组件全局唯一下标
		key:"particle-g-rotate",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector({
				fs:`
				#include pf-main;

				uniform vec3 uGPoint;
				uniform float uStr;

				mat3 rmat = mat3(0,-1,0,   1,0,0,  0,0,1);

				void run(){
					if(p.life != 0.0){
						//重力写入
						vec3 g = vec3((rmat * vec3(vec2(normalize(p.position.xy - vec2(0,0))),1.0)).xy,0.0) * (0.8 + rand() * 2.0);
						g = g * 0.3;
						p.gravity += g;
					}
				}
				`
			});
			this.effect.run({uniforms:{
				uGPoint:[vals.x,vals.y,vals.z],
				uStr:vals.str
			}});
			return vals;
		}
	});




	map.addModule({
		//组件名称
		name:"粒子贴图显示",
		//菜单
		menu:["粒子","粒子贴图显示"],
		//组件全局唯一下标
		key:"particle-texture-show",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			var fbi = vals.core.getFrameBuffer();
			return {
				image:{
					data:fbi.attachments[0],
					type:"texture",
					gl:vals.core.gl,
					width:fbi.width,
					height:fbi.height
				}
			}
		}
	});



	map.addModule({
		//组件名称
		name:"粒子-点渲染",
		//菜单
		menu:["粒子","点渲染"],
		//组件全局唯一下标
		key:"particle-renderer-point",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.renderer = this.renderer || vals.core.createRenderer();
			this.renderer.render();
			var fbi = this.renderer.fbi;
			return {
				image:{
					data:fbi.attachments[0],
					type:"texture",
					gl:vals.core.gl,
					width:fbi.width,
					height:fbi.height
				}
			}
		}
	});



	map.addModule({
		//组件名称
		name:"粒子-球体渲染",
		//菜单
		menu:["粒子","球体渲染"],
		//组件全局唯一下标
		key:"particle-renderer-voxel-rh",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"},
			{type:"image",name:"光照贴图",key:"image_light"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			var fbi = vals.core.getFrameBuffer();
			var uniforms = vals.core.writeUniform();
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:{
					data:fbi.attachments[0],
					type:"texture",
					gl:vals.core.gl,
					width:fbi.width,
					height:fbi.height
				},
				attachments:[
					{attach:0},
					{attach:1}
				],
				uniforms:uniforms,
				width:480,
				height:480,
				vs:`
				#version 300 es
				in vec4 position;
				in vec2 uv;

				out vec2 vUV;

				void main() {
				  gl_Position = position;
				  vUV = uv;
				}
				`,
				fs:gp.build(`
					#include base-data;

					uniform sampler2D uSampler;

					struct Ray {
					    vec3 o;//起点
					    vec3 d;//方向
					    float t;//距离
					    bool isHit;//是否击中
					    vec3 pos;//击中点位置
					    vec3 normal;//击中点法线
					    vec4 color;//当前命中点颜色
					    float count;//命中次数
					    vec4 pinfo;//命中的点数据
					};

					//光线和球体求交
					bool intersectSphere(inout Ray ray, vec3 sphereCenter, float sphereRadius) {
					    vec3 toSphere = ray.o - sphereCenter;
					    float a = dot(ray.d, ray.d);
					    float b = 2.0 * dot(toSphere, ray.d);
					    float c = dot(toSphere, toSphere) - sphereRadius*sphereRadius;
					    float discriminant = b*b - 4.0*a*c;

					    if(discriminant > 0.0) {
					        float t = (-b - sqrt(discriminant)) / (2.0 * a);
					        if(t > 0.0 && t < ray.t){
					            ray.isHit = true;
					            ray.t = t;
					            ray.pos = ray.o + ray.d * t;
					            ray.normal = normalize(ray.pos - sphereCenter);
					            return true;
					        }
					    }
					    return false;
					}

					in vec2 vUV;
					layout (location = 0) out vec4 color;
					layout (location = 1) out vec4 color_light;

					//命中一次
					void hitOne(inout Ray ray){
						ray.t = 10000.0;
						ray.isHit = false;
						for(float index = 0.0;index < 2000.0 && index < uCount;index++){
							vec4 pinfo = texture(uPs,getUVOfIndex(index));
							if(intersectSphere(ray,pinfo.xyz,0.1))
								ray.pinfo = pinfo;
						}
					}

					vec3 c1 = vec3(144,117,50) / 256.0;
					vec3 c2 = vec3(224,211,139) / 256.0;

					void main(void){
						//生成光线
						Ray ray,fray;
						ray.o = vec3(0,0,-4.0);
						ray.d = normalize(vec3(vUV.x - 0.5,vUV.y - 0.5,1.0) * 2.0);
						ray.color = vec4(0,0,0,0.0);
						color_light = vec4(0,0,0,0);
						//循环投射
						for(float i = 0.0;i < 3.0;i++){
							hitOne(ray);
							//没有命中跳出
							if(!ray.isHit)
								break;
							if(ray.count == 0.0)
								fray = ray;
							ray.o = ray.pos;
							ray.d = ray.d + ray.normal * 2.0;
							ray.count++;
							vec4 color_now;
							if(ray.pinfo.a < 0.1){
								color_now = vec4(0,0.81,1.0,1.0);
								color_light = vec4(0,0.81,1.3,1.0) * pow(0.7,ray.count - 1.0);
								i = 99.0;
							}else{
								//颜色
								float d = abs(dot(fray.d,fray.normal));
								color_now = vec4(d * c1 + (1.0 - d) * c2,1.0);
							}
							if(ray.count == 1.0)
								ray.color = color_now;
							else
								ray.color = vec4(ray.color * 0.3 + color_now * 0.7);
						}
						//如果次数为0
						if(ray.count == 0.0){
							color = vec4(0,0,0,1.0);
							return;
						}
						color = ray.color;
					}`)
			});
			//输出图层1
			return {
				image:re.outputs[0],
				image_light:re.outputs[1]
			};
		}
	});
	

}