var Tools = require("tools");
var lcg = require("lcg");
var gl = Tools.gl;


module.exports = function(map){


	map.addModule({
		name:"视图矩阵",
		menu:["体素","视图矩阵"],
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
			lcg.domEvent(document,"mousedown",function(e){
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
		name:"体素渲染",
		menu:["体素","体素渲染"],
		key:"voxel-render-demo",
		inputs:[
			{type:"mat4",name:"图像",key:"mat"},
			{type:"voxel-data",name:"体素数据",key:"voxel"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			//初始化贴图
			this.tex = this.tex || twgl.createTexture(gl,{
				target:gl.TEXTURE_3D,
				internalFormat:gl.R32F,
				format:gl.RED
			});
			//默认体素数据
			var voxel = vals.voxel || {data:[0,1,1,0,1,0,0,1],width:2,height:2,depth:2};
			//判断是否需要更新
			if(voxel != this.lastVoxel){
				this.lastVoxel = voxel;
				//更新数据
				twgl.setTextureFromArray(gl,this.tex,voxel.data,{
					width:voxel.width,
					height:voxel.height,
					depth:voxel.depth,
					target:gl.TEXTURE_3D,
					internalFormat:gl.R32F,
					format:gl.RED,
					type:gl.FLOAT,
					mag:gl.NEAREST,
					min:gl.NEAREST
				});
			}
			//使用简易滤镜逻辑
			var re = await Tools.easyFilter(this,{
				image:{gl:gl,data:null,type:"texture",width:1,height:1},
				width:480,
				height:480,
				uniforms:{
					uViewMat:vals.mat,
					uVoxel:this.tex
				},
				vs:`
				#version 300 es
				in vec4 position;
				in vec2 uv;

				out vec2 vUV;

				void main() {
				  gl_Position = position;
				  vUV = uv;
				}`,
				fs:`#version 300 es
					precision mediump float;
					precision highp sampler3D;
					in vec2 vUV;

					uniform sampler2D uSampler;
					uniform sampler3D uVoxel;
					uniform vec2 uSize;
					uniform mat4 uViewMat;

					float step_num = 100.0;
					out vec4 color;

					void main(void){
						vec4 pos = uViewMat * vec4(vUV - 0.5,-0.5,1);
						vec3 step = (uViewMat * vec4(0,0,1,1)).xyz / step_num;
						vec3 p = pos.xyz + 0.5;
						color = vec4(0.2,0.2,0.2,1);
						color = vec4(texture(uVoxel,vec3(vUV,0.0).xyz).r,0.0,0.0,1.0);
						return;
						for(float i = 0.0;i < 500.0;i++){
							if(i >= step_num)
								break;
							p += pos.xyz;
						}
						color = vec4(pos.xyz + 0.5,1);
					}`
			});
			//输出图层1
			return {image:re.outputs[0]};
		}
	});
}