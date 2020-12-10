axios.get("res/testSeries.dat",{responseType: 'blob' }).then(async function(res){
	console.log(res);
	var buffer = await new Response(res.data).arrayBuffer();//re.data.arrayBuffer();
	var data = pako.inflate(buffer);

	//数据转换
	var reBuf = new ArrayBuffer(512 * 512 * 472 * 2);
	var re = new Int16Array(reBuf);
	var mitdata = new Uint8Array(reBuf);
	for(var i = 0;i < mitdata.length;i++){
		mitdata[i] = data[i + 2000];
	}
	var f32 = new Float32Array(re.length);
	for(var i = 0;i < re.length;i++)
		f32[i] = re[i];
	window.voxelDataTest = f32;
	console.log(f32);
});