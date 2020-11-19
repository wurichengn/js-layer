var GP = require("glsl-pack");

var gp = module.exports = new GP();


//粒子核心处理逻辑
gp.addLib("pf-main",
`#version 300 es
precision highp float;

//UV
in vec2 vUV;

//粒子信息结构体
struct Particle {
	//坐标
    vec3 position;
    //速度
    vec3 velocity;
    //加速度
   	vec3 gravity;
   	//权重
   	float weight;
   	//生存时间
   	float life;
} p;

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

//输出层
layout (location = 0) out vec4 oPs;
layout (location = 1) out vec4 oVs;
layout (location = 2) out vec4 oGs;


void main(){
	//粒子下标
	float index = gl_FragCoord.y * uSize.x + gl_FragCoord.x;

	//如果超出限制则清空
	if(index >= uCount){
		oGs = oVs = oPs = vec4(0.5,0.5,0.5,1.0);
		return;
	}

	//读取顶点数据
	vec4 cp = texture(uPs,vUV);
	vec4 cv = texture(uVs,vUV);
	vec4 cg = texture(uGs,vUV);

	//写入粒子数据
	p.position = cp.rgb;
	p.velocity = cv.rgb;
	p.gravity = cg.rgb;
	p.weight = cp.a;
	p.life = cv.a;

	//运行逻辑
	run();

	//输出粒子数据
	oPs = vec4(p.position,p.weight);
	oVs = vec4(p.velocity,p.life);
	oGs = vec4(p.gravity,1.0);
}
`);