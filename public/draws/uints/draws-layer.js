
var Uint = require("./draws-uint.js");

//======图层======
module.exports = function(d){
	//以容器作为代理
	var body = this.body = new PIXI.Container();

	//侦听子内容改变
	d.$listen(function(e){
		if(e.target != d.childs)
			return;
		//创建节点处理
		if(e.action == "create"){
			for(var i in e.value){
				var uint = new Uint(e.value[i]);
				body.addChild(uint.body);
			}
		}
	});
}