


//glsl预处理工具
module.exports = function(){

	//库包
	var Librarys = {};

	//添加库
	this.addLib = function(key,lib){
		Librarys[key] = jaxLine(lib);
	}

	//生产一段glsl
	this.build = function(str){
		return buildOne(jaxLine(str));
	}



	//======分析一段代码逻辑======
	var buildOne = function(pack,root){
		var isRoot = false;
		if(root == null)
			isRoot = true;
		//全局数据
		root = root || {
			version:null,
			main:null,
			includes:{}
		};

		//当前代码
		var code = pack.code;

		//覆写版本和main
		if(root.main == null && pack.main != null)
			root.main = pack.main;
		if(root.version == null && pack.version != null)
			root.version = pack.version;

		//引入库处理
		for(var i in pack.includes){
			var include = pack.includes[i];
			//防止重复引入
			if(root.includes[include.lib])
				continue;
			root.includes[include.lib] = true;
			if(Librarys[include.lib] == null)
				throw new Error("引入了没有定义的资源["+include.lib+"]");
			//加载库
			var subCode = buildOne(Librarys[include.lib],root);
			code = code.replace(new RegExp(`\\{\\{include\\:${include.lib}\\}\\}`,"g"),subCode);
		}

		//如果全局返回
		if(isRoot){
			//加入版本和主函数
			if(root.version)
				code = root.version + "\n" + code;
			if(root.main)
				code = code + "\n" + root.main;
			//去掉连续换行
			code = code.replace(/\n{3,}/g,"\n\n");
		}

		return code;
	}


	//行拆分
	var jaxLine = function(str){
		//拆行
		var lines = str.split("\n");

		//处理结果
		var re = {
			//引入表
			includes:[],
			//版本定义
			version:null,
			//代码块
			code:"",
			//主函数 如果定义了主函数则会放到最后
			main:null
		};

		//循环处理每行
		for(var i in lines){
			//获取行
			var line = lines[i].replace(/^\s+/g,"");
			//分词
			var words = line.match(/[a-zA-Z0-9_-]+|\(|\)|\{|\}|\s|\#|.;/g) || [];
			//如果是版本定义
			if(words[0] == "#" && words[1] == "version"){
				re.version = line;
				continue;
			}
			//如果是主函数
			if(words[2] == "main" && (words[3] == "(" || words[4] == "(")){
				var main = [];
				for(var j = i;j < lines.length;j++){
					main.push(lines[j]);
				}
				re.main = main.join("\n");
				break;
			}
			//如果是引入
			if(words[0] == "#" && words[1] == "include"){
				re.includes.push({lib:words[3]});
				lines[i] = "{{include:"+words[3]+"}}";
			}
			//如果是代码块
			re.code += "\n" + lines[i];
		}

		return re;
	}

}