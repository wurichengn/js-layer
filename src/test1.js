var Renderer = require("renderer");
var renderer = window.renderer = new Renderer();
document.body.appendChild(renderer.view);
renderer.view.style["background-color"] = "rgb(0,152,216)";
//renderer.view.style["width"] = renderer.view.style["height"] = "128px";
//renderer.view.style["opacity"] = 0.1;




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
setTimeout(step,20);

};


//step();







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






//渲染一次
var renderOne = function(d){

	var uid_index = 0;

	var uuid = function(){
		uid_index++;
		return "UID-"+uid_index;
	}

	//起始坐标
	var cfgs = {
		//图像基本坐标
		x:100,
		y:100,
		//光线角度
		rotation:Math.PI / 4,
		//阴影距离
		len:200,
		//采样数
		samp:20,
		//模糊系数
		blur:100,
		//透明度
		alpha:2,
		//模糊类型 0固定模糊  1距离透明度   2反向距离透明度
		blur_type:0
	};
	for(var i in d)
		cfgs[i] = d[i];

	//透明度处理
	cfgs.alpha = cfgs.alpha / cfgs.samp;
	//偏移量计算
	var px = Math.cos(cfgs.rotation);
	var py = Math.sin(cfgs.rotation);

	//渲染一个对象
	var createOne = function(dt){
		var cfg = {
			//模糊序列
			index:0,
			//是否是原图
			isImage:false,
			//固定模糊程度
			blur:null,
			//固定透明度
			alpha:null,
			//是否是辉光
			isLight:false
		};
		for(var i in dt)
			cfg[i] = dt[i];

		//计算偏移
		var index = cfg.index / cfgs.samp;
		var off = index * cfgs.len;
		var alpha = 1;
		if(!dt.isImage){
			if(cfgs.blur_type == 0)
				alpha = cfgs.alpha;
			else if(cfgs.blur_type == 1)
				alpha = (1 - index) * cfgs.alpha;
			else
				alpha = index * cfgs.alpha;
		}

		var re = {
			uid:uuid(),
			type:"sprite",
			attr:{
				res:"roz8ga3kg8"
			},
			body:{
				alpha:cfg.alpha || alpha,
				//坐标
				position:{
					x:cfgs.x + px * off,
					y:cfgs.y + py * off
				}
			},
			//滤镜
			filters:[
				{
					uid:uuid(),
					type:"color-map"
				},
				{
					uid:uuid(),
					type:"blur",
					attr:{
						blur:cfg.blur || index * cfgs.blur
					}
				}
			]
		}

		//如果是原图
		if(cfg.isImage == true)
			re.filters = [
				{
					uid:uuid(),
					type:"inner-light",
					attr:{
						angle:cfgs.rotation
					}
				}
			];

		//如果是辉光
		if(cfg.isLight == true){
			re.body.alpha = 1;
			re.filters = [
				{
					uid:uuid(),
					type:"inner-light",
					attr:{
						angle:cfgs.rotation,
						mode:1
					}
				},
				{
					uid:uuid(),
					type:"blur",
					attr:{
						blur:10
					}
				}
			];
		}

		return re;
	}


	var lays = [];

	//加入阴影
	for(var i = 0;i < cfgs.samp;i++){
		lays.push(createOne({index:i}));
	}

	lays.push(createOne({blur:10,alpha:0.2}));

	lays.push(createOne({isImage:true}));
	lays.push(createOne({isLight:true}));
	lays.push(createOne({isLight:true}));
	lays.push(createOne({isLight:true}));

	renderer.render({
		setting:{
			width:640,
			height:640,
		},
		res:[
			{
				uid:"roz8ga3kg8",
				type:"img",
				target:"img/logo.png"
			}
		],
		stage:{
			childs:lays
		}
	});

}


renderOne();

var r = 0;
var step2 = function(){
	setTimeout(step2,20);
	r++;
	renderOne({rotation:r/30});
}
step2();