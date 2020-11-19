var gp = require("./p-glsl.js");

module.exports = function(d,par){
	//默认配置
	var cfg = {
		//顶点着色器
		vs:vs,
		//片元着色器
		fs:fs,
		//顶点数据
		buffers:{
			position:{data:[-1,-1,  1,-1,   -1,1,   -1,1,   1,-1,   1,1],numComponents:2},
			uv:{data:[0,0,  1,0,  0,1,  0,1,  1,0,  1,1],numComponents:2}
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

	//运行
	this.run = function(dt){
		//渲染
		par.run(dt,self);
	}
}








//默认的顶点着色器
var vs = `
#version 300 es
in vec4 position;
in vec2 uv;

out vec2 vUV;

void main() {
  gl_Position = position;
  vUV = uv;
}`;

//默认片元着色器
var fs = `#version 300 es
precision highp float;

in vec2 vUV;

uniform int type;
uniform sampler2D uPs;
uniform sampler2D uVs;
uniform sampler2D uGs;

layout (location = 0) out vec4 oPs;
layout (location = 1) out vec4 oVs;
layout (location = 2) out vec4 oGs;

void main() {
	oPs = texture(uPs,vUV);
	oVs = texture(uVs,vUV);
	oGs = texture(uGs,vUV);
}
`;