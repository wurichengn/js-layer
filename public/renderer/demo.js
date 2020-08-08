

function(){

	//渲染时传递的JSON:
	var renderData = {
		//================================
		//============渲染设置============
		//================================
		//渲染时的一些配置，如果不填则会缺审为下值
		setting:{
			//场景宽高
			width:320,
			height:320,
			//渲染时是否先清空属性，如果不清空缺审则为之前状态
			clear_attr:false,
			//开启的渲染功能（通过配置渲染功能调整渲染效率）
			opens:{
				//是否渲染效果器
				effect:true,
				//是否渲染滤镜
				filter:false,
				//是否渲染前置层
				bfore_layer:false,
				//是否渲染后置层
				after_layer:false
			}
		},
		//==============================
		//============资源表============
		//==============================
		//保存需要用到的外部资源，贴图等，场景会从这里引用资源
		//如果没有资源表且有对象引入资源则会渲染失败
		res:[
			//一个资源
			{
				//资源的项目唯一编号   字符串
				uid:"roz8ga3kg8",
				//资源类型  img图像
				type:"img",
				//图像目标  img路径 | img标签 | canvas标签 | base64字符串 | 
				target:"img/head.jpg"
			}
		],
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
					//对象的滤镜
					//这里仅表示可以直接通过着色器实现的效果 由pixi.js的滤镜实现
					filters:[
						//每个对象是一个效果，最终会按照顺序执行每一个效果
						{
							//效果的唯一标识符  字符串
							uid:"d8gb63mfpz7",
							//效果类型  这里根据注册的效果器决定具体功能 具体实现由注册时完成
							//这里是模糊效果器
							type:"blur",
							//效果器参数
							attr:{
								//模糊强度
								blur:4
							}
						}
					],
					//对象的效果 
					//这里的效果是可以更多样化的形式处理图像的一种功能
					//执行效率将大大低于滤镜的效率，且会增加内存占用率，所以尽量使用着色器实现效果
					//将通过提取现有渲染结果给指定函数运行，并等待返回处理结果的形式完成
					//效果一定会在效果器后执行
					effects:[
						//每个对象是一个效果器
						{
							//滤镜的唯一标识符  字符串
							uid:"g7a5gba9ngl",
							//滤镜类型  这里根据注册的滤镜决定具体功能 具体实现由注册时完成
							//这里是波点滤镜
							type:"wave-point",
							//滤镜参数
							attr:{
								//波点计算尺寸
								size:10
							}
						}
					],
					//前置层 
					//前置层在图层特效、滤镜渲染结束后会进行额外的绘制并叠加，用于制作简单克隆效果
					//可以额外使用滤镜以及效果器
					//显示在原始图层的下方
					bfore_layer:[
						{
							//前置层的唯一标识符  字符串
							uid:"g8h5sl25b7l",
							//对象参数  这里是前置层相对于
							body:{
								position:{
									x:-3,
									y:-3
								}
							}
						}
					],
					//后置层
					//与前置层相同，但是显示在原始图层的上方
					after_layer:[]
				}
			]
		}
	}

}