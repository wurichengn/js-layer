
//常用工具组件集
var Tools = module.exports = {};

//初始化全局通用的webgl上下文
var canvas = Tools.canvas = document.createElement("canvas");
//document.body.appendChild(canvas);
//canvas.classList.add("debug");
//尝试获取webgl2上下文
var gl;
var glConfig = {
	premultipliedAlpha:false
};
try{
	gl = canvas.getContext("webgl2",glConfig);
}catch(e){
	//获取webgl上下文
	gl = canvas.getContext("webgl",glConfig);
}
Tools.gl = gl;


//获取影像
Tools.getImage = require("./tools-get-image.js");


//简易的图像滤镜
Tools.easyFilter = require("./tools-easy-filter.js");