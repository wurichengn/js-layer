

function(){

	//层结构渲染传递的JSON:
	var layerData = {
		//============渲染设置============
		//同renderer
		setting:{},
		//============资源表============
		//同renderer
		res:[],
		//============================
		//============场景============
		//============================
		//整个渲染内容的结构，最终将根据这个结构渲染一帧内容，是必须的
		stage:{
			//根层子节点
			childs:[
				//一个层对象
				{
					//对象的唯一标识符    字符串
					uid:"ajvtboa2h5",
					//对象类型   null空层   sprite基本图像类型    也可以是其他已注册的层对象
					type:"sprite",
					//对象的参数，根据不同类型可能会有不同的参数
					attr:{
						//图像引用的资源id
						res:"roz8ga3kg8"
					},
					//对象参数  影响最终的显示效果
					//值可以没有，没有则缺审为以下值或之前值
					//实际上对象的矩阵变换是在所有操作之后进行的
					body:{
						//坐标
						position:{
							x:0,
							y:0
						},
						//中心点坐标
						pivot:{
							x:0,
							y:0
						},
						//旋转
						rotation:0,
						//缩放
						scale:{
							x:1,
							y:1
						},
						//是否显示
						visible:true,
						//透明度
						alpha:1
					},
					//子对象
					//对象的子节点集合，每一项都是一个对象
					//子对象绘制完毕后会在当前对象中叠加，然后才会开始应用效果器
					childs:[],
					//效果器
					effects:[
						//每个对象是一个效果器
						{
							//效果器的唯一标识符  字符串
							uid:"g7a5gba9ngl",
							//效果器类型
							type:"wave-point",
							//效果器参数
							attr:{
								//波点计算尺寸
								size:10
							}
						}
					]
				}
			]
		}
	}

}