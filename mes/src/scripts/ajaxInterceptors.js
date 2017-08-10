import axios from "axios"

(() => {
	//从URL中取出token
	let thisUrl = window.location.href;
	if(thisUrl.indexOf("token")>-1){
		let tIndex = thisUrl.indexOf("token=");
		let thisToken = thisUrl.substring(tIndex+6,tIndex+22);

		if(thisToken.indexOf("token") === -1){
			localStorage.setItem("token",thisToken)
		}
	}

	//请求拦截，添加统一的header
	axios.interceptors.request.use(
		config => {
			config.headers['Authorization'] = localStorage.getItem("token") || "";
			config.headers['redirectUrl'] = window.location.origin + window.location.pathname;
			config.headers['X-Requested-With'] = 'XMLHttpRequest';
			return config;
		},
		err => {
			return Promise.reject(err);
		}
	);

	//响应拦截，做单点登录跳转和success-response的脱壳
	axios.interceptors.response.use(
		response => {
			if (response.status === 200 && response.data.error_response) {
				if(response.data.error_response.code === 1){
					window.location.href = response.data.error_response.sub_msg;
					return response;
				}
			}

			if (response.status === 200 && response.data.success_response !== undefined){
				response.data = response.data.success_response;
			}
			return response;
		},
		error => {
//			if (error.response) {
//				switch (error.response.status) {
//					case 401:
//						// 返回 401 清除token信息并跳转到登录页面
//						store.commit(types.LOGOUT);
//						router.replace({
//							path: 'login',
//							query: {redirect: router.currentRoute.fullPath}
//						})
//				}
//			}
			return Promise.reject(error.response.data)   // 返回接口返回的错误信息
		}
	);
})()
