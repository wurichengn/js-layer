


//单个资源
module.exports = function(){

	//当前的资源
	var res;
	//当前的属性
	var attr = {};

	
	//同步资源
	this.sync = async function(dt){
		//如果属性完全相同则不需要更新资源
		if(JSON.stringify(dt) == JSON.stringify(attr))
			return;
		//写入属性
		attr = dt;
		//如果已存在资源则先释放
		if(res)
			res.destroy();
		//初始化新的资源
		await init(dt);
	}

	//获取资源
	this.get = function(){
		return res;
	}

	//释放资源
	this.destroy = function(){
		if(res)
			res.destroy();
	}



	//初始化一个新的资源
	var init = async function(dt){
		//图像资源
		if(dt.type == "img"){
			res = await PIXI.Texture.from(dt.target);
		}
	}
	
}