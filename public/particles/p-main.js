var Effector = require("./p-effector.js");
var Renderer = require("./p-render.js");


var P = module.exports = function(d){
	d = d || {};
	var self = this;
	//创建上下文
	if(d.canvas == null || d.gl == null)
		var {gl,canvas} = createGL();
	else
		var gl = d.gl,canvas = d.canvas;
	this.gl = gl;
	this.canvas = canvas;

	//默认配置
	var cfg = this.cfg = {
		//数据贴图尺寸
		data_width:64,
		data_height:64,
		//粒子数量
		count:200
	}

	//帧缓冲区配置
	var attachments = [
		//16位浮点RGB表示坐标  A表示权重
		{format:gl.RGBA,internalFormat:gl.RGBA32F,type:gl.FLOAT,mag:gl.NEAREST},
		//16位浮点RGB表示速度  A表示存活时间
		{format:gl.RGBA,internalFormat:gl.RGBA32F,type:gl.FLOAT,mag:gl.NEAREST},
		//16位浮点表示加速度
		{format:gl.RGBA,internalFormat:gl.RGBA32F,type:gl.FLOAT,mag:gl.NEAREST},
		//16位浮点表示颜色
		{format:gl.RGBA,internalFormat:gl.RGBA32F,type:gl.FLOAT,mag:gl.NEAREST}
	]

	//渲染输出层
	var bufferList = [
		gl.COLOR_ATTACHMENT0,
		gl.COLOR_ATTACHMENT1,
		gl.COLOR_ATTACHMENT2,
		gl.COLOR_ATTACHMENT3
	];

	//初始化缓冲区
	var fbis = [];
	fbis.push(twgl.createFramebufferInfo(gl,attachments,cfg.data_width,cfg.data_height));
	gl.drawBuffers(bufferList);
	fbis.push(twgl.createFramebufferInfo(gl,attachments,cfg.data_width,cfg.data_height));
	gl.drawBuffers(bufferList);
	//当前使用的缓冲区
	fbiKey = 0;
	//缓冲区异或
	var getE = function(){
		if(fbiKey == 0)
			return 1;
		return 0;
	}
	//获取当前活动的缓冲区
	this.getFrameBuffer = function(){
		return fbis[fbiKey];
	}

	//取消贴图绑定，防止循环引用
	gl.bindTexture(gl.TEXTURE_2D,null);


	//创建一个简易效果器
	this.createEffector = function(cfg){
		return new Effector(cfg,self);
	}

	//创建一个渲染器
	this.createRenderer = function(cfg){
		return new Renderer(cfg,self);
	}

	//写入一次变量
	this.writeUniform = function(dt){
		var cfgs = {
			uniforms:{},
			fbi:fbis[getE()]
		};
		for(var i in dt)
			cfgs[i] = dt[i];
		//写入变量
		var uniforms = {...cfgs.uniforms};

		//设置坐标贴图
		uniforms.uPs = cfgs.fbi.attachments[0];
		//设置速度贴图
		uniforms.uVs = cfgs.fbi.attachments[1];
		//设置加速度贴图
		uniforms.uGs = cfgs.fbi.attachments[2];
		//设置颜色贴图
		uniforms.uCs = cfgs.fbi.attachments[3];

		//设置尺寸
		uniforms.uDataSize = [cfg.data_width,cfg.data_height];
		//随机种子
		uniforms.uRandSeed = Math.random();
		//粒子数量
		uniforms.uCount = cfg.count;
		return uniforms;
	}

	//开始渲染
	this.run = function(dt,effect){
		var cfgs = {
			//变量设置
			uniforms:{},
			//渲染宽高，屏幕渲染才需要
			width:cfg.data_width,
			height:cfg.data_height,
			//当前粒子数量
			count:cfg.count
		};
		for(var i in dt)
			cfgs[i] = dt[i];

		//写入数量
		cfg.count = cfgs.count;

		//缓冲区切换
		fbiKey++;
		if(fbiKey > 1)
			fbiKey = 0;

		//绑定帧缓冲区
		twgl.bindFramebufferInfo(gl,fbis[fbiKey]);

		//视图尺寸调整
		gl.viewport(0, 0, cfgs.width, cfgs.height);

		//写入变量
		var uniforms = self.writeUniform(cfgs);

		//写入uniform
		twgl.setUniforms(effect.pi,uniforms);

		//清空画布
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		//渲染
		twgl.drawBufferInfo(gl, effect.bi);
	}

}



//初始化上下文
var createGL = function(){
	//初始化全局通用的webgl上下文
	var canvas = canvas = document.createElement("canvas");
	//尝试获取webgl2上下文
	var gl = twgl.getContext(canvas,{
		premultipliedAlpha:false
	});

	//初始化扩展
	twgl.addExtensionsToContext(gl);
	
	return {canvas:canvas,gl:gl}
}