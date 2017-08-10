/**
 * Created by linzx on 2017/6/22.
 */
const active = "daily_ued";
let api_domain, daily_test, local_test;
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

	  daily_test = true; //日常服务器的标识s
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
api_domain = window.api_domain || api_domain;

const url = {
    //用户退出
    login_out: 'http://' + api_domain + '/api/aps/login/loginOut',
    //获得所有的方案列表
    'all_schedule_list': "http://" + api_domain + '/api/data/analysis/scheme/getAllSchemeInfo',
    //获取所有的设备类型
    'get_all_equipmentType': "http://" + api_domain + '/api/equipmentType/getAllEquipmentType',
    //获取所有的设备
    'get_all_equipment': "http://" + api_domain + "/api/production/getProductionUnit",
    //根据条件查询已保存设备类型的OEE
    'result_equipment_oee': "http://" + api_domain + '/api/data/analysis/forecastOEE/result',
    //根据条件查询临时保存设备类型的OEE
    'temp_equipment_oee': "http://" + api_domain + '/api/data/analysis/forecastOEE/temp',
    //根据临时设备类型查询二级页面
    'temp_equipmentList_by_equipmentType': "http://" + api_domain + '/api/data/analysis/forecastOEE/tmp/info',
    //根据结果表类型查询二级页面
    'result_equipmentList_by_equipmentType': "http://" + api_domain + '/api/data/analysis/forecastOEE/result/info',
    //可读地点
    readable_location: 'http://' + api_domain + '/api/location/cache/readable',
    //可写地点
    test_writable: 'http://' + api_domain + '/api/schedule/location',
    //请求方案时，获取临时表的最小时间
    min_scheme_time: 'http://' + api_domain + '/api/data/analysis/TimeLine/get/time/line',
    //重排页面获取所有排程人员
    get_all_schedule_person: 'http://' + api_domain + '/api/history/user/list',
    //获取某段时间内所有历史重排的记录
    get_history_list: 'http://' + api_domain + '/api/history/reason/list',
    //获取某个排程的详细信息
    get_schedule_detail: 'http://' + api_domain + '/api/history/schedule/list',
    //获取某个排程的某个派工单的详细信息
    get_schedule_task_detail: ['http://' + api_domain + '/api/history/schedule/','/detail'],

};

export default url;
