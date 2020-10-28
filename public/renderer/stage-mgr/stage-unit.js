var lcg = require("lcg");
var Builders = require("../builder/builder-main.js");
var Filters = require("../filter/filter-main.js");


//======场景单位对象======
var Unit = 
module.exports = 
@lcg
class StageUnit{
	init(d,main,target){
		var self = this;

		//======初始化层面======
		//内容渲染层
		var input_layer = this.input_layer = new PIXI.Container();
		//子内容层
		var child_layer = this.child_layer = new PIXI.Container();
		//特殊渲染时需要进行操作的临时渲染层
		var render_layer = this.render_layer = new PIXI.Container();

		//初始化属性
		this.attr = {};

		//如果有代理目标
		if(target)
			this.proxy(target);
		else{
			this.proxy(new PIXI.Container());
			if(Builders[d.type] == null)
				console.warn("没有找到["+d.type+"]生成器");
			else
				this.extend(Builders[d.type],d,main);
		}
		var p = this._proxy;

		//加入内容层
		p.addChild(input_layer);
		//默认加入子节点层
		p.addChild(child_layer);
		

		//记录uid和类型
		p.uid = d.uid;
		p.type = d.type;

		//滤镜表
		var filters = p.filters = [];
		//特效表
		var effects = [];


		//=============同步相关实现================

		//同步状态
		p.sync = function(dt){
			//同步矩阵变换
			syncBody(dt.body);
			//同步子节点
			syncChilds(dt.childs);
			//同步属性
			lcg.copyJSON(dt.attr,self.attr,true);
			//同步渲染状态
			self.sendMessage("unit-sync",dt);
			//同步效果器
			syncFilters(dt.filters);

			//判断是否需要临时渲染
			isNeedsRender();
		}

		//同步矩阵变换
		var syncBody = function(body){
			if(body == null)
				return;
			//同步坐标
			if(body.position != null){
				p.position.x = body.position.x;
				p.position.y = body.position.y;
			}
			//同步中心点坐标
			if(body.pivot != null){
				p.pivot.x = body.pivot.x;
				p.pivot.y = body.pivot.y;
			}
			//同步缩放
			if(body.scale != null){
				p.scale.x = body.scale.x;
				p.scale.y = body.scale.y;
			}
			//同步旋转
			if(body.rotation != null)
				p.rotation = body.rotation;
			//同步可视
			if(body.visible != null)
				p.visible = body.visible;
			//同步透明度
			if(body.alpha != null)
				p.alpha = body.alpha;
		}

		//同步子节点
		var syncChilds = async function(datas){
			datas = datas || [];
			var children = child_layer.children;

			//循环更新每项
			for(var i = 0;i < datas.length;i++){
				var dt = datas[i];
				//如果是替换
				if(children[i] && (children[i].type != dt.type || children[i].uid != dt.uid)){
					child_layer.removeChild(children[i]);
					child_layer.addChildAt(Unit.new(dt,main),i);
				}
				//如果需要创建
				if(children[i] == null){
					child_layer.addChild(Unit.new(dt,main));
				}
				//同步子节点
				if(children[i].sync)
					children[i].sync(dt);
			}

			//移除多余节点
			for(var i = datas.length;i < children.length;i++){
				child_layer.removeChildAt(i);
			}
		}

		//同步滤镜
		var syncFilters = function(datas){
			if(datas == null)
				return;
			for(var i = 0;i < datas.length;i++){
				var dt = datas[i];
				//如果是替换
				if(filters[i] && (filters[i].type != dt.type || filters[i].uid != dt.uid)){
					filters.splice(i,1,Filters[dt.type].new(dt));
				}
				//如果需要创建
				if(filters[i] == null)
					filters.push(Filters[dt.type].new(dt));
				//同步滤镜
				if(filters[i].sync)
					filters[i].sync(dt);
			}

			//移除多余滤镜
			filters.splice(datas.length,100000);
		}

		//判断是否需要临时渲染
		var isNeedsRender = function(){
			//if(child_layer.children.length > 0)
			//	main.addRender(self);
		}



		//==================额外渲染操作实现===================
		this.render = async function(){

		}
	}
}