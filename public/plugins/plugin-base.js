var Tools = require("tools");
var initTypes = require("./plugin-base-types.js");
var initModuleImage = require("./plugin-base-module-image.js");
var initModuleOther = require("./plugin-base-module-other.js");
var initModuleFilter = require("./plugin-base-module-filter.js");
var initModuleLayer = require("./plugin-base-module-layer.js");

module.exports = function(map){
	//加入类型
	initTypes(map);

	//加入图像输入组件
	initModuleImage(map);
	//加入滤镜
	initModuleFilter(map);
	//加入图层
	initModuleLayer(map);
	//加入其他组件
	initModuleOther(map);
}