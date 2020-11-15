var UI = require("graph-ui");

//解析URL参数
var parms = {};
var url = window.location.href.split("?")[1];
if(url){
	url = url.split("&");
	for(var i in url){
		var kz = url[i].split("=");
		parms[kz[0]] = kz[1];
	}
}


if(parms.demo != null){
	axios.get("./demos/"+parms.demo+".json").then(function(res){
		document.body.appendChild(UI.new(res.data));
	});
}else{
	document.body.appendChild(UI.new());
}



//初始化面板
//var panle = UI.new();

//document.body.appendChild(panle);