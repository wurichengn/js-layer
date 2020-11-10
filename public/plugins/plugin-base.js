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
			selector:function(value,onchange){
				return <input type="file" onchange={function(e){
					//如果
					if(this.files[0] != null)
						onchange(this.files[0]);
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
				{type:"image",name:"图像",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:function(vals){
				return new Promise(function(next,err){
					var reader = new FileReader();
					reader.onload = function(){
						//载入完成
						next({
							//图片
							image:{
								//图片数据
								data:this.result,
								//图片类型
								type:"data-url"
							}
						});
					}
					reader.readAsDataURL(vals.file);
				});
			}
		},
		{
			name:"图层",
			key:"image-layer",
			inputs:[
				{
					name:"图像",
					type:"image",
					key:"images",
					only_link:true,
					//是否是数组输入
					array:true
				}
			],
			//组件的输出
			outputs:[
				{type:"image",name:"图像",key:"image"}
			],
			//渲染时执行  必须要有，需要返回运行结果，可以异步处理。
			render:function(){}
		}
	]
}