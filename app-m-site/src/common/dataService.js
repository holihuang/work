/**
 * 所有访问数据的接口调用该服务
 */
import $ from 'jquery';

var getJSONP = (url,data) =>{

		return new Promise((resolve, reject) => {
			getData(url, data, "POST", "jsonp",
			resolve, reject);
		});
	}
	var  getJSON = (url,data) =>{

		data.appVersion = '2.0.1';
		data.osVersion = data.osVersion || 'PC';

		return new Promise((resolve, reject) => {
			getData(url, data, "POST", "json",
			resolve, reject);
		});
	}

	const getData = (url, data, method, dataType, success, error ,theOptions) => {

		var sBoundary = "---------------------------" + Date.now().toString(16);
		var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(data) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
		var options = {
			url: url,
			method: method,
			data: fd,
			dataType: dataType,
			contentType:  "multipart\/form-data; boundary=" + sBoundary,
            cache: false,
            processData:false,
            crossDomain: false,
		};
		$.extend(options, theOptions);

		var request = $.ajax(options);

		request.done(function( data ) {
			if(dataType=='json' || dataType=='jsonp'){ // dataType == json || jsonp
				if(typeof data == 'object' && typeof data.rs != 'undefined'){
					if(data.rs==1){
						if(typeof success == 'function'){
							success.call(this, data,request);
						}
					}else{
						if(typeof error == 'function'){
							const {rsdesp = '请求数据失败，请稍后再试'} = data;
							error.call(this, rsdesp,request);
						}else{
							alert(data.rsdesp);
						}
					}
				}
			}
			else{ //dataType == html
				if(typeof data == 'string' && data != 'error'){
					if(typeof success == 'function'){
						success.call(this, data,request);
					}
				}else{
					if(typeof error == 'function'){
						error.call(this, '请求数据失败，请稍后再试',jqXHR);
					}else{
						alert('请求数据失败，请稍后再试');
					}
				}
			}
		});

		request.fail(function( jqXHR, textStatus ) {
			if(jqXHR.status == 401){
				//TODO go to login page
				var url = encodeURIComponent(window.location.url);
				window.location.href= `${envCfg.loginUrl}?service=${url}`;
				return;
			}
			if(typeof error == 'function'){
				error.call(this, '请求数据失败，请稍后再试',jqXHR);
			}else{
				alert('请求数据失败，请稍后再试');
			}
		});
	}

const getDataIE = (url, data, method, dataType, success, error ,theOptions) => {
		if (!XMLHttpRequest.prototype.sendAsBinary) {
			XMLHttpRequest.prototype.sendAsBinary = function(sData) {
				// var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
				// for (var nIdx = 0; nIdx < nBytes; nIdx++) {
				// ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
				// }
				// this.send(ui8Data);
				this.send(sData);
			};
		}
		function onreadystatechange () {
			var request = this;
			if (this.readyState==4){// 4 = "loaded"
				if (this.status==200){// 200 = OK
					var data =this.responseText;
					if(dataType=='json' || dataType=='jsonp'){ // dataType == json || jsonp
						 data = JSON.parse(data);
						if(typeof data == 'object' && typeof data.rs != 'undefined'){
							if(data.rs==1){
								if(typeof success == 'function'){
									success.call(this, data, request);
								}
							}else{
								if(typeof error == 'function'){
									error.call(this, data.rsdesp,request);
								}else{
									alert(data.rsdesp);
								}
							}
						}
					}
					else{ //dataType == html
						if(typeof data == 'string' && data != 'error'){
							if(typeof success == 'function'){
								success.call(this, data,request);
							}
						}else{
							if(typeof error == 'function'){
								error.call(this, '请求数据失败，请稍后再试',jqXHR);
							}else{
								alert('请求数据失败，请稍后再试');
							}
						}
					}
				}else{
					if(typeof error == 'function'){
						error.call(this, '请求数据失败，请稍后再试',jqXHR);
					}else{
						alert('请求数据失败，请稍后再试');
					}
				}
			}
		}
		var sBoundary = "---------------------------" + Date.now().toString(16);
		var fd = "Content-Disposition: form-data; name=\"" + 'data' + "\"\r\n\r\n" + JSON.stringify(data) + "\r\n";
        fd = "--" + sBoundary + "\r\n" + fd + "--" + sBoundary + "--\r\n";
		var oAjaxReq = new XMLHttpRequest();
		oAjaxReq.onreadystatechange = onreadystatechange;
		oAjaxReq.open("post", url, true);
		oAjaxReq.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + sBoundary);
		oAjaxReq.sendAsBinary(fd);

	}

module.exports =  getJSON;
