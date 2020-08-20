/*var Draws = require("draws");

console.log("xxx");

//初始化画布
var app = new Draws.App({width:800,height:800});

document.body.appendChild(app.view);*/

var Renderer = require("renderer");
var renderer = window.renderer = new Renderer();
document.body.appendChild(renderer.view);
renderer.view.style["width"] = renderer.view.style["height"] = "128px";
renderer.view.style["opacity"] = 0.1;




var i = 0;

var step = async function(){
	var t1 = new Date().getTime();
	i++;
await renderer.render({
	setting:{
		width:640,
		height:640,
	},
	res:[
		{
			uid:"roz8ga3kg8",
			type:"img",
			target:"img/head.jpg"
		}
	],
	stage:{
		childs:[
			{
				uid:"ajvtboa2h5",
				type:"sprite",
				attr:{
					res:"roz8ga3kg8"
				},
				body:{
					//坐标
					position:{
						x:100 * Math.cos(i / 15) + 100,
						y:100 * Math.sin(i / 15) + 100
					}
				},
				childs:function(){
					if(Math.random() > 0.0){
						return [
							{
								uid:"vg8ak39gn4",
								type:"sprite",
								attr:{
									res:"roz8ga3kg8"
								},
								body:{
									position:{
										x:100 * Math.cos(i / 15) + 100,
										y:100 * Math.sin(i / 15) + 100
									}
								},
								filters:[
									{
										uid:"g85ja0v5na8",
										type:"blur",
										attr:{
											blur:15 * Math.cos(i / 15)
										}
									}
								]
							}
						]
					}else{
						return [];
					}
				}(),
				filters:[
					{
						uid:"d8gb63mfpz7",
						type:"blur",
						attr:{
							blur:15 * Math.cos(i / 15)
						}
					}
				]
			}
		]
	}
});

var t2 = new Date().getTime();
console.log(t2 - t1);
console.log("xx");
setTimeout(step,100);

};


step();







var tt = function(level){
	if(level < 1)
		return;
	return new Promise(function(next){
		var re = tt(level - 1);
		console.log(level);
		if(re)
			re.then(function(){
				next();
			});
	});
}


var test = async function(){
	var t1 = new Date().getTime();
	await tt(5);
	var t2 = new Date().getTime();
	console.log(t2 - t1);
}
test();