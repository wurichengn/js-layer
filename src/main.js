
var Map = require("map");
var UI = require("map-ui");

//初始化一个流程图
var map = new Map();
var uiMap = UI.map.new(map);

//uiMap.style["opacity"] = 0.1;
document.body.appendChild(uiMap);
document.body.style["background-color"] = "#444";