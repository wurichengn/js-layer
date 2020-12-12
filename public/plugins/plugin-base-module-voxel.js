var Tools = require("tools");
var lcg = require("lcg");
var gl = Tools.gl;
var GP = require("glsl-pack");
var gp = new GP();


module.exports = function(map){


	map.addModule({
		name:"视图旋转矩阵",
		menu:["学习工具","视图旋转矩阵"],
		key:"voxel-mat-view",
		inputs:[],
		//组件的输出
		outputs:[
			{type:"mat4",name:"矩阵",key:"mat"}
		],
		//初始化
		init:function(){
			var self = this;
			this.mat4 = twgl.m4.rotationZ(0);
			var isd = false;
			var ex,ey;

			lcg.on("trigger-dom-view-mousedown",function(e){
				e = e.vals;
				isd = true;
				ex = e.x;
				ey = e.y;
			});

			lcg.domEvent(document,"mousemove",function(e){
				if(!isd)
					return;
				isd = true;
				twgl.m4.rotateY(self.mat4,(e.x - ex) / 100,self.mat4);
				twgl.m4.rotateX(self.mat4,-(e.y - ey) / 100,self.mat4);
				ex = e.x;
				ey = e.y;
				self.sendMessage("change");
			});

			lcg.domEvent(document,"mouseup",function(e){
				if(!isd)
					return;
				isd = false;
			});
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(){
			//输出图层1
			return {mat:this.mat4};
		}
	});



	map.addModule({
		name:"对象旋转矩阵",
		menu:["学习工具","对象旋转矩阵"],
		key:"voxel-mat-obj-rotate",
		inputs:[],
		//组件的输出
		outputs:[
			{type:"mat4",name:"矩阵",key:"mat"}
		],
		//初始化
		init:function(){
			var self = this;
			this.mat4 = twgl.m4.rotationZ(0);
			var isd = false;
			var ex,ey;

			lcg.on("trigger-dom-view-mousedown",function(e){
				e = e.vals;
				isd = true;
				ex = e.x;
				ey = e.y;
			});

			lcg.domEvent(document,"mousemove",function(e){
				if(!isd)
					return;
				isd = true;
				twgl.m4.rotateY(self.mat4,(e.x - ex) / 100,self.mat4);
				twgl.m4.rotateX(self.mat4,(e.y - ey) / 100,self.mat4);
				ex = e.x;
				ey = e.y;
				self.sendMessage("change");
			});

			lcg.domEvent(document,"mouseup",function(e){
				if(!isd)
					return;
				isd = false;
			});
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(){
			//输出图层1
			return {mat:this.mat4};
		}
	});



	map.addModule({
		name:"编程-体素渲染",
		menu:["学习工具","编程-渲染"],
		key:"voxel-render-code",
		inputs:[
			{type:"mat4",name:"矩阵",key:"mat"},
			{type:"voxel-data",name:"体素数据",key:"voxel"},
			{type:"code",name:"glsl代码",key:"code",use_link:false,default:defVoxelFS,mode:"c_cpp"},
			{type:"float",name:"uArgs1（0-1）",key:"args1",use_link:false,default:0,input_type:"range",min:0,max:1,step:0.001},
			{type:"float",name:"uArgs2（0-1）",key:"args2",use_link:false,default:0,input_type:"range",min:0,max:1,step:0.001},
			{type:"float",name:"uArgs3（0-1）",key:"args3",use_link:false,default:0,input_type:"range",min:0,max:1,step:0.001},
			{type:"float",name:"uArgs4（0-1）",key:"args4",use_link:false,default:0,input_type:"range",min:0,max:1,step:0.001},
			{type:"image",name:"uTex1",key:"img1"},
			{type:"image",name:"uTex2",key:"img2"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			//着色贴图
			this.ctex = this.ctex || twgl.createTexture(gl,{
				target:gl.TEXTURE_2D,
				src:[26,115,232,255,  255,229,133,255,  210,66,66,255,  218,187,142,255],
				width:4,
				height:1,
				format:gl.RGBA
			});
			//初始化贴图
			this.tex = this.tex || twgl.createTexture(gl,{
				target:gl.TEXTURE_3D,
				internalFormat:gl.R32F,
				format:gl.RED
			});
			//默认体素数据
			var voxel = vals.voxel || {data:[0,1,1,0,1,0,0,1],width:2,height:2,depth:2};
			//判断是否需要更新
			if(this.lastVoxel == null || (voxel != this.lastVoxel && voxel.data != this.lastVoxel.data)){
				this.lastVoxel = voxel;
				var updateData = {
					width:voxel.width,
					height:voxel.height,
					depth:voxel.depth,
					target:gl.TEXTURE_3D,
					internalFormat:gl.R32F,
					format:gl.RED,
					type:gl.FLOAT
				};

				if(updateData.width < 100){
					updateData.mag = gl.NEAREST;
					updateData.min = gl.NEAREST;
				}

				//更新数据
				twgl.setTextureFromArray(gl,this.tex,voxel.data,updateData);
			}

			//设置uniforms
			var uniforms = {
				uViewMat:vals.mat,
				uVoxel:this.tex,
				uColor:this.ctex,
				uVoxelSize:[voxel.width,voxel.height,voxel.depth],
				//参数
				uArgs1:vals.args1,
				uArgs2:vals.args2,
				uArgs3:vals.args3,
				uArgs4:vals.args4
			};

			//贴图输入处理
			if(vals.img1){
				//转换图像
				img1 = await Tools.getImage(vals.img1,"texture",{gl:gl});
				uniforms["uTex1"] = img1.data;
			}

			if(vals.img2){
				//转换图像
				img2 = await Tools.getImage(vals.img2,"texture",{gl:gl});
				uniforms["uTex2"] = img2.data;
			}

			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:{gl:gl,data:null,type:"texture",width:1,height:1},
				width:480,
				height:480,
				uniforms:uniforms,
				vs:`
				#version 300 es
				in vec4 position;
				in vec2 uv;

				out vec2 vUV;

				void main() {
				  gl_Position = position;
				  vUV = uv;
				}`,
				fs:gp.build(vals.code)
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});



	map.addModule({
		name:"编程-体素渲染",
		menu:["学习工具","编程-滤镜"],
		key:"filter-render-code",
		inputs:[
			{type:"image",name:"图像",key:"image"},
			{type:"code",name:"glsl代码",key:"code",use_link:false,default:defFilterFS,mode:"c_cpp"}
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
				attachments:[
					{format:gl.RGBA,internalFormat:gl.RGBA32F,type:gl.FLOAT}
				],
				vs:`
				#version 300 es
				in vec4 position;
				in vec2 uv;

				out vec2 vUV;

				void main() {
				  gl_Position = position;
				  vUV = uv;
				}`,
				fs:gp.build(vals.code)
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});
}



//滤镜基本代码
gp.addLib("filter-base",`#version 300 es
precision mediump float;
precision highp sampler3D;
in vec2 vUV;

uniform sampler2D uSampler;
uniform vec2 uSize;

out vec4 outColor;
`);

var defFilterFS = `
#include filter-base;

void main(){
	outColor = texture(uSampler,vUV);
}
`;


//基本代码
gp.addLib("shader-base",`#version 300 es
precision mediump float;
precision highp sampler3D;
in vec2 vUV;

uniform sampler2D uSampler;
uniform sampler3D uVoxel;
uniform vec2 uSize;
uniform mat4 uViewMat;
uniform sampler2D uColor;

uniform float uArgs1;
uniform float uArgs2;
uniform float uArgs3;
uniform float uArgs4;

uniform sampler2D uTex1;
uniform sampler2D uTex2;

const float PI = 3.141592654;

out vec4 outColor;

`)


//基本代码
gp.addLib("voxel-base",`
#include shader-base;

//光线结构体
struct Ray {
    vec3 pos;//起点
    vec3 step;//步进向量
};

//获取坐标点的值
float getValue(vec3 pos){
	if(pos.x <= 0.0 || pos.x >= 1.0 ||
		pos.y <= 0.0 || pos.y >= 1.0||
		pos.z <= 0.0 || pos.z >= 1.0)
		return -4096.0;
	return texture(uVoxel,vec3(pos)).r;
}

//获取光线信息
Ray getRay(float step_num){
	float bl = 1.8;
	Ray ray;
	ray.pos = (uViewMat * vec4(vUV - 0.5,-0.5 * bl,1)).xyz + 0.5;
	ray.step = (uViewMat * vec4(0,0,1.0 * bl,1)).xyz / step_num;
	return ray;
}

// 根据hu着色
vec3 getHuColor(float hu){
    float off = max(min((hu + 400.0) / (800.0),0.875),0.125);
    return texture(uColor,vec2(off,0.5)).rgb;
}

//主函数
void main(void){
	outColor = vec4(0,0,0,1);
	run();
}`);




//默认的着色器
var defVoxelFS = `#include voxel-base;

//投射步数
float step_num = 500.0;

void run(){
	//根据步数获取投射信息
	Ray ray = getRay(step_num);
	//循环步进
	for(float i = 0.0;i < step_num;i++){
		ray.pos += ray.step;
		//当碰到实体时输出深度
		if(getValue(ray.pos) > 0.0){
			float c = i / step_num;
			outColor = vec4(c,c,c,1);
			return;
		}
	}
}`;