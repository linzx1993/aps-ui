/**
 * Created by linzx on 2017/7/28.
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
	// api_/domain = "192.168.31.163:8088"; //轩腾飞
	// api_domain = "192.168.31.141:8080"; //陈强
	// api_domain = "192.168.118.93:8083";//李小方
	// api_domain = "192.168.118.106:8080";//徐俊

	// daily_test = true; //日常服务器的标识s
} else if (active === "daily") {
	api_domain = "192.168.200.170:8080";
	daily_test = true; //日常服务器的标识
} else if (active === "local_test") {
	api_domain = "";
	local_test = true; //使用本地json测试的标识
} else if (active === "local") {
	api_domain = "127.0.0.1:8080";
} else {
	alert("配置错误，请指定正确的运行环境");
}