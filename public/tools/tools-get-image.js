
var Tools = require("./index.js");

//通用贴图渲染对象
var textureCache = {};

//图像转换可以输入的类型有
//canvas  img   texture   data-url   image-data   url   video
//可以输出的类型有
//canvas  img   texture   data-url   image-data

//======类型说明======
//canvas       输入可以是任意canvas，输出时必须是上下文为2d的canvas  可以传入canvas参数来主动绘制
//img          输入输出img类型标签   可以传入img参数来主动绘制
//texture      输入输出中心上下文产生的webgl贴图  可以传入texture参数来接收贴图数据  也可以传入gl来决定要绘制的上下文
//data-url     输入输出data-url字符串
//image-data   输入输出ImageData对象
//url          输入网络地址
//video        输入video类型标签

//图像转换工具
module.exports = async function(image,type,args){
	args = args || {};
	//如果要转换到canvas
	if(type == "canvas")
		return await toCanvas2d(image,args.canvas);
	//如果要转换到img
	if(type == "img")
		return await toImg(image,args.img);
	//如果要转换到贴图
	if(type == "texture")
		return await toTexture(image,args.texture,args.gl);
}



//渲染到canvas
var toCanvas2d = async function(image,canvasIn){
	var canvas = canvasIn || document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	//根据img标签绘制
	var drawImg = function(img){
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img,0,0);
		return {
			data:canvas,
			type:"canvas",
			width:img.width,
			height:img.height
		};
	}

	//如果是canvas
	if(image.type == "canvas"){
		if(canvasIn == null)
			return {data:image.data,type:"canvas",width:image.data.width,height:image.data.height};
		else
			return drawImg(image.data);
	}

	//如果是url
	if(image.type == "data-url" || image.type == "url"){
		var img = await toImg(image);
		return drawImg(img);
	}

	//如果是img
	if(image.type == "img")
		return drawImg(image.data);

	//如果是贴图
	if(image.type == "texture"){
		//渲染贴图
		var re = await Tools.easyFilter(textureCache,{
			image:image,
			close_frame:true
		});
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(Tools.canvas,0,0);
		return {
			data:canvas,
			type:"canvas",
			width:image.width,
			height:image.height
		}
	}
}





//渲染到img
var toImg = async function(image,imgIn){
	var img = imgIn || new Image();

	//根据url生成img
	var loadImg = function(url){
		return new Promise(function(next){
			img.src = url;
			img.onload = function(){
				next({
					data:img,
					type:"img",
					width:img.width,
					height:img.height
				});
			}
		});
	}

	//如果是图像
	if(image.type == "img"){
		if(imgIn == null)
			return {data:image.data,type:"img",width:image.data.width,height:image.data.height};
		else
			return loadImg(image.data.src);
	}

	//如果是url
	if(image.type == "data-url" || image.type == "url")
		return await loadImg(image.data);

	//如果是canvas
	if(image.type == "canvas")
		return await loadImg(image.data.toDataURL());
}




//转换为贴图
var toTexture = async function(image,textureIn,gl){
	var gl = gl || Tools.gl;
	var texture = textureIn || gl.createTexture();

	//生成贴图返回
	var drawTexture = function(img){
		twgl.setTextureFromElement(gl,texture,img);
		return {
			data:texture,
			type:"texture",
			gl:gl,
			width:img.width,
			height:img.height
		};
	}

	//如果是贴图
	if(image.type == "texture"){
		//同上下文贴图则直接返回原贴图
		if(gl == null || gl == image.gl)
			return {data:image.data,type:"texture",gl:gl,width:image.width,height:image.height}
	}

	//如果是标签
	if(image.type == "img" || image.type == "canvas" || image.type == "video"){
		return drawTexture(image.data);
	}

	//如果是url
	if(image.type == "data-url" || image.type == "url"){
		var img = await toImg(image);
		return drawTexture(img);
	}
}