var lcg = require("lcg");
var React = lcg.react;



module.exports = function(map){
	map.addType({
		//数据类型名
		name:"图像",
		//类型全局唯一的下标
		key:"image"
	});


	map.addType({
		//数据类型名
		name:"变换矩阵",
		//类型全局唯一的下标
		key:"mat4"
	});


	map.addType({
		//数据类型名
		name:"体素数据",
		//类型全局唯一的下标
		key:"voxel-data"
	});


	map.addType({
		name:"文件",
		key:"file",
		//类型选择器，一个函数返回一个html节点    如果没有这个属性则只能通过节点的形式输入
		selector:function(value,onchange){
			return <input type="file" onchange={function(e){
				//如果
				if(this.files[0] != null)
					onchange(this.files[0]);
			}}/>
		}
	});

	map.addType({
		name:"浮点数",
		key:"float",
		selector:function(value,onchange,cfg,md){
			//数值输入框
			var re = <input value={value} style="width:100%;" type={cfg.input_type || "number"} min={cfg.min} max={cfg.max} step={cfg.step}/>;

			//回调处理
			var callback = function(e){
				//数值化
				var val = Number(this.value);
				//NaN处理
				if(val.toString() == "NaN")
					val = 0;
				//范围限制
				if(cfg.min != null && val < cfg.min)
					val = cfg.min;
				if(cfg.max != null && val > cfg.max)
					val = cfg.max;
				//反向写入
				this.value = val;
				onchange(Number(val));
			}

			//如果是range则根据拖动回调
			if(cfg.input_type == "range"){
				var isd = false;
				re.onmousedown = function(){
					isd = true;
				}
				md.message("mousemove",function(e){
					if(!isd)
						return;
					callback.call(re,e)
				});
				md.message("mouseup",function(e){
					if(!isd)
						return;
					isd = false;
				});
			}else
				re.onchange = callback;

			return re;
		}
	});

	//增加角度专用组件
	map.addModule({
		name:"变量-浮点数(角度)",
		menu:["变量","浮点数(角度)"],
		key:"$$type-vars-float-angle",
		inputs:[
			{type:"float",name:"值",key:"value",use_link:false,input_type:"range",min:0,max:360,step:0.1}
		],
		//组件的输出
		outputs:[
			{type:"float",name:"输出",key:"value"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:async function(vals){
			//输出图层1
			return {value:vals.value};
		}
	});

	map.addType({
		name:"字符串",
		key:"string",
		selector:function(value,onchange,cfg){
			//数值输入框
			var re = <input value={value || ""} style="width:100%;" type="text" onchange={function(e){
				onchange(this.value);
			}}/>;
			return re;
		}
	});

	map.addType({
		name:"颜色",
		key:"color",
		selector:function(value,onchange,cfg){
			//浏览器自带颜色选择器
			return <input value={value} type="color" onchange={function(e){
				onchange(this.value);
			}}/>;
		},
		//输出界面组件扩展
		outputUIExpand:function(md){
			//展示颜色计算结果用dom
			var dom = <z style="display:inline-block;vertical-align:inherit;width:0.8em;height:0.8em;border-radius:2px;background-color:#000;margin-left:4px;box-shadow:0px 0px 2px rgba(255,255,255,0.5);"></z>;
			md.ids["after"].appendChild(dom);
			//运行结束
			md.node.message("run-end",function(dt){
				var color = dt.outputs[md.data.key];
				dom.style["background-color"] = color;
			});
		}
	});
}