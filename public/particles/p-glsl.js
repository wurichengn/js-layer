var GP = require("glsl-pack");

var gp = module.exports = new GP();



//结构体以及uniform定义
gp.addLib("base-data",
`#version 300 es
precision highp float;

//粒子信息结构体
struct Particle {
	//坐标
    vec3 position;
    //速度
    vec3 velocity;
    //加速度
   	vec3 gravity;
   	//颜色
   	vec4 color;
   	//权重
   	float weight;
   	//生存时间
   	float life;
};

//尺寸
uniform vec2 uSize;
//随机种子
uniform float uRandSeed;
//粒子数量
uniform float uCount;
//输入层
uniform sampler2D uPs;
uniform sampler2D uVs;
uniform sampler2D uGs;
uniform sampler2D uCs;

//根据UV获取粒子
Particle getParticleOfUV(vec2 uv){
	//读取顶点数据
	vec4 cp = texture(uPs,uv);
	vec4 cv = texture(uVs,uv);
	vec4 cg = texture(uGs,uv);
	vec4 cc = texture(uCs,uv);

	//写入粒子数据
	Particle p;
	p.position = cp.rgb;
	p.velocity = cv.rgb;
	p.gravity = cg.rgb;
	p.weight = cp.a;
	p.life = cv.a;
	p.color = cc;

	//返回粒子
	return p;
}

//根据序号获取粒子
Particle getParticleOfIndex(float index){
	//序号算uv
	vec2 uv = vec2(0,0);
	uv.x = mod(index,uSize.x);
	uv.y = (index - mod(index,uSize.x)) / uSize.x;
	uv.x = uv.x / uSize.x;
	uv.y = uv.y / uSize.y;
	return getParticleOfUV(uv);
}
`)







//粒子核心处理逻辑
gp.addLib("pf-main",
`#version 300 es

//基本定义
#include base-data;

//UV
in vec2 vUV;

//输出层
layout (location = 0) out vec4 oPs;
layout (location = 1) out vec4 oVs;
layout (location = 2) out vec4 oGs;
layout (location = 3) out vec4 oCs;

//当前点的序号
float _index;
//全局粒子
Particle p;

//随机数自增值
float _randSeed = 0.0;
//随机数
float rand(){
	_randSeed++;
    return fract(sin(dot(vec2((uRandSeed * 9314.5472 + _randSeed)/5298.3752,(_index)/5821.5482 + 5.725) ,vec2(12.9898,78.233))) * 43758.5453);
}


void main(){
	//粒子下标
	_index = gl_FragCoord.y * uSize.x + gl_FragCoord.x;

	//如果超出限制则清空
	if(_index >= uCount){
		oGs = oVs = oPs = vec4(0.5,0.5,0.5,1.0);
		return;
	}

	//获取粒子
	getParticleOfUV(vUV);

	//运行逻辑
	run();

	//输出粒子数据
	oPs = vec4(p.position,p.weight);
	oVs = vec4(p.velocity,p.life);
	oGs = vec4(p.gravity,1.0);
	oCs = p.color;
}
`);