var lcg = require("lcg");


var Filters = require("./filter-main.js");




//======模糊滤镜======
Filters["blur"] = lcg.bind(function(d,main){
	var self = this;

	//代理模糊滤镜
	var p = this.proxy(new PIXI.filters.BlurFilter(8,12,1,15));

	//同步
	p.sync = function(dt){
		if(dt.attr == null)
			return;
		for(i in dt.attr)
			p[i] = dt.attr[i];
	}

});


//颜色叠加
Filters["color-map"] = lcg.bind(function(d,main){
	var self = this;

	//片元着色器
	var fs = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
void main(void)
{
   gl_FragColor = vec4(0,0,0,texture2D(uSampler,vTextureCoord).a);
}
	`;

	//代理滤镜对象
	var p = this.proxy(new PIXI.Filter(null,fs));
});



//内发光
Filters["inner-light"] = lcg.bind(function(d,main){
	var self = this;

	//片元着色器
	var fs = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 thickness;
//光线角度
uniform float iAngle;
//光线模式
uniform float iMode;

//光照颜色
vec4 light_color = vec4(1,1,1,1);

//整圆角度
const float DOUBLE_PI = 3.14159265358979323846264 * 2.0;
//角度采样次数
const float COUNT_ANGLE = 36.0;
//深度采样次数
const float COUNT_LENGTH = 5.0;
//总深度
const float LENGTH = 6.0;

//获取角度差值
float getAngleL(float a1,float a2){
	float a_max = max(a1,a2);
	float a_min = min(a1,a2);
	float val = min(abs(a_max - a_min),abs(a_max - a_min - DOUBLE_PI));
	val = -val / DOUBLE_PI * 4.0 + 1.0;
	if(val > 0.0)
		val = val * val;
	else
		val = -val * val;
	//val = max(0.0,val - 0.3) / 0.7;
	return val;
}

void main(void)
{
	//当前颜色
	vec4 color = texture2D(uSampler,vTextureCoord);
	//当前采样点坐标
	vec2 samp_pos;
	//采样点颜色
	vec4 samp_color;
	//光照权重强度
	float samp_val = 0.0;
	//采样角度
	float angle;
	//采样深度
	float length;
	//深度权重
	float samp_val_len;
	//角度权重
	float samp_val_angle;

	//透明部分直接返回
	if(color.a <= 0.0){
		gl_FragColor = color;
		return;
	}

	//开始循环深度采样
	for(float j = 0.0;j < COUNT_LENGTH;j += 1.0){
		length = 1.0 - LENGTH * j / COUNT_LENGTH;
		samp_val_len = (j + 1.0) / COUNT_LENGTH;
		samp_val_len = samp_val_len * samp_val_len;
		//开始循环角度采样
		for(float i = 0.0;i < COUNT_ANGLE;i += 1.0){
			angle = DOUBLE_PI * i / COUNT_ANGLE;
			//计算角度权重
			samp_val_angle = getAngleL(angle,iAngle);
			//计算采样点坐标
			vec2 samp_pos = vec2(
				vTextureCoord.x + thickness.x * cos(angle) * length,
				vTextureCoord.y + thickness.y * sin(angle) * length
			);
			samp_color = texture2D(uSampler, samp_pos);
			samp_val += max(color.a - samp_color.a,0.0) * samp_val_len * samp_val_angle;
		}
	}

	//强度计算
	samp_val = samp_val / COUNT_ANGLE / COUNT_LENGTH * 10.0;
	if(samp_val > 1.0)
		samp_val = 1.0;
	samp_val = samp_val * color.a;

	//如果光照模式是纯光照
	if(iMode == 1.0){
		gl_FragColor = light_color * samp_val;
		return;
	}

	//混合颜色
	if(samp_val >= 0.0)
		gl_FragColor = vec4(color * (1.0 - samp_val) + light_color * samp_val);
	else{
		samp_val = -samp_val / color.a * 0.5;
		gl_FragColor = vec4(color * (1.0 - samp_val) + vec4(0,0,0,1) * samp_val);
	}
}
	`;

	//代理滤镜对象
	var p = this.proxy(new PIXI.Filter(null,fs));

	//同步方法
	p.sync = function(dt){
		//写入角度
		var angle = dt.attr["angle"];
		if(angle == null)
			angle = 0;
		angle = ((angle / (Math.PI * 2)) % 1) * (Math.PI * 2);
		p.uniforms["iAngle"] = angle;
		p.uniforms["iMode"] = dt.attr.mode || 0;
	}

	//写入像素尺寸
	p.uniforms.thickness = new Float32Array([0, 0]);

	//更新像素尺寸
	p.apply = function(filterManager, input, output, clear){
		p.uniforms.thickness[0] = 1 / input._frame.width;
        p.uniforms.thickness[1] = 1 / input._frame.height;
        filterManager.applyFilter(p, input, output, clear);
	}
});