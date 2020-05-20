navigator.mediaDevices.getUserMedia({
	audio: true
}, function(stream) {
	alert('123');
	mystatus.innerHTML = '哈哈哈成功了';
	audioContext = window.AudioContext || window.webkitAudioContext;
	context = new audioContext(); //创建一个管理、播放声音的对象
	liveSource = context.createMediaStreamSource(stream); //将麦克风的声音输入这个对象
	var levelChecker = context.createScriptProcessor(4096,1,1); //创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
	liveSource.connect(levelChecker); //将该分析对象与麦克风音频进行连接
	levelChecker.onaudioprocess = function(e) { //开始处理音频
		var buffer = e.inputBuffer.getChannelData(0); //获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
		//创建变量并迭代来获取最大的音量值
		var maxVal = 0; 
		for (var i = 0; i < buffer.length; i++) {
			if (maxVal < buffer[i]) {
				maxVal = buffer[i];
			}
		}
		//显示音量值
		mystatus.innerHTML = "您的音量值："+Math.round(maxVal*100);
		if(maxVal>.5){
			//当音量值大于0.5时，显示“声音太响”字样，并断开音频连接
			mystatus.innerHTML = "您的声音太响了!!";
			liveSource.disconnect(levelChecker);
		}
	};
}, function() {
	mystatus.innerHTML = '获取音频好像出了点问题';
})