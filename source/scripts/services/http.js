/**
 * 封装http服务
 * Created by dww on 2017/2/10.
 */

//http.type({//type目前支持get,post,put,delete
//	url : //接口地址
//	data : //数据对象(get之类不需要的可缺省)
//	successFn : //成功方法
//	errorFn : //通用失败方法
//	speErrorFn : //特殊失败方法(主要针对error_response可能需要的特殊处理,不需要的可缺省)
//})

app.service('http', function($rootScope,$http) {
	
	/**get
	 * 
	 * @param url
	 * @param successFn
	 * @param errorFn
	 * @param speErrorFn
	 * 
	 */
	this.get = function(obj){
		obj.type = "get";
		
		//调用公用方法
		return ajaxService(obj)
	}
	
	/**post
	 * 
	 * @param url
	 * @param data
	 * @param successFn
	 * @param errorFn
	 * @param speErrorFn
	 * 
	 */
	this.post = function(obj){
		obj.type = "post";
		
		//调用公用方法
		return ajaxService(obj)
	}
	
	/**put
	 * 
	 * @param url
	 * @param data
	 * @param successFn
	 * @param errorFn
	 * @param speErrorFn
	 * 
	 */
	this.put = function(obj){
		obj.type = "put";
		
		//调用公用方法
		return ajaxService(obj)
	}
	
	/**delete
	 * 
	 * @param url
	 * @param successFn
	 * @param errorFn
	 * @param speErrorFn
	 * 
	 */
	this.delete = function(obj){
		obj.type = "delete";
		
		//调用公用方法
		return ajaxService(obj)
	};
	
	function ajaxService(httpObj){
		let type = httpObj.type,
			url = httpObj.url,
			data = httpObj.data||{},
			successFn = httpObj.successFn || function(){},
			errorFn = httpObj.errorFn || function(res){
										 	layer.alert(res.data.error_response?($rootScope.errorCode[res.data.error_response.code] ? $rootScope.errorCode[res.data.error_response.code] : "未知错误!") : "获取数据失败！", {
											skin: 'layer-alert-themecolor' //样式类名
											});
										 },
			speErrorFn = httpObj.speErrorFn;
			
		
		
		return new Promise(function(resolve,reject){
			$http[type](url,data).then(
				function(res){
					if(res.data.error_response !== undefined){
						speErrorFn ? speErrorFn(res) : errorFn(res);						
					}else{
						successFn(res);
					}
					resolve();
				},
				function(res){
					errorFn(res);
					reject();
				}
			);
		});
	}
})

