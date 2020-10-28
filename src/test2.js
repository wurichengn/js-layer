var Renderer = require("renderer");
var Draws = require("draws");
var renderer = window.renderer = new Renderer();
document.body.appendChild(renderer.view);
var dat = require("dat.gui");
var Camera = require("lcg-camera");

//当前状态
var states = new Camera({
	//角度
	rotation:0,
	//背景色
	background_color:0x0098d8,
	//阴影距离
	len:80,
	//阴影采样数量
	samp:50,
	//模糊程度
	blur:30,
	//模糊类型
	blur_type:0,
	//阴影能见度
	alpha:2,
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
gui.add(states,"rotation",0,360,0.1).name("投射角度");
gui.addColor(states,"background_color").name("背景色");
gui.add(states,"len",0,300,1).name("阴影长度");
gui.add(states,"samp",10,150,1).name("阴影采样数");
gui.add(states,"blur",0,300,1).name("模糊程度");
gui.add(states,"blur_type",0,2,1).name("模糊类型");
gui.add(states,"alpha",0,10,0.1).name("阴影能见度");
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
		//图像基本坐标
		x:100,
		y:100,
		//光线角度
		rotation:Math.PI / 4,
		//阴影距离
		len:200,
		//采样数
		samp:10,
		//模糊系数
		blur:200,
		//透明度
		alpha:2,
		//模糊类型 0固定模糊  1距离透明度   2反向距离透明度
		blur_type:0,
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
				//alpha:cfg.alpha || alpha,
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
					type:"line-shadow",
					attr:{
						angle:cfgs.rotation,
						len:cfgs.len,
						len_samp:cfgs.samp
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
						type:"inner-light",
						attr:{
							angle:cfgs.rotation,
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
						angle:cfgs.rotation,
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


	var lays = [{
		uid:uuid(),
		type:"rect-full",
		attr:{color:cfgs.background_color}
	}];

	//加入阴影
	lays.push(createOne({}));

	//加入固定阴影
	//lays.push(createOne({blur:10,alpha:0.2}));

	//加入原图
	lays.push(createOne({isImage:true}));
	
	//加入辉光
	if(cfgs.useGlow){
		for(var i = 0;i < cfgs.glowStr;i++)
			lays.push(createOne({isLight:true}));
	}

	await renderer.render({
		setting:{
			width:640,
			height:640,
		},
		res:[
			{
				uid:"roz8ga3kg8",
				type:"img",
				target:"img/text.png"
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