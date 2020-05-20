/**
 * 所有访问数据的接口调用该服务
 */

	const getJSON = (url, data, theOptions) =>{
		//FIXME for test & put your own project url
		// if(url.startsWith('/mr')){
		// 	url = url.replace('/mr', '/api');
		// }
		return fetchJSON(url, data, "POST", "json", theOptions);
	}
	const fetchJSON = (url, data, method, dataType, theOptions)=> {
		let params = '';
		//设置options
		let contentType = '*/*';
		if(typeof data == 'string'){
			contentType  = 'application/json';
		} else {
			contentType = "application/x-www-form-urlencoded; charset=UTF-8"
		}
		let options = {
			method: method,
			headers: {
					'Accept':'application/json, text/javascript, */*; q=0.01',
				    'Content-Type': contentType
				  },
			credentials: 'same-origin',  // 相同域名下带cookie
			cache:'no-cache'
		};

		// 为fetch添加body信息
		if(method != 'GET' && method != 'HEAD'){    // 判断是否含有body信息
			if( data ){
				if(typeof data == 'string'){
					options.body = data;
				} else {
					let tmp = [];
					Object.keys(data)
					    .map(k => {
					    	if( typeof data[k] == 'object'){
					    	//  对于数组很蛋疼，需要将数组转为特定字符串(根据后端对接收数组的情况而定)再放入body，否则将会进行Array.toString()用逗号连接数组成员，如果后端恰好需要逗号连接的数组成员，请注释掉该if语句，只保留else语句内容
						    	if (data[k]) {
						    		data[k].map(array=>{
					    			let arr = k+'[]='+array; 		//"array[] = 成员"
					    			tmp.push(arr);})
						    	}
					    	}else {
					    		let arr = k + '=' + data[k];
					    		tmp.push(arr)
					    	}
					    })
					let params = tmp.join('&');
					// console.log(params,'params')
					options.body = params;
				}
			}
		}
		options = Object.assign(options, theOptions);   //合并自定义参数，自此请求开始前的设置已经结束，接下来发起请求

		//fetch不会对400 500等服务器返回错误reject，需要自己进行判断，抛出error
		let checkStatus = (response)=> {
		  if (response.status >= 200 && response.status < 300) {
		    return response
		  } else {
		    let error = new Error(response.statusText)
		    error.response = response
		    throw error
		  }
		}
		//调用 response.json() 或者 response.text() 得到返回数据
		let parseJSON = (response)=> {
			if(dataType=='json'){ // dataType == json
		 		return response.json();
			}else{  //dataType == html
		 		return response.text();
			}
		}
		//在fetch外包一层Promise，拿到resolve和reject
		var defer = new Promise((resolve, reject) => {
			fetch(url, options)         //request
			.then(checkStatus)			//check status
			.then(parseJSON)			//parse data
			.then(data => {
				if(dataType=='json'){ // dataType == json
					if(typeof data == 'object' && typeof data.statusCode != 'undefined'){  //在此可以设置自己项目的成功标志位字段，如flag
						if(data.statusCode==0){
							if(typeof resolve == 'function'){
								resolve.call(this, data.data, data);    // data为返回的整个数据，在此可以设置自己项目的数据字段，如data
							}
						}else{
							if(typeof reject == 'function'){
								reject.call(this, data.message, data);	// 在此可以设置错误返回数据字段，如message
							}else{
								alert(data.message);
							}
						}
					}
				}
				else{ //dataType == html
					if(typeof data == 'string' && data != 'error'){
						if(typeof resolve == 'function'){
							resolve.call(this, data);
						}
					}else{
						if(typeof reject == 'function'){
							reject.call(this, '请求数据失败，请稍后再试',data);
						}else{
							alert('请求数据失败，请稍后再试');
						}
					}
				}
			})
			.catch(error => {
						//捕获异常
						if(error.response && error.response.status == 401){
							//TODO go to login page
							window.location.href="#/login";
							return;
						}
						if(typeof reject == 'function'){
							reject.call(this, '请求数据失败，请稍后再试',error);
						}else{
							alert('请求数据失败，请稍后再试');
						}
				})
			})
			return defer
	}

module.exports =  getJSON;
