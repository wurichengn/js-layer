var cfgs = require("./webpack.config.js");

//构造参数
var data = cfgs.init({
	mode:"development"
});

data["devtool"] = "cheap-module-eval-source-map";

module.exports = data;