
//常用工具组件集
var Tools = module.exports = {};

//初始化全局通用的webgl上下文
var canvas = Tools.canvas = canvas = document.createElement("canvas");
//尝试获取webgl2上下文
var gl = Tools.gl = window.gl = twgl.getContext(canvas,{
	premultipliedAlpha:false
});

//初始化扩展
twgl.addExtensionsToContext(gl);


//获取影像
Tools.getImage = require("./tools-get-image.js");


//简易的图像滤镜
Tools.easyFilter = require("./tools-easy-filter.js");