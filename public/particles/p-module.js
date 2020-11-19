var P = require("./p-main.js");
var Tools = require("tools");

module.exports = function(map){

	map.addType({
		//数据类型名
		name:"粒子处理器",
		//类型全局唯一的下标
		key:"particle-core"
	});



	map.addModule({
		//组件名称
		name:"创建粒子处理器",
		//菜单
		menu:["粒子","创建粒子处理器"],
		//组件全局唯一下标
		key:"particle-core-create",
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//初始化执行
		init:function(){
			this.core = new P({});
		},
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			return {
				core:this.core
			}
		}
	});


	map.addModule({
		//组件名称
		name:"粒子发射器",
		//菜单
		menu:["粒子","粒子发射器"],
		//组件全局唯一下标
		key:"particle-send",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector({
				fs:`
				#include pf-main;
				void run(){
					p.position.x += 0.1;
					p.weight = 1.0;
				}
				`
			});
			this.effect.run();
			return vals;
		}
	});



	map.addModule({
		//组件名称
		name:"粒子贴图显示",
		//菜单
		menu:["粒子","粒子贴图显示"],
		//组件全局唯一下标
		key:"particle-texture-show",
		//组件的输入
		inputs:[
			{type:"particle-core",name:"粒子核心",key:"core"}
		],
		//组件的输出
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
		run:function(vals){
			this.effect = this.effect || vals.core.createEffector();
			this.effect.run({
				target:"canvas"
			});
			return {
				image:{
					data:vals.core.canvas,
					type:"canvas",
					width:vals.core.canvas.width,
					height:vals.core.canvas.height
				}
			}
		}
	});

}