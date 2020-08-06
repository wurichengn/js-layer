

var Util = module.exports = {};



//从剪贴板获取文件
Util.copyFile = function(item){
	return new Promise(function(next,err){
		console.log(item);
		//初始化载入器
		var reader = new FileReader();
		if(item.type.substr(0,6) != "image/")
			return next(null);
		//读取结束
        reader.onload = function (evt) {
            next(evt.target.result);
        }
        //开始读图
        reader.readAsDataURL(item.getAsFile());
	})
}


//从剪贴板获取字符串
Util.copyString = function(item){
	return new Promise(function(next,err){
		item.getAsString(function(res){
			var str = res.match(/src\=\"(.+?)\"/);
			if(str == null)
				return next(null);
			str = str[1];
			if(str.substr(0,11) != "data:image/")
				return next(null);
			next(str);
		});
	})
}