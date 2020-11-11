var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;


//拓扑图顶部菜单组件
module.exports = 
@lcg
class MapUIMenu{
	init(){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div></div>;
		});

		//样式
		this.css({
			"height":"35px",
			"background-color":"#333",
			"border-bottom":"1px solid #555"
		});
	}
}