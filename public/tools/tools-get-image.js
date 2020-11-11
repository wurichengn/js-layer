


//图像转换工具
module.exports = async function(image,type,args){
	//如果要转换到canvas-2d
	if(type == "canvas-2d")
		return await toCanvas2d(image,type,args.canvas);
}


var toCanvas2d = async function(image,type,canvas){
	var ctx = canvas.getContext("2d");
	if(image.type == "data-url"){
		return await new Promise(function(next){
			var img = new Image();
			img.src = image.data;
			img.onload = function(){
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img,0,0);
				next();
			}
		});
	}
}