var lcg = require("lcg");
var React = lcg.React;


//UI主面板
module.exports = 
@lcg
class MapUIMainPanle{
	init(){
		var self = this;
		//初始化dom
		this.$dom(function(){
			return <div></div>;
		});

		//样式
		this.css({
			
		});
	}
}