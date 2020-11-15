var Tools = require("tools");


module.exports = function(map){


	//添加组件
	map.addModule({
		name:"图层",
		menu:["布局/合成","图层"],
		key:"layer-main",
		inputs:[
			{
				name:"图像",
				type:"image",
				key:"images",
				array:true
			},
			{
				name:"宽度",
				type:"float",
				key:"width",
				default:720,
				min:1,
				max:8192,
				step:1
			},
			{
				name:"高度",
				type:"float",
				key:"height",
				default:480,
				min:1,
				max:8192,
				step:1
			}
		],
		outputs:[
			{type:"image",name:"图像",key:"image"}
		],
		init:function(){
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext("2d");
		},
		run:async function(vals){
			var imgs = vals.images;

			//设置尺寸
			this.canvas.width = vals.width;
			this.canvas.height = vals.height;

			//循环绘制图像
			for(var i in imgs){
				var img = await Tools.getImage(imgs[i],"canvas");
				var left = (vals.width - img.width) / 2;
				var top = (vals.height - img.height) / 2;
				this.ctx.drawImage(img.data,left,top);
			}

			return {
				image:{
					data:this.canvas,
					type:"canvas",
					width:vals.width,
					height:vals.height
				}
			};
		}
	});



}