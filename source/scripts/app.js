/**
 * Created by linzx on 2017/7/28.
 */


/**
 * local     ：本地环境。连接本地的后端接口（127.0.0.1），用于本地测试。         【后端开发人员】、【测试人员】
 * local_test：本地调试。给前端人员本地调试代码用，使用模拟的json数据进行测试    【前端开发人员】
 * daily_ued ：日常环境（UED）。给前端使用的日常服务器接口【前端开发人员】       【前端开发人员】
 * daily     ：日常环境。连接日常服务器的接口                                    【配置员】
 * product   ：生产环境。用于正式上线时候，给客户用的配置                        【配置员】
 */
const active = "daily_ued";
var api_domain, daily_test, local_test;
//配置项对应的后端接口
if (active === "product") {
	api_domain = ""; //线上API端口，待配置
} else if (active === "daily_ued") {
	 api_domain = "192.168.200.161:8080";
	// api_domain = "192.168.118.157:8080";//王俊明
	// api_domain = "192.168.31.149:8080";//鲁艳红
	//   api_domain = "192.168.31.163:8095"; //轩腾飞
	// api_domain = "192.168.31.141:8080"; //陈强
	// api_domain = "192.168.118.93:8083";//李小方
	// api_domain = "192.168.118.106:8080";//徐俊
	// api_domain = "192.168.31.218:8088";//洪梵

	// daily_test = true; //日常服务器的标识s
} else if (active === "daily") {
	api_domain = "192.168.200.170:8080";
	daily_test = true; //日常服务器的标识
} else if (active === "local_test") {
	api_domain = "";
	local_test = true; //使用本地json测试的标识
} else if (active === "local") {
	// api_domain = "192.168.31.197:8080";
	api_domain = "127.0.0.1:8080";
} else {
	alert("配置错误，请指定正确的运行环境");
}

// var devEnvironment = true;
