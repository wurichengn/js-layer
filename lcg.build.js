var tool = require("lcg-tools");
var path = require("path");

//开始打包
tool.pack({
	//直接使用现有配置打包
	config:require("./webpack.build.js"),
	//服务端口
	server_port:1207,
	//服务路径
	server_path:path.join(__dirname,"./build")
},function(){
	
});