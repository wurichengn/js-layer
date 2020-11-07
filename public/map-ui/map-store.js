


//初始化一个图的界面的状态机
module.exports = function(){
	return {
		//激活状态表
		states:{
			//临时线条
			activeLine:null,
			//当前输出接口的节点
			activeOutputNode:null
		}
	};
}