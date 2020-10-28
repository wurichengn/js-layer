var Renderer = require("renderer");
var Draws = require("draws");
var renderer = window.renderer = new Renderer();
//renderer.view.style["opacity"] = 0.1;
document.body.appendChild(renderer.view);
var dat = require("dat.gui");
var Camera = require("lcg-camera");

//当前状态
var states = new Camera({
	//宽度
	width:1600,
	//高度
	height:720,
	//内阴影
	inner:false,
	//缩放
	scale:1,
	//角度
	rotation:45,
	//背景色
	background_color:[0x00,0x98,0xd8],//0x0098d8,
	//阴影距离
	len:120,
	//阴影采样数量
	samp:100,
	//距离淡化
	fade:1,
	//发散角度
	angle_fade:30,
	//阴影能见度
	alpha:0.65,
	//开启边缘光照
	useLight:true,
	//是否使用辉光
	useGlow:true,
	//光照强度
	lightStr:10,
	//辉光强度
	glowStr:3
});

var gui = new dat.GUI({name:"参数"});
gui.add(states,"width",240,1920,1).name("画布宽度");
gui.add(states,"height",240,1920,1).name("画布高度");
gui.add(states,"scale",0.2,5,0.01).name("缩放");
gui.add(states,"inner").name("内阴影");
gui.add(states,"rotation",0,360,0.1).name("投射角度");
gui.addColor(states,"background_color").name("背景色");
gui.add(states,"len",0,300,1).name("阴影长度");
gui.add(states,"samp",10,250,1).name("阴影采样数");
gui.add(states,"fade",0,1,0.01).name("淡化比例");
gui.add(states,"angle_fade",0,30,0.1).name("发散角度");
gui.add(states,"alpha",0,1,0.01).name("阴影能见度");
gui.add(states,"useLight").name("边缘光照");
gui.add(states,"lightStr",0,20,0.1).name("光照强度");
gui.add(states,"useGlow").name("辉光");
gui.add(states,"glowStr",0,10,1).name("辉光强度");


//渲染一次
var renderOne = async function(d){

	var uid_index = 0;

	var uuid = function(){
		uid_index++;
		return "UID-"+uid_index;
	}

	//起始坐标
	var cfgs = {
		//是否是内阴影
		inner:false,
		//尺寸
		width:640,
		height:640,
		//缩放
		scale:1,
		//光线角度
		rotation:Math.PI / 4,
		//阴影距离
		len:200,
		//采样数
		samp:10,
		//距离淡化
		fade:0.6,
		//发散角度
		angle_fade:30,
		//是否使用光照
		useLight:true,
		//是否添加辉光
		useGlow:true,
		//光照强度
		lightStr:10,
		//辉光强度
		glowStr:3,
		//背景色
		background_color:0x0098d8
	};
	for(var i in d)
		cfgs[i] = d[i];

	var c = cfgs.background_color;

	//透明度处理
	//cfgs.alpha = cfgs.alpha / cfgs.samp;
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

		var re = {
			uid:uuid(),
			type:"sprite",
			attr:{
				res:"roz8ga3kg8",
				anchor:{x:0.5,y:0.5}
			},
			body:{
				//alpha:alpha,
				scale:{x:cfgs.scale,y:cfgs.scale},
				//坐标
				position:{
					x:cfgs.width / 2,//cfgs.x + px * off,
					y:cfgs.height / 2,//cfgs.y + py * off
				}
			},
			//滤镜
			filters:[
				{
					uid:uuid(),
					type:"line-shadow",
					attr:{
						angle:cfgs.rotation,
						len:cfgs.len,
						len_samp:cfgs.samp,
						fade:cfgs.fade,
						angle_fade:cfgs.angle_fade,
						alpha:cfgs.alpha,
						inner:cfgs.inner
					}
				}
			]
		}

		//如果是原图
		if(cfg.isImage == true){
			re.filters = [];
			if(cfgs.useLight)
				re.filters = [
					{
						uid:uuid(),
						type:"color-map",
						attr:{
							color:[c[0] / 255,c[1] / 255,c[2] / 255]
						}
					},
					{
						uid:uuid(),
						type:"line-color",
						attr:{
							angle:cfgs.rotation
						}
					},
					{
						uid:uuid(),
						type:"inner-light",
						attr:{
							angle:cfgs.inner?(cfgs.rotation + Math.PI):cfgs.rotation,
							str:cfgs.lightStr,
						}
					}
				];
		}

		//如果是辉光
		if(cfg.isLight == true){
			re.body.alpha = 1;
			re.filters = [
				{
					uid:uuid(),
					type:"inner-light",
					attr:{
						angle:cfgs.inner?(cfgs.rotation + Math.PI):cfgs.rotation,
						str:cfgs.lightStr,
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

	for(var i in c)
		c[i] = Math.floor(c[i]);
	var lays = [{
		uid:uuid(),
		type:"rect-full",
		attr:{color:c[0] * 256 * 256 + c[1] * 256 + c[2]},
		filters:[
			{
				uid:uuid(),
				type:"line-color",
				attr:{
					angle:cfgs.rotation
				}
			}
		]
	}];

	//加入阴影
	//lays.push(createOne({}));

	//加入固定阴影
	//lays.push(createOne({blur:10,alpha:0.2}));

	//加入原图
	lays.push(createOne({isImage:true}));

	//加入阴影
	lays.push(createOne({}));
	
	//加入辉光
	if(cfgs.useGlow){
		for(var i = 0;i < cfgs.glowStr;i++)
			lays.push(createOne({isLight:true}));
	}

	await renderer.render({
		setting:{
			width:cfgs.width,
			height:cfgs.height,
		},
		res:[
			{
				uid:"roz8ga3kg8",
				type:"img",
				target:"img/text2.png"
			}
		],
		stage:{
			childs:lays
		}
	});

}

//渲染计时器
var needUpdate = true;
var step = async function(){
	try{
		if(needUpdate){
			//数据处理
			var data = states.$get();
			data.rotation = data.rotation / 180 * Math.PI;
			data.angle_fade = data.angle_fade / 180 * Math.PI;
			//背景色处理
			renderer.view.style["background-color"] = data.background_color;
			//渲染
			await renderOne(data);
		}
	}catch(e){console.error(e);}
	needUpdate = false;
	setTimeout(step,20);
}
step();


states.$listen(function(){
	needUpdate = true;
});