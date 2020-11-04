var lcg = require("lcg");
var React = lcg.react;


module.exports = {
	//扩展数据类型
	types:[
		//一个数据类型
		{
			//数据类型名
			name:"图像",
			//类型全局唯一的下标
			key:"image"
		},
		{
			name:"文件",
			key:"file",
			//类型选择器，一个函数返回一个html节点    如果没有这个属性则只能通过节点的形式输入
			selecter:function(value,onchange){
				return <input type="file" onchange={function(e){
					//如果
					if(this.file != null)
						onchange(this.file)
				}}/>
			}
		}
	],
	//扩展组件
	modules:[
		//一个组件的内容
		{
			//组件名称
			name:"选择本地图片",
			//组件全局唯一下标
			key:"image-file-select",
			//组件的输入 - 可以分组
			inputs:[
				{
					//输入名称
					name:"图片文件",
					//输入类型
					type:"file",
					//输入下标
					key:"file",
					//输入是否只能通过关联输入，开启后无法在参数页进行输入
					only_link:false
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"图像"},
				{type:"image",name:"图像"}
			],
			//初始化执行  不支持异步
			init:function(){},
			//数据改变时执行，最初也会执行一次  不支持异步，只做通知用
			data_change:function(){},
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:function(){}
		}
	]
}