var lcg = require("lcg");
var Camera = require("lcg-camera");
var React = lcg.React;


var CMenu = 
module.exports = 
@lcg
class MapContextmenu{
	init(cfgs,d){
		var self = this;

		//配置
		var cfg = {
			x:0,
			y:0,
			main:self
		};
		for(var i in cfgs)
			cfg[i] = cfgs[i];

		//初始化dom
		this.$dom(function(){
			return <div></div>;
		});

		//样式
		var css = {
			"z-index":1,
			"position":"fixed",
			"user-select":"none",
			"left":cfg.x + "px",
			"top":cfg.y + "px",
			"cursor":"default",
			"background-color":"#333",
			"border":"1px solid #000",
			"border-radius":"3px",
			"padding":"2px",
			"width":"max-content",
			"box-shadow":"inset 0px 0px 2px rgba(255,255,255,0.5)",
			">div":{
				"color":"#eee",
				"font-size":"14px",
				"position":"relative",
				"padding":"0px 5px",
				"min-width":"70px",
				">div":{
					"display":"none"
				},
				":hover":{
					"background-color":"#ddd",
					"color":"#000",
					">div":{
						"display":"block"
					}
				}
			}
		};

		//循环加入子菜单
		for(var i in d){
			var div = lcg.$r(<div class="item">{i}</div>);
			if(typeof d[i] == "object")
				div.appendChild(CMenu.new({main:cfg.main},d[i]));
			else if(typeof d[i] == "function"){
				div.cb = d[i];
				div.onclick = function(){
					cfg.main.remove();
					this.cb();
				};
			}
			self._proxy.appendChild(div);
		}

		//主动加入body
		if(cfg.main == self){
			//主动加入到body
			document.body.appendChild(self._proxy);
			self._proxy.oncontextmenu = function(e){
				e.preventDefault();
			}
			//点击屏幕隐藏
			this.message("mousedown",function(e){
				if(lcg.isChild(self._proxy,e.target))
					return;
				self.remove();
			});
		}else{
			//调整样式
			css.position = "absolute";
			css.left = "calc(100%)";
			css.top = "-3px";
		}


		//写入样式
		this.css(css);
	}
}