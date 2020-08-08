/*var Draws = require("draws");

console.log("xxx");

//初始化画布
var app = new Draws.App({width:800,height:800});

document.body.appendChild(app.view);*/

var Renderer = require("renderer");
var renderer = new Renderer();
document.body.appendChild(renderer.view);
renderer.view.style["width"] = renderer.view.style["height"] = "128px";




var i = 0;

var step = async function(){
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
					if(Math.random() > 0.5){
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


setTimeout(step,20);

};


step();