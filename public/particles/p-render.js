var gp = require("./p-glsl.js");

//渲染器
module.exports = function(d,par){
	var self = this;
	//默认配置
	var cfg = {
		//顶点着色器
		vs:vs,
		//片元着色器
		fs:fs,
		//顶点数据
		buffers:{
			position:{data:[0,0,0],numComponents:3}
		}
	};
	//写入配置
	for(var i in d)
		cfg[i] = d[i];

	var gl = par.gl;

	//初始化着色器
	var pi = self.pi = twgl.createProgramInfo(gl, [gp.build(cfg.vs),gp.build(cfg.fs)]);
	//创建顶点数据
	var bi = self.bi = twgl.createBufferInfoFromArrays(gl, cfg.buffers);
	//设置顶点数据
	twgl.setBuffersAndAttributes(gl, pi, bi);
	//缓冲区
	var fbi = this.fbi = twgl.createFramebufferInfo(gl,[{}],1,1);

	//渲染
	this.render = function(){
		var cfgs = {
			//渲染视图尺寸
			width:640,
			height:640,
			//要渲染的输入缓冲区
			fbi:par.getFrameBuffer(),
			//额外参数
			uniforms:{},
			//渲染类型
			type:gl.POINTS
		};

		//选定渲染器
		gl.useProgram(pi.program);
		//设置属性
		twgl.setBuffersAndAttributes(gl, pi, bi);

		//取消绑定缓冲区
		twgl.bindFramebufferInfo(gl,fbi);

		//缓冲区渲染设置分辨率
		if(fbi.width != cfgs.width || fbi.height != cfgs.height)
			twgl.resizeFramebufferInfo(gl, fbi,[{}],cfgs.width,cfgs.height);
		gl.viewport(0, 0, cfgs.width, cfgs.height);

		//写入变量
		var uniforms = par.writeUniform(cfgs);

		//写入uniform
		twgl.setUniforms(pi,uniforms);

		//清空画布
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		//渲染
		twgl.drawBufferInfo(gl, bi,cfgs.type,bi.numElements,0,1000);
	}
}



//默认的顶点着色器
var vs = `
//基本定义
#include base-data;
in vec4 position;

void main() {
	Particle p = getParticleOfIndex(float(gl_InstanceID));
	gl_Position = vec4(p.position.xyz,1.0);
	gl_PointSize = p.life;
}`;

//默认片元着色器
var fs = `#version 300 es
precision highp float;

out vec4 color;

void main() {
	color = vec4(1,1,1,1);
}
`;