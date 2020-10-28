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
uniform vec3 color;
void main(void)
{
	float a = texture2D(uSampler,vTextureCoord).a;
	gl_FragColor = vec4(color * a,a);
}
	`;

	//代理滤镜对象
	var p = this.proxy(new PIXI.Filter(null,fs));

	//同步方法
	p.sync = function(dt){
		dt.attr = dt.attr || {};
		//写入角度
		p.uniforms["color"] = dt.attr["color"];
	}
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
//光照强度
uniform float iStr;

//光照颜色
vec4 light_color = vec4(1,1,1,1);

//整圆角度
const float DOUBLE_PI = 3.14159265358979323846264 * 2.0;
//角度采样次数
const float COUNT_ANGLE = 12.0;
//深度采样次数
const float COUNT_LENGTH = 3.0;
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
	samp_val = samp_val / COUNT_ANGLE / COUNT_LENGTH * iStr;
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
		dt.attr = dt.attr || {};
		//写入角度
		var angle = dt.attr["angle"];
		if(angle == null)
			angle = 0;
		angle = ((angle / (Math.PI * 2)) % 1) * (Math.PI * 2);
		p.uniforms["iAngle"] = angle;
		p.uniforms["iStr"] = dt.attr.str;
		p.uniforms["iMode"] = dt.attr.mode || 0;
		p.padding = 5;
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






//方向性阴影
Filters["line-shadow"] = lcg.bind(function(d,main){
	var self = this;

	//片元着色器
	var fs = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 thickness;
//光线角度
uniform float iAngle;
//阴影距离
uniform float iLen;
//深度采样次数
uniform float iLenSamp;
//发散角度
uniform float iAngleFade;
//减淡深度
uniform float iFade;
//阴影浓度
uniform float iAlpha;
//是否是内阴影
uniform float iInner;

//π
const float PI = 3.14159265358979323846264;
//角度采样次数
const float COUNT_ANGLE = 24.0;

//命中值
float mitValue = 1.0;

//是否命中像素
bool mitPix(vec2 p){
	vec4 color = texture2D(uSampler,p);
	if(color.a == mitValue)
		return true;
	return false;
}


//投射一个角度
vec2 rayTestOne(float angle){
	//当前采样点
	vec2 p = vTextureCoord;
	//当前命中权重
	float weight = 0.0;
	
	//计算步长
	vec2 step = vec2(cos(angle) * thickness.x,sin(angle) * thickness.y) * iLen / iLenSamp;

	//循环采样
	float len = 0.0;
	for(float i = 1.0;i <= 500.0;i++){
		if(i > iLenSamp)
			break;
		len++;
		//步进
		p += step;
		if(mitPix(p))
			weight += 1.0;
		//如果权足够则停止采样
		if(weight >= 1.0)
			break;
	}

	//距离比例
	float bl = len / iLenSamp;
	if(iFade <= 0.0)
		bl = 1.0;
	else
		bl = min(1.0,(1.0 - bl) / iFade);

	return vec2(weight * bl,len * iLen / iLenSamp);
}

void main(void)
{
	//内阴影逻辑转换
	if(iInner > 0.0)
		mitValue = 0.0;

	//如果在内部则不处理
	if(mitPix(vTextureCoord)){
		gl_FragColor = vec4(0,0,0,0);
		return;
	}

	//当前点权重
	float weight = 0.0;

	//无角度则单采样
	if(iAngleFade == 0.0)
		weight = rayTestOne(iAngle).x;
	else{
		//当前角度
		float angle;
		float sangle = iAngle - iAngleFade / 2.0;
		float cangle = iAngleFade / COUNT_ANGLE;
		//有角度则多采样
		for(float i = 0.0;i <= COUNT_ANGLE;i++){
			angle = sangle + cangle * i;
			weight += rayTestOne(angle).x / COUNT_ANGLE * (1.0 - abs(i - COUNT_ANGLE / 2.0) / COUNT_ANGLE);
			if(weight >= 1.0)
				break;
		}
	}

	//内阴影边缘处理
	if(iInner > 0.0)
		weight *= texture2D(uSampler,vTextureCoord).a;
	else
		weight *= 1.0 - texture2D(uSampler,vTextureCoord).a;

	//着色
	gl_FragColor = vec4(vec3(0,0,0),weight * iAlpha);
}
	`;

	//代理滤镜对象
	var p = this.proxy(new PIXI.Filter(null,fs));

	//同步方法
	p.sync = function(dt){
		dt.attr = dt.attr || {};
		//写入角度
		var angle = dt.attr["angle"];
		if(angle == null)
			angle = 0;
		angle = angle + Math.PI;
		angle = ((angle / (Math.PI * 2)) % 1) * (Math.PI * 2);
		p.uniforms["iAngle"] = angle;
		p.uniforms["iLen"] = dt.attr["len"] || 0;
		p.uniforms["iLenSamp"] = dt.attr["len_samp"] || 10;
		p.uniforms["iFade"] = dt.attr["fade"] || 0;
		p.uniforms["iAngleFade"] = dt.attr["angle_fade"] || 0;
		p.uniforms["iAlpha"] = (dt.attr["alpha"] == null)?1:dt.attr["alpha"];
		p.uniforms["iInner"] = dt.attr["inner"];
		p.padding = p.uniforms["iLen"];
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




//方向性颜色叠加
Filters["line-color"] = lcg.bind(function(d,main){
	var self = this;

	//片元着色器
	var fs = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
//光线角度
uniform float iAngle;

void main(void)
{
	vec4 color = texture2D(uSampler,vTextureCoord);
	if(color.a <= 0.0){
		gl_FragColor = vec4(0,0,0,0);
		return;
	}
	//计算渐变比例
	vec2 angle = vec2(cos(iAngle),sin(iAngle));
	float v = 0.5 - dot(angle,vTextureCoord - 0.5);
	v = max(0.0,min(1.0,v * 0.7));

	//目标混合颜色rgb
	vec3 end;

	//计算颜色
	if(v > 0.5){
		end = vec3(
			color.r + (2.0 * v - 1.0) * (color.r - color.r * color.r),
			color.g + (2.0 * v - 1.0) * (color.g - color.g * color.g),
			color.b + (2.0 * v - 1.0) * (color.b - color.b * color.b)
		);
	}else{
		end = vec3(
			color.r + (2.0 * v - 1.0) * (sqrt(color.r) - color.r),
			color.g + (2.0 * v - 1.0) * (sqrt(color.g) - color.g),
			color.b + (2.0 * v - 1.0) * (sqrt(color.b) - color.b)
		);
	}

	gl_FragColor = vec4(end,color.a);
}
	`;

	//代理滤镜对象
	var p = this.proxy(new PIXI.Filter(null,fs));

	//同步方法
	p.sync = function(dt){
		dt.attr = dt.attr || {};
		//写入角度
		p.uniforms["iAngle"] = dt.attr["angle"] || 0;
	}

});