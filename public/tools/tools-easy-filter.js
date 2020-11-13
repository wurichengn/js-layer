
var Tools = require("./index.js");
var gl = Tools.gl;


//简易的图像滤镜处理
module.exports = async function(module,d){
	//渲染配置
	var cfg = {
		//顶点着色器
		vs:vs,
		//片元着色器
		fs:fs,
		//渲染宽度
		width:null,
		//渲染高度
		height:null,
		//输入图像
		image:null,
		//参数
		uniforms:{},
		//顶点数据
		buffers:{
			position:{data:[-1,-1,  1,-1,   -1,1,   -1,1,   1,-1,   1,1],numComponents:2},
			uv:{data:[0,0,  1,0,  0,1,  0,1,  1,0,  1,1],numComponents:2}
		},
		//输出帧缓冲区配置 - 默认输出一层rgba
		attachments:[
			{attach:0}
		],
		//是否是输出到原始画布
		close_frame:false
	};
	//写入配置
	for(var i in d)
		cfg[i] = d[i];

	//要写入的贴图
	var image;

	//如果图像不是贴图或者不是相同的上下文则需要转换
	if(cfg.image.type != "texture" || cfg.image.gl != gl){
		//初始化贴图空间
		module.filterTexture = module.filterTexture || gl.createTexture();
		//转换图像
		image = await Tools.getImage(cfg.image,"texture",{texture:module.filterTexture,gl:gl});
	}else{
		//直接使用贴图
		image = {...cfg.image};
	}

	//宽高缺审
	cfg.width = cfg.width || image.width;
	cfg.height = cfg.height || image.height;

	//原始画布翻转图像
	if(cfg.close_frame){
		cfg.buffers.uv = {data:[0,1,  1,1,  0,0,  0,0,  1,1,  1,0],numComponents:2};
	}

	//初始化
	if(module.filterInfo == null)
		module.filterInfo = initInfo(cfg);
	//接收info主体
	var info = module.filterInfo;

	//======渲染流程开始======
	//绑定缓冲区
	if(!cfg.close_frame)
		twgl.bindFramebufferInfo(gl,info.fbi);
	else
		twgl.bindFramebufferInfo(gl,null);

	//设置顶点数据
	twgl.setBuffersAndAttributes(gl, info.pi, info.bi);

	//清空画布
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//非缓冲区渲染设置分辨率
	if(cfg.close_frame && (Tools.canvas.width != cfg.width || Tools.canvas.height != cfg.height)){
		Tools.canvas.width = cfg.width;
		Tools.canvas.height = cfg.height;
		gl.viewport(0, 0, cfg.width, cfg.height);
	}

	//选定渲染器
	gl.useProgram(info.pi.program);
	//构造uniform
	var uniforms = {...cfg.uniforms};
	//设置贴图
	uniforms.uSampler = image.data;
	//设置尺寸
	uniforms.uSize = [cfg.width,cfg.height];
	//写入uniform
	twgl.setUniforms(info.pi,uniforms);

	//渲染
	twgl.drawBufferInfo(gl, info.bi);

	
	//======构造输出结果======
	var re = {outputs:[]};

	//循环每个层
	for(var i in info.fbi.attachments){
		var output = {...image};
		output.data = info.fbi.attachments[i];
		re.outputs.push(output);
	}

	return re;
}



//初始化Info
var initInfo = function(cfg){
	var re = {};
	//初始化着色器
	re.pi = twgl.createProgramInfo(gl, [cfg.vs,cfg.fs]);
	//绑定顶点数据
	re.bi = twgl.createBufferInfoFromArrays(gl, cfg.buffers);
	//初始化帧缓冲区
	re.fbi = twgl.createFramebufferInfo(gl,cfg.attachments,cfg.width,cfg.height);
	//======绑定帧缓冲区数组======
	//超过一层的帧缓冲区才绑定
	if(cfg.attachments.length > 1){
		var num = 0;
		var bufferList = [];
		//记录数量
		for(var i in cfg.attachments)
			num++;
		//加入绑定的层
		for(var i = 0;i < num;i++)
			bufferList.push(gl.COLOR_ATTACHMENT0 + i);
		//绑定buffer
		if(num > 1)
			gl.drawBuffers(bufferList);
	}
	//取消贴图绑定，防止循环引用
	gl.bindTexture(gl.TEXTURE_2D,null);

	return re;
}





//默认的顶点着色器
var vs = `
attribute vec4 position;
attribute vec2 uv;

varying vec2 vUV;

void main() {
	vUV = uv;
	gl_Position = position;
}`;

//默认片元着色器
var fs = `
precision mediump float;
varying vec2 vUV;

uniform sampler2D uSampler;
uniform vec2 uSize;

void main(void){
	gl_FragColor = texture2D(uSampler, vUV);
}
`;